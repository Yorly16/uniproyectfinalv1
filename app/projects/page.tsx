"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useCollaborations } from "@/hooks/use-collaborations"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Users, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Collaboration } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { useChat } from "@/hooks/use-chat"

// Navbars (cargados dinámicamente para evitar SSR issues)
const GeneralNavbar = dynamic(() => import("@/components/navbar").then(m => m.Navbar), { ssr: false })
const StudentNavbar = dynamic(() => import("@/components/dashboard-navbar").then(m => m.DashboardNavbar), { ssr: false })
const CollaboratorNavbar = dynamic(() => import("@/components/collaborator-navbar").then(m => m.CollaboratorNavbar), { ssr: false })

export default function ProjectsChatPage() {
  const router = useRouter()
  const { user, userProfile, loading: authLoading } = useAuth()
  const { collaborations, loading } = useCollaborations()
  const [selectedCollab, setSelectedCollab] = useState<any | null>(null)
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const [searchTerm, setSearchTerm] = useState("")

  // Hook de chat para gestionar conversación y mensajes en el panel derecho
  const { ensureConversation, conversation, loadMessages, messages, sendMessage, setConversation } = useChat()
  const [messageInput, setMessageInput] = useState("")
  const [lastTimes, setLastTimes] = useState<Record<string, string | null>>({})
  // Para auto-scroll del panel de mensajes
  const [messagesEl, setMessagesEl] = useState<HTMLDivElement | null>(null)

  // Estado para colaboraciones aceptadas del dueño (estudiante)
  const [ownerAccepted, setOwnerAccepted] = useState<any[]>([])
  const [ownerLoading, setOwnerLoading] = useState(false)

  // Cargar colaboraciones aceptadas de mis proyectos (si soy estudiante)
  useEffect(() => {
    const loadOwnerAccepted = async () => {
      try {
        setOwnerLoading(true)
        // Obtener mis proyectos
        const { data: myProjects } = await supabase
          .from('projects')
          .select('id')
          .eq('created_by', user!.id)

        const projectIds = (myProjects || []).map(p => p.id)
        if (projectIds.length === 0) {
          setOwnerAccepted([])
          return
        }

        // Obtener colaboraciones aceptadas de esos proyectos
        const { data: collabs } = await supabase
          .from('collaborations')
          .select(`
            *,
            projects (
              *,
              project_authors (*)
            ),
            collaborator:users!collaborations_collaborator_id_fkey (id, full_name, email, avatar_url)
          `)
          .in('project_id', projectIds)
          .eq('status', 'accepted')
          .order('created_at', { ascending: false })

        setOwnerAccepted(collabs || [])
      } catch (e) {
        console.error('Error cargando colaboraciones aceptadas del dueño:', e)
      } finally {
        setOwnerLoading(false)
      }
    }

    if (!authLoading && user && userProfile?.user_type === 'student') {
      loadOwnerAccepted()
    }
  }, [authLoading, user, userProfile?.user_type])

  // Define el href de regreso según el tipo de usuario (con un fallback seguro)
  const backHref = authLoading
    ? "/dashboard"
    : (userProfile?.user_type === "student" ? "/dashboard" : "/collaborator")
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  // Render del navbar condicional
  const NavbarSwitch = () => {
    if (authLoading) return <GeneralNavbar />
    if (user && userProfile?.user_type === "student") return <StudentNavbar />
    if (user && userProfile?.user_type === "collaborator") return <CollaboratorNavbar />
    return <GeneralNavbar />
  }

  const isLoading = authLoading || loading || ownerLoading

  // Colaboraciones a mostrar:
  // - Si soy estudiante (dueño), mostrar las aceptadas de mis proyectos
  //   y también las colaboraciones aceptadas donde YO fui aceptado en proyectos ajenos.
  // - Si soy colaborador, mostrar mis colaboraciones filtradas a las aceptadas
  const collabsToShow = userProfile?.user_type === 'student'
    ? [
        ...ownerAccepted,
        ...collaborations.filter(c => c.status === 'accepted')
      ]
    : collaborations.filter(c => c.status === 'accepted')

  // IDs de colaboraciones para el polling
  const collabIds = collabsToShow.map(c => c.id).join(',')

  // Filtrado por buscador (por nombre de contraparte o nombre de proyecto)
  const filteredCollabs = collabsToShow.filter((c) => {
    const counterpart =
      userProfile?.user_type === 'student'
        ? (c.collaborator?.full_name || c.collaborator?.email || "")
        : (c.projects?.owner?.full_name || c.projects?.owner?.email || "")
    const projectName = c.projects?.name || ""
    const q = searchTerm.toLowerCase().trim()
    return !q || counterpart.toLowerCase().includes(q) || projectName.toLowerCase().includes(q)
  })

  // Ordenar por última actividad (last_message_at / updated_at / created_at)
  const sortedCollabs = [...filteredCollabs].sort((a, b) => {
    const ta = new Date(lastTimes[a.id] ?? a.updated_at ?? a.created_at).getTime()
    const tb = new Date(lastTimes[b.id] ?? b.updated_at ?? b.created_at).getTime()
    return tb - ta
  })

  useEffect(() => {
    if (!user || collabsToShow.length === 0) {
      setUnreadCounts({})
      setLastTimes({})
      return
    }

    const loadUnread = async () => {
      const next: Record<string, number> = {}
      const nextTimes: Record<string, string | null> = {}
      for (const c of collabsToShow) {
        // Buscar conversación y meta (último mensaje)
        const { data: conv } = await supabase
          .from('conversations')
          .select('id,last_message_at,updated_at')
          .eq('collaboration_id', c.id)
          .maybeSingle()

        if (!conv?.id) {
          next[c.id] = 0
          nextTimes[c.id] = null
          continue
        }

        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .neq('sender_id', user.id)
          .is('read_at', null)

        next[c.id] = count || 0
        nextTimes[c.id] = conv.last_message_at || conv.updated_at || null
      }
      setUnreadCounts(next)
      setLastTimes(nextTimes)
    }

    loadUnread()
    const interval = setInterval(loadUnread, 5000)
    return () => clearInterval(interval)
  }, [user?.id, collabIds])

  // Cuando seleccionas una colaboración, aseguro/obtengo la conversación y cargo mensajes
  useEffect(() => {
    const run = async () => {
      if (!selectedCollab) return
      const projectId = selectedCollab.project_id
      const ownerId = selectedCollab.projects?.created_by || ""
      const collaboratorId = selectedCollab.collaborator_id
      const conv = await ensureConversation({
        collaborationId: selectedCollab.id,
        projectId,
        ownerId,
        collaboratorId
      })
      if (conv?.id) {
        await loadMessages(conv.id)
      }
    }
    run()
  }, [selectedCollab, ensureConversation, loadMessages])

  // Marcar como leído al abrir conversación
  useEffect(() => {
    const markRead = async () => {
      if (!conversation?.id || !user) return
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversation.id)
        .neq('sender_id', user.id)
        .is('read_at', null)
    }
    markRead()
  }, [conversation?.id, user?.id])

  // Auto-scroll y actualización de última actividad cuando llegan mensajes
  useEffect(() => {
    if (messagesEl) {
      messagesEl.scrollTop = messagesEl.scrollHeight
    }
    if (selectedCollab && messages.length > 0) {
      const last = messages[messages.length - 1]
      setLastTimes((prev) => ({ ...prev, [selectedCollab.id]: last.created_at }))
    }
  }, [messages, selectedCollab?.id, messagesEl])

  const handleSend = async () => {
    if (!conversation?.id || !messageInput.trim()) return
    const ok = await sendMessage(conversation.id, messageInput)
    if (ok.success) setMessageInput("")
  }

  // Helper para mostrar tiempo relativo del último mensaje
  const formatRelative = (iso?: string | null) => {
    if (!iso) return ""
    const now = Date.now()
    const t = new Date(iso).getTime()
    const diff = Math.max(0, Math.floor((now - t) / 1000))
    if (diff < 60) return "Ahora"
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return "Ayer"
  }

  // Obtener nombre de contraparte y proyecto para cada item
  const getCounterpartName = (c: any) => {
    const ownerId = c.projects?.created_by
    if (user?.id === ownerId) {
      return c?.collaborator?.full_name || c?.collaborator?.email || 'Colaborador'
    } else {
      return c?.projects?.owner?.full_name || c?.projects?.owner?.email || 'Propietario'
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavbarSwitch />

      <main className="container mx-auto px-4 py-10">
        {/* Botón Volver al Panel */}
        <div className="mb-4 flex justify-end">
        <Link href={backHref}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al Panel
          </Button>
        </Link>
      </div>

        {/* Loader */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando tu centro de chat...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Encabezado minimalista */}
            <section className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">
                {userProfile?.user_type === 'student'
                  ? 'Chat de Colaboraciones Aceptadas '
                  : 'Chat de Mis Colaboraciones Aceptadas'}
              </h1>
              <p className="text-muted-foreground mt-2">
                Conversa con tus equipos de proyecto. Solo aparecen las colaboraciones aceptadas.
              </p>
            </section>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Lista de conversaciones (estilo Messenger) */}
            <section className="md:col-span-1 rounded-xl border bg-card h-[70vh] flex flex-col">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Chats</h2>
                <div className="mt-3">
                  <Input
                    placeholder="Buscar conversaciones"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Items */}
              <div className="p-2 space-y-1 overflow-y-auto flex-1">
                {sortedCollabs.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">No hay conversaciones.</div>
                ) : (
                  sortedCollabs.map((c) => {
                    const counterpart = getCounterpartName(c)
                    const projectName = c.projects?.name || "Proyecto"
                    const isActive = selectedCollab?.id === c.id
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedCollab(c)
                          // Al abrir, ponemos no leídos a 0 inmediatamente (además del marcado en backend)
                          setUnreadCounts((prev) => ({ ...prev, [c.id]: 0 }))
                        }}
                        className={`w-full text-left rounded-lg px-3 py-2 flex items-center gap-3 transition-colors ${
                          isActive ? "bg-accent/50" : "hover:bg-accent/30"
                        }`}
                      >
                        {/* Placeholder avatar con inicial */}
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                          {(counterpart?.[0] || "U").toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium truncate">{counterpart}</span>
                            <span className="text-[11px] text-muted-foreground">{formatRelative(lastTimes[c.id])}</span>
                          </div>
                          {/* Debajo del nombre, el proyecto */}
                          <div className="text-xs text-muted-foreground truncate">
                            {projectName}
                          </div>
                        </div>

                        {/* Badge de no leídos */}
                        {unreadCounts[c.id] > 0 && (
                          <span className="ml-2 bg-red-500 text-white text-[11px] px-2 py-[2px] rounded-full">
                            {unreadCounts[c.id]}
                          </span>
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            </section>

            {/* Panel de mensajes */}
            <section className="md:col-span-2 rounded-xl border bg-card flex flex-col h-[70vh]">
              {/* Header del chat */}
              <div className="p-4 border-b">
                {!selectedCollab ? (
                  <div className="text-sm text-muted-foreground">Selecciona una conversación para empezar a chatear.</div>
                ) : (
                  <>
                    <div className="font-semibold">{getCounterpartName(selectedCollab)}</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedCollab.projects?.name || "Proyecto"}
                    </div>
                  </>
                )}
              </div>

              {/* Área de mensajes */}
              <div ref={(el) => setMessagesEl(el)} className="flex-1 p-4 overflow-y-auto space-y-2 bg-muted/30">
                {!selectedCollab ? (
                  <div className="text-sm text-muted-foreground">No hay mensajes.</div>
                ) : messages.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No hay mensajes aún.</div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`max-w-[75%] p-2 rounded-lg text-sm ${
                        m.sender_id === user?.id
                          ? "bg-primary/10 ml-auto"
                          : "bg-secondary/50"
                      }`}
                    >
                      {m.content}
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {new Date(m.created_at).toLocaleString("es-ES")}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input de mensaje */}
              <div className="p-4 border-t flex gap-2">
                <Input
                  placeholder="Escribe un mensaje..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  disabled={!conversation?.id}
                />
                <Button onClick={handleSend} disabled={!conversation?.id}>Enviar</Button>
              </div>
            </section>
          </div>
          </>
        )}
      </main>
    </div>
  )
}