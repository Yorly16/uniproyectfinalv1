"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LogOut, User, Settings, Bell, Search, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

interface User {
  email: string
  name: string
  university: string
  career: string
  avatar: string
  isLoggedIn: boolean
  loginTime: string
}

export function DashboardNavbar() {
  const router = useRouter()
  const { user, userProfile, signOut, loading } = useAuth()
  const [notificationCount, setNotificationCount] = useState(0)
  const [incomingRequests, setIncomingRequests] = useState<any[]>([])
  const [requestsLoading, setRequestsLoading] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const loadIncomingRequests = async () => {
      if (!user) return
      try {
        setRequestsLoading(true)
        const { data: myProjects, error: projError } = await supabase
          .from('projects')
          .select('id, name')
          .eq('created_by', user.id)

        if (projError) throw projError

        const projectIds = (myProjects || []).map((p) => p.id)
        if (projectIds.length === 0) {
          setIncomingRequests([])
          setNotificationCount(0)
          return
        }

        const { data: collabs, error: collabError } = await supabase
          .from('collaborations')
          .select(`
            *,
            projects:projects(*),
            requester:users!collaborations_collaborator_id_fkey (id, full_name, email, avatar_url)
          `)
          .in('project_id', projectIds)
          .order('created_at', { ascending: false })

        if (collabError) throw collabError

        setIncomingRequests(collabs || [])
        setNotificationCount((collabs || []).filter((c: any) => c.status === 'pending').length)
      } catch (err) {
        console.error('Error cargando solicitudes entrantes:', err)
      } finally {
        setRequestsLoading(false)
      }
    }

    loadIncomingRequests()
  }, [user])

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const respondToRequest = async (id: string, status: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('collaborations')
        .update({ status })
        .eq('id', id)

      if (error) throw error

      // Crear conversación al aceptar (si no existe)
      if (status === 'accepted') {
        // Buscar la solicitud en estado local para obtener datos
        const req = incomingRequests.find((r: any) => r.id === id)

        let projectId = req?.project_id
        let collaboratorId = req?.requester?.id ?? req?.collaborator_id

        // Fallback: si no está en memoria, cargar de la BD
        if (!projectId || !collaboratorId) {
          const { data: collab, error: collabErr } = await supabase
            .from('collaborations')
            .select('project_id, collaborator_id')
            .eq('id', id)
            .maybeSingle()
          if (collabErr) throw collabErr
          projectId = collab?.project_id
          collaboratorId = collab?.collaborator_id
        }

        // Verificar si ya existe conversación
        const { data: convExisting, error: selError } = await supabase
          .from('conversations')
          .select('id')
          .eq('collaboration_id', id)
          .maybeSingle()
        if (selError) throw selError

        if (!convExisting) {
          const { error: convError } = await supabase
            .from('conversations')
            .insert({
              collaboration_id: id,
              project_id: projectId,
              owner_id: user!.id,
              collaborator_id: collaboratorId || '',
              is_open: true,
              last_message_at: new Date().toISOString()
            })
          if (convError) throw convError
        }
      }

      toast.success(status === 'accepted' ? 'Solicitud aceptada' : 'Solicitud rechazada')

      setIncomingRequests(prev =>
        prev.map(c => (c.id === id ? { ...c, status } : c))
      )
      setNotificationCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error al responder solicitud:', err)
      toast.error('No se pudo actualizar la solicitud.')
    }
  }

  if (loading || !user) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/logo.png" 
                alt="Uni Project Logo" 
                width={32} 
                height={32} 
                className="h-8 w-8"
              />
              <span className="text-xl font-bold text-balance">Uni Project</span>
            </Link>
          </div>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/logo.png" 
              alt="Uni Project Logo" 
              width={32} 
              height={32} 
              className="h-8 w-8"
            />
            <span className="text-xl font-bold text-balance">Uni Project</span>
          </Link>

          {/* Barra de búsqueda rápida */}
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar proyectos..." 
              className="pl-10 w-64"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost">Explorar Proyectos</Button>
          </Link>

          <Link href="/dashboard/upload">
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Crear Proyecto
            </Button>
          </Link>

          {/* Botón de cerrar sesión visible */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>

          {/* Notificaciones: usar DropdownMenu para que se despliegue al hacer click */}
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                    {notificationCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent align="end" sideOffset={8} className="w-80 p-0">
              <div className="border-b px-4 py-2 text-sm font-medium">
                Actividad Reciente
              </div>

              <div className="max-h-80 overflow-y-auto">
                {requestsLoading ? (
                  <div className="px-4 py-6 text-sm text-muted-foreground">
                    Cargando solicitudes...
                  </div>
                ) : (
                  <>
                    {incomingRequests.filter((c: any) => c.status === "pending").length === 0 ? (
                      <div className="px-4 py-6 text-sm text-muted-foreground">
                        No tienes solicitudes pendientes por ahora.
                      </div>
                    ) : (
                      incomingRequests
                        .filter((c: any) => c.status === "pending")
                        .slice(0, 5)
                        .map((req: any) => (
                          <div key={req.id} className="px-4 py-3 space-y-2">
                            <div className="text-sm">
                              <span className="font-medium">
                                {req.requester?.full_name || req.requester?.email || "Usuario"}
                              </span>
                              <span className="text-muted-foreground"> solicitó colaborar en </span>
                              <span className="font-medium">
                                {req.projects?.name || "Tu proyecto"}
                              </span>
                            </div>

                            {req.message && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {req.message}
                              </p>
                            )}

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  respondToRequest(req.id, "accepted")
                                }}
                              >
                                Aceptar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  respondToRequest(req.id, "rejected")
                                }}
                              >
                                Rechazar
                              </Button>
                            </div>
                          </div>
                        ))
                    )}
                  </>
                )}
              </div>

              <div className="border-t px-4 py-2">
                <Link href="/dashboard#activity">
                  <Button variant="outline" size="sm" className="w-full">
                    Ver toda la actividad
                  </Button>
                </Link>
              </div>
            </PopoverContent>
          </Popover>

          {/* Menú de usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-500 text-white">
                    {getInitials(userProfile.full_name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{userProfile.full_name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  {userProfile.developer_profile && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>{userProfile.developer_profile.career}</span>
                      {userProfile.developer_profile.university && (
                        <>
                          <span>•</span>
                          <span>{userProfile.developer_profile.university}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Mi Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
