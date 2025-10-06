import type { ProjectWithAuthors } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Mail, DollarSign, UserPlus, CreditCard, Check, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCollaborations } from "@/hooks/use-collaborations"
import { useProjects } from "@/hooks/use-projects"
import { useAuth } from "@/hooks/use-auth"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { PROJECT_CATEGORIES } from "@/lib/types"

interface ProjectCardProps {
  project: ProjectWithAuthors
  onProjectUpdate?: () => void
}

export function ProjectCard({ project, onProjectUpdate }: ProjectCardProps) {
  const { user } = useAuth()
  const { addCollaboration, loading: collaborationLoading } = useCollaborations()
  


  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      web: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
      mobile: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
      ai: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
      iot: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
      blockchain: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
      other: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
    }
    return colors[category] || colors["other"]
  }

  const handleCollaborate = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para colaborar")
      return
    }

    if (user.id === project.created_by) {
      toast.info("No puedes colaborar en tu propio proyecto")
      return
    }

    if (project.user_collaboration) {
      toast.info("Ya has solicitado colaborar en este proyecto")
      return
    }

    const result = await addCollaboration(project.id)
    if (result.success && onProjectUpdate) {
      onProjectUpdate()
    }
  }



  const handleContact = () => {
    const subject = encodeURIComponent(`Consulta sobre el proyecto: ${project.name}`)
    const body = encodeURIComponent(`Hola,

Espero que te encuentres bien. Mi nombre es [Tu nombre] y me pongo en contacto contigo porque estoy interesado/a en el proyecto "${project.name}".

Me gustaría conocer más detalles sobre:
- Los objetivos del proyecto
- Las tecnologías utilizadas
- Oportunidades de colaboración
- Cronograma y próximos pasos

Quedo atento/a a tu respuesta.

Saludos cordiales,
[Tu nombre]
[Tu información de contacto]`)

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(project.contact_email || '')}&su=${subject}&body=${body}`
    window.open(gmailUrl, '_blank')
  }

  const getCollaborationButtonState = () => {
    if (!user) return { text: "Colaborar", disabled: false, variant: "outline" as const }
    
    if (user.id === project.created_by) {
      return { text: "Tu proyecto", disabled: true, variant: "secondary" as const }
    }

    if (project.user_collaboration) {
      const status = project.user_collaboration.status
      switch (status) {
        case 'pending':
          return { text: "Solicitud enviada", disabled: true, variant: "secondary" as const }
        case 'accepted':
          return { text: "Colaborando", disabled: true, variant: "default" as const }
        case 'completed':
          return { text: "Completado", disabled: true, variant: "secondary" as const }
        case 'rejected':
          return { text: "Colaborar", disabled: false, variant: "outline" as const }
        default:
          return { text: "Colaborar", disabled: false, variant: "outline" as const }
      }
    }

    return { text: "Colaborar", disabled: false, variant: "outline" as const }
  }

  const buttonState = getCollaborationButtonState()

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/projects/${project.id}`} className="block">
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          <Image
            src={project.image_url || "/placeholder.svg"}
            alt={project.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>

        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold leading-tight text-balance line-clamp-2">
              {project.name}
            </h3>
            <Badge variant="outline" className={getCategoryColor(project.category)}>
              {PROJECT_CATEGORIES[project.category]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3 text-pretty">
            {project.description}
          </p>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {project.tags?.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {project.tags && project.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{project.tags.length - 3}
              </Badge>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="line-clamp-1">
                {project.project_authors?.[0]?.name || "Sin autor"}
                {project.project_authors && project.project_authors.length > 1 && 
                  ` +${project.project_authors.length - 1}`
                }
              </span>
            </div>

            {project.contact_email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="line-clamp-1">{project.contact_email}</span>
              </div>
            )}

            {project.estimated_cost && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>${project.estimated_cost.toLocaleString()} USD</span>
              </div>
            )}
          </div>
        </CardContent>
      </Link>

      <CardFooter className="flex flex-col gap-3">
        {project.project_authors?.[0]?.university && (
          <div className="text-xs text-muted-foreground w-full text-center">
            {project.project_authors[0].university}
          </div>
        )}
        
        <div className="flex gap-2 w-full">
          <Button 
            variant={buttonState.variant}
            size="sm" 
            className="flex-1 gap-2"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleCollaborate()
            }}
            disabled={buttonState.disabled || collaborationLoading}
          >
            {collaborationLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {project.user_collaboration?.status === 'accepted' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {buttonState.text}
              </>
            )}
          </Button>
          


          {project.contact_email && (
            <Button 
              variant="default" 
              size="sm" 
              className="gap-2"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleContact()
              }}
            >
              <Mail className="h-4 w-4" />
              Contactar
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
