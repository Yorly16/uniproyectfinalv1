"use client"

import { useState, useEffect, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { ProjectCard } from "@/components/project-card"
import { mockProjects } from "@/lib/mock-data"
import type { ProjectCategory, Project } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | "Todos">("Todos")
  const [searchQuery, setSearchQuery] = useState("")
  const [showProjects, setShowProjects] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const filteredProjects = mockProjects.filter((project) => {
    const matchesCategory = selectedCategory === "Todos" || project.category === selectedCategory
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesCategory && matchesSearch
  })

  // Sugerencias basadas en búsqueda de texto
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return []
    
    const suggestions = mockProjects
      .filter(project => 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
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
  }, [searchQuery])

  // Sugerencias basadas en categoría seleccionada
  const categorySuggestions = useMemo(() => {
    if (selectedCategory === "Todos") return []
    
    return mockProjects
      .filter(project => project.category === selectedCategory)
      .slice(0, 3) // Mostrar máximo 3 sugerencias
  }, [selectedCategory])

  const categories: Array<ProjectCategory | "Todos"> = [
    "Todos",
    "Inteligencia Artificial",
    "Social",
    "Tecnología",
    "Arquitectura",
    "Agricultura",
    "Finanzas",
    "Otros",
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
      (selectedCategory !== "Todos" && categorySuggestions.length > 0)
    )
  }, [searchQuery, searchSuggestions, selectedCategory, categorySuggestions])

  const handleClearSearch = () => {
    setSearchQuery("")
    setSelectedCategory("Todos")
    setShowSuggestions(false)
    setSelectedProject(null)
  }

  const handleSuggestionClick = (project: Project) => {
    setSearchQuery(project.name)
    setShowSuggestions(false)
    setSelectedProject(project)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="flex min-h-[85vh] flex-col items-center justify-center px-4">
        <div className="w-full max-w-3xl space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Uni Project
            </h1>
            <p className="text-lg text-muted-foreground text-pretty sm:text-xl">
              Descubre proyectos innovadores creados por estudiantes, listos para inspirarte y colaborar.
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
              {(searchQuery || selectedCategory !== "Todos") && (
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
                                  src={project.imageUrl || "/placeholder.svg"}
                                  alt={project.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 text-left">
                                <p className="font-medium text-sm line-clamp-1">{project.name}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {project.category} • {project.authors[0].name}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sugerencias por categoría */}
                    {selectedCategory !== "Todos" && categorySuggestions.length > 0 && (
                      <div className="p-3">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                          Proyectos de {selectedCategory}
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
                                  src={project.imageUrl || "/placeholder.svg"}
                                  alt={project.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 text-left">
                                <p className="font-medium text-sm line-clamp-1">{project.name}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {project.authors[0].name} • ${project.estimatedCost.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mensaje cuando no hay sugerencias */}
                    {searchQuery.trim() && searchSuggestions.length === 0 && (
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
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full"
                >
                  {category}
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
                  <ProjectCard project={selectedProject} />
                </div>
              </div>
            </div>
          )}

          <div className="pt-8">
            <p className="text-sm text-muted-foreground">
              {filteredProjects.length} proyecto{filteredProjects.length !== 1 ? "s" : ""} disponible
              {filteredProjects.length !== 1 ? "s" : ""}
            </p>
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

        {filteredProjects.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-lg text-muted-foreground">No se encontraron proyectos</p>
              <p className="text-sm text-muted-foreground">Intenta con otros filtros o términos de búsqueda</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
