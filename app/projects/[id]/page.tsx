"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PROJECT_CATEGORIES, type ProjectWithAuthors } from "@/lib/types"
import { supabase } from "@/lib/supabase"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [project, setProject] = useState<ProjectWithAuthors | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("projects")
        .select("*, project_authors(*)")
        .eq("id", id)
        .single()

      if (error) {
        console.error(error)
      }
      setProject(data as ProjectWithAuthors | null)
      setLoading(false)
    }
    if (id) fetchProject()
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-center text-muted-foreground">Cargando proyecto...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <p className="text-lg">Proyecto no encontrado</p>
            <Button variant="outline" onClick={() => router.push("/")}>Volver al inicio</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="relative h-[320px] lg:h-full">
            {project.image_url ? (
              <Image
                src={project.image_url}
                alt={project.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-muted">
                <span className="text-muted-foreground">Sin imagen</span>
              </div>
            )}
          </div>

          <div className="p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl lg:text-3xl font-bold">
                {project.name}
              </CardTitle>
              <Badge variant="secondary">
                {PROJECT_CATEGORIES[project.category as keyof typeof PROJECT_CATEGORIES]}
              </Badge>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {project.description}
            </p>

            {project.project_authors && project.project_authors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Autores</h4>
                <div className="flex flex-wrap gap-2">
                  {project.project_authors.map((author) => (
                    <Badge key={author.id} variant="outline">{author.name}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              {project.contact_email && (
                <Button onClick={() => window.location.href = `mailto:${project.contact_email}`}>Contactar</Button>
              )}
              <Button variant="outline" onClick={() => router.push("/")}>Volver</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}