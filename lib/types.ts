import { Database } from './database.types'

// Tipos de Supabase
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type DeveloperProfile = Database['public']['Tables']['developer_profiles']['Row']
export type DeveloperProfileInsert = Database['public']['Tables']['developer_profiles']['Insert']
export type DeveloperProfileUpdate = Database['public']['Tables']['developer_profiles']['Update']

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export type ProjectAuthor = Database['public']['Tables']['project_authors']['Row']
export type ProjectAuthorInsert = Database['public']['Tables']['project_authors']['Insert']

export type Collaboration = Database['public']['Tables']['collaborations']['Row']
export type CollaborationInsert = Database['public']['Tables']['collaborations']['Insert']
export type CollaborationUpdate = Database['public']['Tables']['collaborations']['Update']

export type Conversation = Database['public']['Tables']['conversations']['Row']
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert']
export type Message = Database['public']['Tables']['messages']['Row']

// Se eliminan tipos relacionados a likes y vistas
// export type ProjectView = Database['public']['Tables']['project_views']['Row']
// export type ProjectLike = Database['public']['Tables']['project_likes']['Row']

// Tipos extendidos para la UI
export interface ProjectWithAuthors extends Project {
  project_authors: ProjectAuthor[]
  collaboration_count?: number
  // Se eliminan propiedades relacionadas a likes/vistas
  // view_count?: number
  // like_count?: number
  // user_has_liked?: boolean
  user_collaboration?: Collaboration | null
}

export interface UserWithProfile extends User {
  developer_profile?: DeveloperProfile | null
}

// Enums
export type ProjectCategory = Database['public']['Enums']['project_category']
export type UserType = Database['public']['Enums']['user_type']
export type CollaborationStatus = Database['public']['Enums']['collaboration_status']

// Mapeo de categorías para la UI
export const PROJECT_CATEGORIES: Record<ProjectCategory, string> = {
  'web': 'Desarrollo Web',
  'mobile': 'Aplicaciones Móviles',
  'ai': 'Inteligencia Artificial',
  'iot': 'Internet de las Cosas',
  'blockchain': 'Blockchain',
  'other': 'Otros'
}

export const COLLABORATION_STATUS_LABELS: Record<CollaborationStatus, string> = {
  'pending': 'Pendiente',
  'accepted': 'Aceptado',
  'rejected': 'Rechazado',
  'completed': 'Completado'
}

// Tipos para formularios
export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  userType: UserType
  university?: string
  career?: string
  semester?: number
}

export interface LoginFormData {
  email: string
  password: string
}

export interface ProjectFormData {
  name: string
  description: string
  category: ProjectCategory
  tags: string[]
  estimatedCost?: number
  contactEmail?: string
  contactPhone?: string
  repositoryUrl?: string
  demoUrl?: string
  authors: {
    name: string
    university?: string
    email?: string
  }[]
}
