// (remove "use client")
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockProjects } from "@/lib/mock-data"

export async function generateStaticParams() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/projects?select=id`, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      })
      if (res.ok) {
        const data = (await res.json()) as { id: string }[]
        if (Array.isArray(data) && data.length > 0) {
          return data.map(({ id }) => ({ id }))
        }
      }
    } catch (e) {
      console.warn('generateStaticParams supabase fallback:', e)
    }
  }

  // Fallback a IDs mock si no hay env o petición falla
  return mockProjects.map((p) => ({ id: p.id }))
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let project = mockProjects.find((p) => p.id === params.id)

  if (!project && supabaseUrl && supabaseAnonKey) {
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/projects?id=eq.${params.id}&select=id,name,description,category,tags,estimated_cost,image_url,contact_email,created_at`,
        {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
        }
      )
      if (res.ok) {
        const rows = (await res.json()) as any[]
        const row = rows[0]
        if (row) {
          project = {
            id: row.id,
            name: row.name,
            description: row.description,
            category: row.category,
            tags: row.tags ?? [],
            authors: [], // autores opcionales; se omiten si no se consultan
            contact: row.contact_email ?? null,
            estimatedCost: row.estimated_cost ?? null,
            imageUrl: row.image_url ?? null,
            createdAt: row.created_at ? new Date(row.created_at) : new Date(),
          } as any
        }
      }
    } catch (e) {
      console.warn('ProjectDetailPage supabase fallback:', e)
    }
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
            {project.imageUrl ? (
              <Image src={project.imageUrl} alt={project.name} fill className="object-cover" priority />
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

            {project.authors && project.authors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Autores</h4>
                <div className="flex flex-wrap gap-2">
                  {project.authors.map((author) => (
                    <Badge key={author.email} variant="outline">{author.name}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              {project.contact && (
                <Button asChild>
                  <a href={`mailto:${project.contact}`}>Contactar</a>
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