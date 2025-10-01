import type { Project } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Mail, DollarSign, UserPlus, CreditCard } from "lucide-react"
import Image from "next/image"

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Inteligencia Artificial": "bg-primary/10 text-primary border-primary/20",
      Social: "bg-accent/10 text-accent border-accent/20",
      Tecnológico: "bg-chart-2/10 text-chart-2 border-chart-2/20",
      "Construcción/Arquitectura": "bg-chart-4/10 text-chart-4 border-chart-4/20",
      Agricultura: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
      Otros: "bg-muted text-muted-foreground border-border",
    }
    return colors[category] || colors["Otros"]
  }

  const handleJoinProject = () => {
    const subject = encodeURIComponent(`Solicitud para unirme al proyecto: ${project.name}`)
    const body = encodeURIComponent(`Hola,

Espero que te encuentres bien. Mi nombre es [Tu nombre] y me pongo en contacto contigo porque estoy muy interesado/a en unirme al proyecto "${project.name}".

He revisado los detalles del proyecto y creo que puedo aportar valor al equipo con mis habilidades y experiencia. Me gustaría conocer más sobre:

- Los roles disponibles en el proyecto
- Las habilidades específicas que están buscando
- El proceso de selección
- Los próximos pasos para participar

Quedo atento/a a tu respuesta y espero poder formar parte de este emocionante proyecto.

Saludos cordiales,
[Tu nombre]
[Tu información de contacto]`)

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(project.contact)}&su=${subject}&body=${body}`
    window.open(gmailUrl, '_blank')
  }

  const handleFinanceProject = () => {
    const subject = encodeURIComponent(`Interés en financiar el proyecto: ${project.name}`)
    const body = encodeURIComponent(`Hola,

Espero que te encuentres bien. Mi nombre es [Tu nombre] y me pongo en contacto contigo porque estoy interesado/a en financiar el proyecto "${project.name}".

He revisado los detalles del proyecto y me parece una iniciativa muy prometedora. Me gustaría conocer más información sobre:

- El plan de financiamiento del proyecto
- Los montos de inversión disponibles
- El retorno esperado de la inversión
- Los hitos y cronograma del proyecto
- La documentación legal necesaria

Costo estimado del proyecto: $${project.estimatedCost.toLocaleString()} USD

Quedo atento/a a tu respuesta para coordinar una reunión y discutir los detalles.

Saludos cordiales,
[Tu nombre]
[Tu información de contacto]`)

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(project.contact)}&su=${subject}&body=${body}`
    window.open(gmailUrl, '_blank')
  }

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        <Image
          src={project.imageUrl || "/placeholder.svg"}
          alt={project.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
      </div>

      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold leading-tight text-balance line-clamp-2">{project.name}</h3>
          <Badge variant="outline" className={getCategoryColor(project.category)}>
            {project.category}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3 text-pretty">{project.description}</p>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {project.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {project.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{project.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="line-clamp-1">
              {project.authors[0].name}
              {project.authors.length > 1 && ` +${project.authors.length - 1}`}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span className="line-clamp-1">{project.contact}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>${project.estimatedCost.toLocaleString()} USD</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <div className="text-xs text-muted-foreground w-full text-center">
          {project.authors[0].university}
        </div>
        
        <div className="flex gap-2 w-full">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gap-2"
            onClick={handleJoinProject}
          >
            <UserPlus className="h-4 w-4" />
            Unirme
          </Button>
          
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 gap-2"
            onClick={handleFinanceProject}
          >
            <CreditCard className="h-4 w-4" />
            Financiar
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
