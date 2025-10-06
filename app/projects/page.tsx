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

  const isLoading = authLoading || loading

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
              <h1 className="text-3xl font-bold tracking-tight">Chat de Colaboraciones</h1>
              <p className="text-muted-foreground mt-2">
                Conversa con tus equipos de proyecto. El chat se habilita cuando tu colaboración ha sido aceptada.
              </p>
            </section>


            {/* Estado vacío */}
            {collaborations.length === 0 ? (
              <div className="text-center py-24">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Aún no tienes colaboraciones</h2>
                <p className="text-muted-foreground mb-6">
                  Explora proyectos interesantes y solicita unirte para empezar a chatear.
                </p>
                <Button onClick={() => router.push("/collaborator")}>Ir al panel de colaborador</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {collaborations.map((c) => (
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
                        Desde {new Date(c.started_at ?? c.created_at).toLocaleDateString("es-ES")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/projects/${c.project_id}`)}>
                        Ver proyecto
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (c.status === "accepted") {
                            setSelectedCollab(c)
                            setChatOpen(true)
                          } else {
                            alert("El chat está disponible cuando la colaboración es aceptada.")
                          }
                        }}
                        className="gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Abrir chat
                      </Button>
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