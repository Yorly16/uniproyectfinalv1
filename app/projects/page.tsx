"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useCollaborations } from "@/hooks/use-collaborations"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChatDialog } from "@/components/chat-dialog"
import { MessageCircle, Users, ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Collaboration } from "@/lib/types"

// Navbars (cargados dinámicamente para evitar SSR issues)
const GeneralNavbar = dynamic(() => import("@/components/navbar").then(m => m.Navbar), { ssr: false })
const StudentNavbar = dynamic(() => import("@/components/dashboard-navbar").then(m => m.DashboardNavbar), { ssr: false })
const CollaboratorNavbar = dynamic(() => import("@/components/collaborator-navbar").then(m => m.CollaboratorNavbar), { ssr: false })

export default function ProjectsChatPage() {
  const router = useRouter()
  const { user, userProfile, loading: authLoading } = useAuth()
  const { collaborations, loading } = useCollaborations()
  const [chatOpen, setChatOpen] = useState(false)
  const [selectedCollab, setSelectedCollab] = useState<any | null>(null)
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})

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
  // - Si soy colaborador, mostrar mis colaboraciones filtradas a las aceptadas
  const collabsToShow = userProfile?.user_type === 'student'
    ? ownerAccepted
    : collaborations.filter(c => c.status === 'accepted')

  // IDs de colaboraciones para el polling
  const collabIds = collabsToShow.map(c => c.id).join(',')

  useEffect(() => {
    if (!user || collabsToShow.length === 0) {
      setUnreadCounts({})
      return
    }

    const loadUnread = async () => {
      const next: Record<string, number> = {}
      for (const c of collabsToShow) {
        // Buscar conversación por colaboración
        const { data: conv } = await supabase
          .from('conversations')
          .select('id')
          .eq('collaboration_id', c.id)
          .maybeSingle()

        if (!conv?.id) {
          next[c.id] = 0
          continue
        }

        // Contar mensajes no leídos (del otro usuario)
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .neq('sender_id', user.id)
          .is('read_at', null)

        next[c.id] = count || 0
      }
      setUnreadCounts(next)
    }

    // Carga inicial + polling cada 5s
    loadUnread()
    const interval = setInterval(loadUnread, 5000)
    return () => clearInterval(interval)
  }, [user?.id, collabIds])

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
                  ? 'Chat de Colaboraciones Aceptadas (Mis Proyectos)'
                  : 'Chat de Mis Colaboraciones Aceptadas'}
              </h1>
              <p className="text-muted-foreground mt-2">
                Conversa con tus equipos de proyecto. Solo aparecen las colaboraciones aceptadas.
              </p>
            </section>


            {/* Estado vacío */}
            {collabsToShow.length === 0 ? (
              <div className="text-center py-24">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">No hay colaboraciones aceptadas</h2>
                <p className="text-muted-foreground mb-6">
                  {userProfile?.user_type === 'student'
                    ? 'Cuando aceptes solicitudes en tus proyectos, aparecerán aquí para chatear.'
                    : 'Explora proyectos y envía solicitudes. Cuando te acepten, aparecerán aquí.'}
                </p>
                <Button onClick={() => router.push(userProfile?.user_type === 'student' ? "/dashboard" : "/collaborator")}>
                  {userProfile?.user_type === 'student' ? 'Ir a mi panel' : 'Ir al panel de colaborador'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {collabsToShow.map((c) => (
                  <div
                    key={c.id}
                    className="group flex items-center justify-between rounded-xl border bg-card/50 px-4 py-3 transition-colors hover:bg-accent/40"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold">{c.projects?.name || "Proyecto"}</h3>
                        <Badge variant="secondary" className="text-xs">{c.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {userProfile?.user_type === 'student'
                          ? `Con: ${c.collaborator?.full_name || c.collaborator?.email || 'Colaborador'}`
                          : `Con: ${c.projects?.owner?.full_name || c.projects?.owner?.email || 'Propietario'}`
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Desde {new Date(c.started_at ?? c.created_at).toLocaleDateString("es-ES")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/projects/${c.project_id}`)}>
                        Ver proyecto
                      </Button>
                      <div className="relative">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedCollab(c)
                            setChatOpen(true)
                          }}
                          className="gap-2"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Abrir chat
                        </Button>
                        {unreadCounts[c.id] > 0 && (
                          <span
                            title={`${unreadCounts[c.id]} mensajes nuevos`}
                            className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-none px-1 rounded-full"
                          >
                            {unreadCounts[c.id]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Dialog de chat */}
            <ChatDialog open={chatOpen} onOpenChange={setChatOpen} collaboration={selectedCollab} />
          </>
        )}
      </main>
    </div>
  )
}