import type { Project } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash2 } from "lucide-react"
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
      Otros: "bg-muted text-muted-foreground border-border",
    }
    return colors[category] || colors["Otros"]
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative h-40 w-full overflow-hidden bg-muted">
        <Image src={project.imageUrl || "/placeholder.svg"} alt={project.name} fill className="object-cover" />
      </div>

      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold leading-tight text-balance line-clamp-1">{project.name}</h3>
          <Badge variant="outline" className={getCategoryColor(project.category)}>
            {project.category}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 text-pretty">{project.description}</p>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap gap-1.5">
          {project.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
          <Eye className="mr-2 h-4 w-4" />
          Ver
        </Button>
        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
