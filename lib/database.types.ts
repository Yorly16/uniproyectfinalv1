export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          user_type: 'student' | 'collaborator'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          user_type?: 'student' | 'collaborator'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          user_type?: 'student' | 'collaborator'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      developer_profiles: {
        Row: {
          id: string
          user_id: string
          university: string | null
          career: string | null
          semester: number | null
          skills: string[] | null
          github_url: string | null
          linkedin_url: string | null
          portfolio_url: string | null
          bio: string | null
          location: string | null
          available_for_collaboration: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          university?: string | null
          career?: string | null
          semester?: number | null
          skills?: string[] | null
          github_url?: string | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          bio?: string | null
          location?: string | null
          available_for_collaboration?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          university?: string | null
          career?: string | null
          semester?: number | null
          skills?: string[] | null
          github_url?: string | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          bio?: string | null
          location?: string | null
          available_for_collaboration?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string
          category: 'web' | 'mobile' | 'ai' | 'iot' | 'blockchain' | 'other'
          tags: string[] | null
          estimated_cost: number | null
          image_url: string | null
          contact_email: string | null
          contact_phone: string | null
          repository_url: string | null
          demo_url: string | null
          status: string
          featured: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: 'web' | 'mobile' | 'ai' | 'iot' | 'blockchain' | 'other'
          tags?: string[] | null
          estimated_cost?: number | null
          image_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          repository_url?: string | null
          demo_url?: string | null
          status?: string
          featured?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: 'web' | 'mobile' | 'ai' | 'iot' | 'blockchain' | 'other'
          tags?: string[] | null
          estimated_cost?: number | null
          image_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          repository_url?: string | null
          demo_url?: string | null
          status?: string
          featured?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      project_authors: {
        Row: {
          id: string
          project_id: string
          name: string
          university: string | null
          email: string | null
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          university?: string | null
          email?: string | null
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          university?: string | null
          email?: string | null
          role?: string
          created_at?: string
        }
      }
      collaborations: {
        Row: {
          id: string
          project_id: string
          collaborator_id: string
          status: 'pending' | 'accepted' | 'rejected' | 'completed'
          message: string | null
          progress: number
          started_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          collaborator_id: string
          status?: 'pending' | 'accepted' | 'rejected' | 'completed'
          message?: string | null
          progress?: number
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          collaborator_id?: string
          status?: 'pending' | 'accepted' | 'rejected' | 'completed'
          message?: string | null
          progress?: number
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          collaboration_id: string
          project_id: string
          owner_id: string
          collaborator_id: string
          is_open: boolean
          last_message_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          collaboration_id: string
          project_id: string
          owner_id: string
          collaborator_id: string
          is_open?: boolean
          last_message_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          collaboration_id?: string
          project_id?: string
          owner_id?: string
          collaborator_id?: string
          is_open?: boolean
          last_message_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          created_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          created_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          created_at?: string
          read_at?: string | null
        }
      }
      project_views: {
        Row: {
          id: string
          project_id: string
          user_id: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      project_likes: {
        Row: {
          id: string
          project_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_type: 'student' | 'collaborator'
      project_category: 'web' | 'mobile' | 'ai' | 'iot' | 'blockchain' | 'other'
      collaboration_status: 'pending' | 'accepted' | 'rejected' | 'completed'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}