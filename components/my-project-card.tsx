import type { Project } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Eye, 
  Edit, 
  Trash2, 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  TrendingUp,
  Calendar
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"

interface MyProjectCardProps {
  project: Project
}

export function MyProjectCard({ project }: MyProjectCardProps) {
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

  // Simulación de estadísticas del proyecto
  const stats = {
    // Se eliminan vistas y likes
    // views: Math.floor(Math.random() * 1000) + 100,
    // likes: Math.floor(Math.random() * 50) + 5,
    contacts: Math.floor(Math.random() * 20) + 1,
    trend: Math.floor(Math.random() * 30) + 5
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: project.name,
        text: project.description,
        url: window.location.origin + `/project/${project.id}`
      })
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(window.location.origin + `/project/${project.id}`)
      alert("Enlace copiado al portapapeles")
    }
  }

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <div className="relative h-40 w-full overflow-hidden bg-muted">
        <Image 
          src={project.imageUrl || "/placeholder.svg"} 
          alt={project.name} 
          fill 
          className="object-cover transition-transform group-hover:scale-105" 
        />
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="secondary" 
                size="icon" 
                className="h-8 w-8 bg-background/80 backdrop-blur-sm"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                Ver Proyecto
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Compartir
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold leading-tight text-balance line-clamp-1">
            {project.name}
          </h3>
          <Badge variant="outline" className={getCategoryColor(project.category)}>
            {project.category}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 text-pretty">
          {project.description}
        </p>
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

        {/* Estadísticas del proyecto (solo contactos) */}
        <div className="grid grid-cols-1 gap-2 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <MessageCircle className="h-3 w-3 text-green-500" />
              <span className="text-sm font-medium">{stats.contacts}</span>
            </div>
            <p className="text-xs text-muted-foreground">Contactos</p>
          </div>
        </div>

        {/* Indicador de tendencia */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Publicado {new Date(project.createdAt).toLocaleDateString('es-ES')}</span>
          </div>
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="h-3 w-3" />
            <span>+{stats.trend}%</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-4">
        {/* Se elimina botón de Ver con ícono Eye */}
        {/* <Button variant="outline" size="sm" className="flex-1">
          <Eye className="mr-2 h-4 w-4" />
          Ver
        </Button> */}
        <Button variant="outline" size="sm" className="flex-1">
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
