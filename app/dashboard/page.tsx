"use client"

import { useState, useEffect } from "react"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { StatsCard } from "@/components/stats-card"
import { MyProjectCard } from "@/components/my-project-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { mockProjects } from "@/lib/mock-data"
import { 
  FolderOpen, 
  TrendingUp, 
  Plus, 
  Users,
  Award,
  BookOpen,
  Target,
  Clock,
  AlertTriangle,
  MessageCircle,
  Star
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useProjects } from "@/hooks/use-projects"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function DashboardPage() {
  const router = useRouter()
  const { user, userProfile, loading: authLoading } = useAuth()
  const { userProjects, loading: projectsLoading } = useProjects()

  const [currentTime, setCurrentTime] = useState(new Date())
  const [sessionWarning, setSessionWarning] = useState(false)
  const [activityRequests, setActivityRequests] = useState<any[]>([])

  // Función para obtener saludo según la hora
  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Buenos días"
    if (hour < 18) return "Buenas tardes"
    return "Buenas noches"
  }

  // Asegura que myProjects exista antes de usarlo
  const myProjects = Array.isArray(userProjects) ? userProjects : []



  // Redirección basada en Supabase
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
    if (!authLoading && userProfile && userProfile.user_type !== 'student') {
      router.push('/collaborator')
    }
  }, [authLoading, user, userProfile, router])

  // Actualizar tiempo cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const loadActivity = async () => {
      if (!user) return
      try {
        const { data: myProjects, error: projError } = await supabase
          .from('projects')
          .select('id, name')
          .eq('created_by', user.id)

        if (projError) throw projError

        const projectIds = (myProjects || []).map((p) => p.id)
        if (projectIds.length === 0) {
          setActivityRequests([])
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

        setActivityRequests(collabs || [])
      } catch (err) {
        console.error('Error cargando actividad reciente:', err)
      }
    }
    loadActivity()
  }, [user])

  // Simulación: estadísticas del usuario (sin vistas/likes)
  const userStats = {
    totalProjects: myProjects.length,
    monthlyGrowth: 15.2
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Advertencia de sesión (puedes ajustar la lógica si la mantienes) */}
        {sessionWarning && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Tu sesión expirará pronto por inactividad. Haz clic en cualquier parte para mantenerla activa.
            </AlertDescription>
          </Alert>
        )}

        {/* Sección de Bienvenida Personalizada */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-xl p-6 border">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                {getGreeting()}, {(userProfile?.full_name ?? user?.email ?? 'Estudiante')}! 👋
              </h1>
              <p className="text-muted-foreground text-lg">
                Bienvenido de vuelta a tu panel de estudiante
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {userProfile?.developer_profile?.career}
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  {userProfile?.developer_profile?.university}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {/* Si quieres mostrar tiempo desde el login, podemos calcularlo cuando lo tengamos en perfil o session */}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {currentTime.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-lg font-semibold">
                {currentTime.toLocaleTimeString('es-ES', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas, Estadísticas, Tabs, etc. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/upload">
            <Button className="w-full h-16 text-left justify-start gap-3 bg-primary hover:bg-primary/90">
              <Plus className="h-5 w-5" />
              <div>
                <div className="font-semibold">Subir Proyecto</div>
                <div className="text-xs opacity-90">Comparte tu trabajo</div>
              </div>
            </Button>
          </Link>
          
          <Link href="/projects">
            <Button variant="outline" className="w-full h-16 text-left justify-start gap-3">
              <Users className="h-5 w-5" />
              <div>
                <div className="font-semibold">Explorar Colaboraciones</div>
                <div className="text-xs text-muted-foreground">Encuentra compañeros</div>
              </div>
            </Button>
          </Link>
          
          <Button variant="outline" className="w-full h-16 text-left justify-start gap-3">
            <Target className="h-5 w-5" />
            <div>
              <div className="font-semibold">Gestionar Objetivos</div>
              <div className="text-xs text-muted-foreground">Planifica tu progreso</div>
            </div>
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatsCard
            title="Proyectos Publicados"
            value={userStats.totalProjects.toString()}
            description="Total de proyectos compartidos"
            icon={FolderOpen}
          />
          <StatsCard
            title="Tendencia"
            value={`+${userStats.monthlyGrowth}%`}
            description="Crecimiento mensual"
            icon={TrendingUp}
            trend={{ value: userStats.monthlyGrowth, isPositive: true }}
          />
        </div>

        {/* Contenido Principal con Tabs */}
        {/* El resto del contenido puede permanecer igual */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="projects">Mis Proyectos</TabsTrigger>
            <TabsTrigger value="activity">Actividad Reciente</TabsTrigger>
            <TabsTrigger value="analytics">Analíticas</TabsTrigger>
          </TabsList>

          {/* Tab: Mis Proyectos */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Mis Proyectos</h2>
              <Link href="/dashboard/projects">
                <Button variant="outline">Ver Todos</Button>
              </Link>
            </div>

            {projectsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Cargando tus proyectos...</p>
                </div>
              </div>
            ) : myProjects.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent className="space-y-4">
                  <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">¡Aún no has subido ningún proyecto!</h3>
                    <p className="text-muted-foreground mb-4">
                      Comparte tu primer proyecto y empieza a conectar con la comunidad
                    </p>
                    <Link href="/dashboard/upload">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Subir Proyecto
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myProjects.map((project) => (
                  <MyProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab: Actividad Reciente */}
          <TabsContent value="activity" className="space-y-6">
            <h2 className="text-2xl font-bold">Actividad Reciente</h2>
            
            <div className="space-y-4">
              {activityRequests.length === 0 ? (
                <Card>
                  <CardContent className="p-4 text-sm text-muted-foreground">
                    Aún no hay solicitudes de colaboración en tus proyectos.
                  </CardContent>
                </Card>
              ) : (
                activityRequests.map((req) => (
                  <Card key={req.id}>
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className="flex-shrink-0">
                        <MessageCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {req.requester?.full_name || req.requester?.email || 'Usuario'} solicitó colaborar en "{req.projects?.name || 'Proyecto'}"
                        </p>
                        {req.message && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Mensaje: {req.message}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          {req.status === 'pending' ? (
                            <>
                              <Button
                                size="sm"
                                onClick={async () => {
                                  const reply = window.prompt('Mensaje para el solicitante (opcional):', '') ?? ''
                                  try {
                                    let combinedMessage = req.message || ''
                                    if (reply.trim()) {
                                      combinedMessage = (combinedMessage ? combinedMessage + '\n\n' : '') + `Respuesta del estudiante: ${reply.trim()}`
                                    }
                                    const { error } = await supabase
                                      .from('collaborations')
                                      .update({
                                        status: 'accepted',
                                        started_at: new Date().toISOString(),
                                        updated_at: new Date().toISOString(),
                                        message: combinedMessage || req.message
                                      })
                                      .eq('id', req.id)
                                    if (error) throw error

                                    // Crear conversación si no existe
                                    const { data: convExisting } = await supabase
                                      .from('conversations')
                                      .select('id')
                                      .eq('collaboration_id', req.id)
                                      .maybeSingle()

                                    if (!convExisting) {
                                      const { error: convError } = await supabase
                                        .from('conversations')
                                        .insert({
                                          collaboration_id: req.id,
                                          project_id: req.project_id,
                                          owner_id: user!.id,
                                          collaborator_id: req.requester?.id || '',
                                          is_open: true,
                                          last_message_at: new Date().toISOString()
                                        })
                                      if (convError) throw convError
                                    }

                                    setActivityRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'accepted', message: combinedMessage || r.message } : r))
                                    toast.success('Colaboración aceptada')
                                  } catch (e: any) {
                                    console.error(e)
                                    toast.error(e.message || 'Error al aceptar')
                                  }
                                }}
                              >
                                Aceptar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  const reply = window.prompt('Motivo de rechazo (opcional):', '') ?? ''
                                  try {
                                    let combinedMessage = req.message || ''
                                    if (reply.trim()) {
                                      combinedMessage = (combinedMessage ? combinedMessage + '\n\n' : '') + `Respuesta del estudiante: ${reply.trim()}`
                                    }
                                    const { error } = await supabase
                                      .from('collaborations')
                                      .update({
                                        status: 'rejected',
                                        updated_at: new Date().toISOString(),
                                        message: combinedMessage || req.message
                                      })
                                      .eq('id', req.id)
                                    if (error) throw error
                                    setActivityRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'rejected', message: combinedMessage || r.message } : r))
                                    toast.success('Colaboración rechazada')
                                  } catch (e: any) {
                                    console.error(e)
                                    toast.error(e.message || 'Error al rechazar')
                                  }
                                }}
                              >
                                Rechazar
                              </Button>
                            </>
                          ) : (
                            <Badge variant="secondary">
                              {req.status === 'accepted' ? 'Aceptada' : req.status === 'rejected' ? 'Rechazada' : req.status === 'completed' ? 'Completada' : 'Pendiente'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Tab: Analíticas */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Analíticas</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Proyecto más popular (solo contactos) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Proyecto Más Popular
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h3 className="font-semibold">Sistema de IA para Recomendaciones</h3>
                    <div className="grid grid-cols-1 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-500">8</p>
                        <p className="text-xs text-muted-foreground">Contactos</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
