"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CollaboratorNavbar } from "@/components/collaborator-navbar"
import { ProjectCard } from "@/components/project-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockProjects } from "@/lib/mock-data"
import { useCollaborations } from "@/hooks/use-collaborations"
import { useProjects } from "@/hooks/use-projects"
import { useAuth } from "@/hooks/use-auth"
import { Briefcase, Clock, TrendingUp, Award, Users, Search, Filter, Target, SortAsc, X, Calendar, MessageCircle, BookOpen } from "lucide-react"

interface User {
  email: string
  name: string
  company: string
  position: string
  avatar: string
  type: string
  isLoggedIn: boolean
  loginTime: string
}

export default function CollaboratorPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedTag, setSelectedTag] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [currentTime, setCurrentTime] = useState(new Date())
  const { projects, loading: projectsLoading } = useProjects()
  const { collaborations } = useCollaborations()
  const { user, userProfile, loading: authLoading } = useAuth()

  const isLoading = authLoading || projectsLoading

  // Eliminar completamente el guard basado en localStorage:
  // useEffect(() => {
  //   const userData = localStorage.getItem('currentUser')
  //   ...
  //   router.push('/login')
  // }, [router])

  // Redirección basada en Supabase
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
    if (!authLoading && userProfile && userProfile.user_type !== 'collaborator') {
      router.push('/dashboard')
    }
  }, [authLoading, user, userProfile, router])

  // Función para obtener saludo según la hora
  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Buenos días"
    if (hour < 18) return "Buenas tardes"
    return "Buenas noches"
  }

  // Usar proyectos del hook (formato del esquema real)
  const allProjects = projects

  // Obtener todas las categorías únicas
  const allCategories = Array.from(new Set(allProjects.map(project => project.category)))

  // Obtener todos los tags únicos (con guardas)
  const allTags = Array.from(new Set(allProjects.flatMap(project => project.tags ?? [])))

  // Colaboraciones del usuario (ya filtradas por el hook)
  const userCollaborations = collaborations

  // Función de búsqueda/filtrado/ordenamiento adaptada al esquema real
  const filteredProjects = allProjects.filter(project => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = searchTerm === "" || 
      project.name.toLowerCase().includes(searchLower) ||
      project.description.toLowerCase().includes(searchLower) ||
      (project.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ?? false) ||
      (project.project_authors?.some(author => 
        author.name.toLowerCase().includes(searchLower) ||
        (author.university?.toLowerCase().includes(searchLower) ?? false)
      ) ?? false)

    const matchesCategory = selectedCategory === "all" || project.category === selectedCategory
    const matchesTag = selectedTag === "all" || (project.tags?.includes(selectedTag) ?? false)

    return matchesSearch && matchesCategory && matchesTag
  }).sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case "name":
        return a.name.localeCompare(b.name)
      case "cost-low":
        return (a.estimated_cost ?? 0) - (b.estimated_cost ?? 0)
      case "cost-high":
        return (b.estimated_cost ?? 0) - (a.estimated_cost ?? 0)
      default:
        return 0
    }
  })

  // Función para limpiar filtros
  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setSelectedTag("all")
    setSortBy("newest")
  }

  // Estadísticas del colaborador actualizadas
  const collaboratorStats = {
    projectsParticipating: userCollaborations.length,
    projectsCompleted: userCollaborations.filter(c => c.status === 'completed').length,
    projectsActive: userCollaborations.filter(c => c.status === 'accepted').length,
    projectsPending: userCollaborations.filter(c => c.status === 'pending').length
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando panel del colaborador...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <CollaboratorNavbar />
      <main className="p-6 space-y-6">
        {/* Sección de Bienvenida */}
  <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-background rounded-xl p-6 border">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          {getGreeting()}, {userProfile?.full_name || user.email}! 👋
        </h1>
        <p className="text-muted-foreground text-lg">
          Bienvenido a tu panel de colaborador. Explora proyectos innovadores y conecta con estudiantes talentosos.
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Briefcase className="h-4 w-4" />
            Colaborador
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Última actualización {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
      {/* Se elimina el acceso rápido de 'Proyectos Favoritos' y 'Explorar Proyectos' (Heart/Eye) */}
      {/* <Button variant="outline" className="gap-2">
      <Heart className="h-4 w-4" />
      Proyectos Favoritos
      </Button>
      <Button className="gap-2">
      <Eye className="h-4 w-4" />
      Explorar Proyectos
      </Button> */}
      </div>
    </div>
  </div>

  {/* Estadísticas del Colaborador */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Colaboraciones Totales</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{collaboratorStats.projectsParticipating}</div>
        <p className="text-xs text-muted-foreground">
          Proyectos en los que participas
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Proyectos Activos</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{collaboratorStats.projectsActive}</div>
        <p className="text-xs text-muted-foreground">
          En desarrollo actualmente
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Proyectos Completados</CardTitle>
        <Award className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{collaboratorStats.projectsCompleted}</div>
        <p className="text-xs text-muted-foreground">
          Finalizados exitosamente
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{collaboratorStats.projectsPending}</div>
        <p className="text-xs text-muted-foreground">
          Esperando confirmación
        </p>
      </CardContent>
    </Card>
  </div>

  {/* Contenido Principal con Tabs */}
  <Tabs defaultValue="discover" className="space-y-6">
    <TabsList className="grid w-full grid-cols-2">
      <TabsTrigger value="discover">Descubrir Proyectos</TabsTrigger>
      <TabsTrigger value="participating" className="relative">
        Mis Colaboraciones
        {userCollaborations.length > 0 && (
          <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
            {userCollaborations.length}
          </Badge>
        )}
      </TabsTrigger>
    </TabsList>

    {/* Tab: Descubrir Proyectos */}
    <TabsContent value="discover" className="space-y-6">
      {/* Barra de búsqueda mejorada */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Buscar Proyectos</h3>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Limpiar Filtros
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Búsqueda por texto */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar proyectos, autores, tags..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtro por categoría */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {allCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro por tag */}
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger>
                <Target className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tecnología" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las tecnologías</SelectItem>
                {allTags.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Ordenamiento */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Más recientes</SelectItem>
                <SelectItem value="oldest">Más antiguos</SelectItem>
                <SelectItem value="name">Nombre A-Z</SelectItem>
                <SelectItem value="cost-low">Costo menor</SelectItem>
                <SelectItem value="cost-high">Costo mayor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Indicadores de filtros activos */}
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <Badge variant="secondary" className="gap-1">
                Búsqueda: "{searchTerm}"
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
              </Badge>
            )}
            {selectedCategory !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Categoría: {selectedCategory}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory("all")} />
              </Badge>
            )}
            {selectedTag !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Tag: {selectedTag}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedTag("all")} />
              </Badge>
            )}
          </div>

          {/* Contador de resultados */}
          <p className="text-sm text-muted-foreground">
            {filteredProjects.length} proyecto{filteredProjects.length !== 1 ? 's' : ''} encontrado{filteredProjects.length !== 1 ? 's' : ''}
          </p>
        </div>
      </Card>

      {/* Lista de proyectos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron proyectos</h3>
            <p className="text-muted-foreground mb-4">
              Intenta ajustar tus filtros de búsqueda o explora diferentes categorías.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Limpiar filtros y ver todos los proyectos
            </Button>
          </div>
        )}
      </div>
    </TabsContent>

    {/* Tab: Mis Colaboraciones */}
    <TabsContent value="participating" className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mis Colaboraciones</h2>
        <Badge variant="outline">{userCollaborations.length} proyectos</Badge>
      </div>

      {userCollaborations.length > 0 ? (
        <div className="space-y-4">
          {userCollaborations.map((collaboration) => (
            <Card key={collaboration.project_id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{collaboration.projects?.name}</h3>
                      <Badge 
                        variant={
                          collaboration.status === 'accepted' ? 'default' :
                          collaboration.status === 'completed' ? 'secondary' : 'outline'
                        }
                      >
                        {collaboration.status === 'accepted' ? 'Activo' :
                         collaboration.status === 'completed' ? 'Completado' : 'Pendiente'}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{collaboration.projects?.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        Colaborador
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Desde {new Date(collaboration.started_at ?? collaboration.created_at).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:w-48 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progreso</span>
                      <span>{collaboration.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${collaboration.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Ver Proyecto
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tienes colaboraciones aún</h3>
          <p className="text-muted-foreground mb-4">
            Explora proyectos interesantes y únete a ellos para comenzar a colaborar.
          </p>
          <Button>
            <BookOpen className="h-4 w-4 mr-2" />
            Explorar Proyectos
          </Button>
        </div>
      )}
    </TabsContent>
  </Tabs>
      </main>
    </div>
  )
}