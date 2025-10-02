"use client"

import { useState, useEffect, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { ProjectCard } from "@/components/project-card"
import { useProjects } from "@/hooks/use-projects"
import type { ProjectWithAuthors } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Search, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PROJECT_CATEGORIES } from "@/lib/types"
import Typewriter from 'typewriter-effect'

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showProjects, setShowProjects] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectWithAuthors | null>(null)
  const [currentSubtitle, setCurrentSubtitle] = useState(0)

  const subtitles = [
    "Descubre proyectos innovadores creados por estudiantes, listos para inspirarte y colaborar.",
    "Transforma tus ideas en realidad con la comunidad universitaria más creativa.",
    "Conecta con mentes brillantes y lleva tus proyectos al siguiente nivel.",
    "Explora soluciones innovadoras desarrolladas por la próxima generación de líderes.",
    "Impulsa tu carrera con proyectos que marcan la diferencia en el mundo real.",
    "Colabora en iniciativas disruptivas que están cambiando el futuro.",
    "Forma parte de una comunidad que está redefiniendo la innovación universitaria."
  ]

  // Cambiar subtítulo cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSubtitle((prev) => (prev + 1) % subtitles.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const { projects, loading, loadProjects } = useProjects()

  // Cargar proyectos al montar el componente y cuando cambien los filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadProjects({
        category: selectedCategory === "all" ? undefined : selectedCategory,
        search: searchQuery.trim() || undefined
      })
    }, 300) // Debounce de 300ms

    return () => clearTimeout(timeoutId)
  }, [selectedCategory, searchQuery, loadProjects])

  // Sugerencias basadas en búsqueda de texto
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || !projects) return []
    
    const suggestions = projects
      .filter(project => 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => {
        // Priorizar coincidencias en el nombre
        const aNameMatch = a.name.toLowerCase().includes(searchQuery.toLowerCase())
        const bNameMatch = b.name.toLowerCase().includes(searchQuery.toLowerCase())
        if (aNameMatch && !bNameMatch) return -1
        if (!aNameMatch && bNameMatch) return 1
        return 0
      })
      .slice(0, 3) // Mostrar máximo 3 sugerencias
    
    return suggestions
  }, [searchQuery, projects])

  // Sugerencias basadas en categoría seleccionada
  const categorySuggestions = useMemo(() => {
    if (selectedCategory === "all" || !projects) return []
    
    return projects
      .filter(project => project.category === selectedCategory)
      .slice(0, 3) // Mostrar máximo 3 sugerencias
  }, [selectedCategory, projects])

  const categories = [
    { value: "all", label: "Todos" },
    ...Object.entries(PROJECT_CATEGORIES).map(([value, label]) => ({ value, label }))
  ]

  // Hook para detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      setShowProjects(scrollPosition > windowHeight * 0.5)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Mostrar sugerencias cuando hay búsqueda o categoría seleccionada
  useEffect(() => {
    setShowSuggestions(
      (searchQuery.trim().length > 0 && searchSuggestions.length > 0) ||
      (selectedCategory !== "all" && categorySuggestions.length > 0)
    )
  }, [searchQuery, searchSuggestions, selectedCategory, categorySuggestions])

  const handleClearSearch = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setShowSuggestions(false)
    setSelectedProject(null)
  }

  const handleSuggestionClick = (project: ProjectWithAuthors) => {
    setSearchQuery(project.name)
    setShowSuggestions(false)
    setSelectedProject(project)
  }

  const handleProjectUpdate = () => {
    loadProjects({
      category: selectedCategory === "all" ? undefined : selectedCategory,
      search: searchQuery.trim() || undefined
    })
  }

  // Estado para el efecto máquina de escribir
  const fullTitle = "Uni Project"
  const [typedTitle, setTypedTitle] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [loopNum, setLoopNum] = useState(0)
  const typingSpeed = 150
  const deletingSpeed = 80
  const pauseTime = 1200

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (!isDeleting && typedTitle.length < fullTitle.length) {
      timer = setTimeout(() => {
        setTypedTitle(fullTitle.substring(0, typedTitle.length + 1))
      }, typingSpeed)
    } else if (isDeleting && typedTitle.length > 0) {
      timer = setTimeout(() => {
        setTypedTitle(fullTitle.substring(0, typedTitle.length - 1))
      }, deletingSpeed)
    } else if (!isDeleting && typedTitle.length === fullTitle.length) {
      timer = setTimeout(() => setIsDeleting(true), pauseTime)
    } else if (isDeleting && typedTitle.length === 0) {
      timer = setTimeout(() => {
        setIsDeleting(false)
        setLoopNum(loopNum + 1)
      }, 500)
    }

    return () => clearTimeout(timer)
  }, [typedTitle, isDeleting, loopNum])

  // Frases para el efecto máquina de escribir debajo del título
  const phrases = [
    "Descubre proyectos innovadores creados por estudiantes, listos para inspirarte y colaborar.",
    "Conecta con mentes creativas y haz crecer tus ideas.",
    "Explora oportunidades únicas para aprender y emprender.",
    "¡Únete a la comunidad universitaria y comparte tu proyecto!"
  ]
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [typedPhrase, setTypedPhrase] = useState("")
  const [isDeletingPhrase, setIsDeletingPhrase] = useState(false)
  const typingPhraseSpeed = 60
  const deletingPhraseSpeed = 30
  const pausePhraseTime = 1200

  useEffect(() => {
    let timer: NodeJS.Timeout
    const currentPhrase = phrases[phraseIndex]

    if (!isDeletingPhrase && typedPhrase.length < currentPhrase.length) {
      timer = setTimeout(() => {
        setTypedPhrase(currentPhrase.substring(0, typedPhrase.length + 1))
      }, typingPhraseSpeed)
    } else if (isDeletingPhrase && typedPhrase.length > 0) {
      timer = setTimeout(() => {
        setTypedPhrase(currentPhrase.substring(0, typedPhrase.length - 1))
      }, deletingPhraseSpeed)
    } else if (!isDeletingPhrase && typedPhrase.length === currentPhrase.length) {
      timer = setTimeout(() => setIsDeletingPhrase(true), pausePhraseTime)
    } else if (isDeletingPhrase && typedPhrase.length === 0) {
      timer = setTimeout(() => {
        setIsDeletingPhrase(false)
        setPhraseIndex((phraseIndex + 1) % phrases.length)
      }, 500)
    }

    return () => clearTimeout(timer)
  }, [typedPhrase, isDeletingPhrase, phraseIndex, phrases])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="flex min-h-[85vh] flex-col items-center justify-center px-4">
        <div className="w-full max-w-3xl space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              <span>{typedTitle}</span>
              <span className="border-r-2 border-primary animate-pulse ml-1">&nbsp;</span>
            </h1>
            <p className="text-lg text-muted-foreground text-pretty sm:text-xl min-h-[2.5rem]">
              <span>{typedPhrase}</span>
              <span className="border-r-2 border-primary animate-pulse ml-1">&nbsp;</span>
            </p>
          </div>

          <div className="space-y-4 relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar proyectos..."
                className="h-14 pl-12 pr-12 text-base shadow-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
              />
              {(searchQuery || selectedCategory !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 p-0"
                  onClick={handleClearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Sugerencias de búsqueda */}
            {showSuggestions && (
              <Card className="absolute top-full left-0 right-0 z-10 mt-2 shadow-lg border">
                <CardContent className="p-0">
                  <div className="max-h-80 overflow-y-auto">
                    {/* Sugerencias por búsqueda de texto */}
                    {searchQuery.trim() && searchSuggestions.length > 0 && (
                      <div className="p-3 border-b">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                          Proyectos encontrados
                        </h4>
                        <div className="space-y-2">
                          {searchSuggestions.map((project) => (
                            <div
                              key={project.id}
                              className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                              onClick={() => handleSuggestionClick(project)}
                            >
                              <div className="w-12 h-12 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                                <img
                                  src={project.image_url || "/placeholder.svg"}
                                  alt={project.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 text-left">
                                <p className="font-medium text-sm line-clamp-1">{project.name}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {PROJECT_CATEGORIES[project.category]} • {project.project_authors?.[0]?.name || "Sin autor"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sugerencias por categoría */}
                    {selectedCategory !== "all" && categorySuggestions.length > 0 && (
                      <div className="p-3">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                          Proyectos de {PROJECT_CATEGORIES[selectedCategory]}
                        </h4>
                        <div className="space-y-2">
                          {categorySuggestions.map((project) => (
                            <div
                              key={project.id}
                              className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                              onClick={() => handleSuggestionClick(project)}
                            >
                              <div className="w-12 h-12 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                                <img
                                  src={project.image_url || "/placeholder.svg"}
                                  alt={project.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 text-left">
                                <p className="font-medium text-sm line-clamp-1">{project.name}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {project.project_authors?.[0]?.name || "Sin autor"} • ${project.estimated_cost?.toLocaleString() || "0"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mensaje cuando no hay sugerencias */}
                    {searchQuery.trim() && searchSuggestions.length === 0 && !loading && (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No se encontraron proyectos que coincidan con "{searchQuery}"
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-wrap items-center justify-center gap-2">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className="rounded-full"
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Proyecto seleccionado desde el buscador */}
          {selectedProject && (
            <div className="pt-8">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold">Proyecto Seleccionado</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProject(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-center">
                <div className="w-full max-w-md">
                  <ProjectCard project={selectedProject} onProjectUpdate={handleProjectUpdate} />
                </div>
              </div>
            </div>
          )}

          <div className="pt-8">
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm text-muted-foreground">Cargando proyectos...</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {projects?.length || 0} proyecto{(projects?.length || 0) !== 1 ? "s" : ""} disponible
                {(projects?.length || 0) !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Sección de proyectos que aparece solo al hacer scroll */}
      <section 
        className={`container mx-auto px-4 py-16 transition-all duration-700 ${
          showProjects 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-balance">Proyectos Publicados</h2>
          <p className="mt-2 text-muted-foreground text-pretty">
            Explora las últimas innovaciones de estudiantes universitarios
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">Cargando proyectos...</p>
            </div>
          </div>
        ) : !projects || projects.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-lg text-muted-foreground">No se encontraron proyectos</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery || selectedCategory !== "all" 
                  ? "Intenta con otros filtros o términos de búsqueda"
                  : "Aún no hay proyectos publicados"
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onProjectUpdate={handleProjectUpdate}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}