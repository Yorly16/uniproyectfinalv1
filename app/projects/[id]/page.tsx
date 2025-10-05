// ProjectDetailPage (ruta dinámica /projects/[id])
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockProjects } from "@/lib/mock-data"
import { supabase } from "@/lib/supabase"

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const { data, error } = await supabase
    .from('projects')
    .select('id')
    .eq('status', 'active')

  if (!error && data && data.length > 0) {
    return data.map(({ id }) => ({ id }))
  }

  // Fallback a IDs mock si no hay datos
  return mockProjects.map((p) => ({ id: p.id }))
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  let project: any = null

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_authors (*)
    `)
    .eq('id', params.id)
    .eq('status', 'active')
    .single()

  if (!error && data) {
    project = data
  }

  if (!project) {
    project = mockProjects.find((p) => p.id === params.id)
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <p className="text-lg">Proyecto no encontrado</p>
            <Button variant="outline" asChild>
              <Link href="/">Volver al inicio</Link>
            </Button>
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
              <Image src={project.image_url} alt={project.name} fill className="object-cover" priority />
            ) : (
              <div className="flex items-center justify-center h-full bg-muted">
                <span className="text-muted-foreground">Sin imagen</span>
              </div>
            )}
          </div>

          <div className="p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl lg:text-3xl font-bold">{project.name}</CardTitle>
              <Badge variant="secondary">{project.category}</Badge>
            </div>

            <p className="text-muted-foreground leading-relaxed">{project.description}</p>

            {project.project_authors && project.project_authors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Autores</h4>
                <div className="flex flex-wrap gap-2">
                  {project.project_authors.map((author) => (
                    <Badge key={author.email} variant="outline">{author.name}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              {project.contact_email && (
                <Button asChild>
                  <a href={`mailto:${project.contact_email}`}>Contactar</a>
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link href="/">Volver</Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}