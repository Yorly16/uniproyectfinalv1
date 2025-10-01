export type ProjectCategory =
  | "Inteligencia Artificial"
  | "Social"
  | "Tecnológico"
  | "Construcción/Arquitectura"
  | "Agricultura"
  | "Otros"

export interface Project {
  id: string
  name: string
  description: string
  category: ProjectCategory
  tags: string[]
  authors: {
    name: string
    university: string
    email: string
  }[]
  contact: string
  estimatedCost: number
  imageUrl: string
  createdAt: Date
}
