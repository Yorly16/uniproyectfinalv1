"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { ProjectWithAuthors } from "@/lib/types"
import { useAuth } from "@/hooks/use-auth"
import { ProjectEditForm } from "@/components/project-edit-form"

export default function EditProjectPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [project, setProject] = useState<ProjectWithAuthors | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      if (!params?.id) return
      const { data, error } = await supabase
        .from("projects")
        .select("*, project_authors(*)")
        .eq("id", params.id as string)
        .single()

      if (error) {
        setLoading(false)
        return
      }
      setProject(data as ProjectWithAuthors)
      setLoading(false)
    }

    fetchProject()
  }, [params?.id])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [authLoading, user, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando proyecto...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar />
        <main className="container mx-auto px-4 py-8">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              No se encontró el proyecto.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    )
  }

  if (user && project.created_by !== user.id) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar />
        <main className="container mx-auto px-4 py-8">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              No tienes permisos para editar este proyecto.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <ProjectEditForm project={project} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}