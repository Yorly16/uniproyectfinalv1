"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './use-auth'
import type { Collaboration, CollaborationInsert, CollaborationUpdate, ProjectWithAuthors } from '@/lib/types'
import { toast } from 'sonner'

export function useCollaborations() {
  const { user } = useAuth()
  const [collaborations, setCollaborations] = useState<Collaboration[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadCollaborations()
    }
  }, [user])

  const loadCollaborations = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
          .from('collaborations')
          .select(`
            *,
            projects (
              *,
              project_authors (*),
              owner:users!projects_created_by_fkey (id, full_name, email, avatar_url)
            )
          `)
          .eq('collaborator_id', user.id)
          .order('created_at', { ascending: false })

      if (error) throw error

      setCollaborations(data || [])
    } catch (error) {
      console.error('Error loading collaborations:', error)
      toast.error('Error al cargar colaboraciones')
    } finally {
      setLoading(false)
    }
  }

  const addCollaboration = async (projectId: string, message?: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para colaborar')
      return { success: false }
    }

    try {
      setLoading(true)

      // Verificar si ya existe una colaboración
      const { data: existing } = await supabase
        .from('collaborations')
        .select('id')
        .eq('project_id', projectId)
        .eq('collaborator_id', user.id)
        .single()

      if (existing) {
        toast.info('Ya has solicitado colaborar en este proyecto')
        return { success: false }
      }

      const collaborationData: CollaborationInsert = {
        project_id: projectId,
        collaborator_id: user.id,
        message,
        status: 'pending'
      }

      const { error } = await supabase
        .from('collaborations')
        .insert(collaborationData)

      if (error) throw error

      toast.success('Solicitud de colaboración enviada')
      await loadCollaborations()
      
      return { success: true }
    } catch (error: any) {
      console.error('Error adding collaboration:', error)
      toast.error(error.message || 'Error al enviar solicitud')
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  const updateCollaborationStatus = async (
    collaborationId: string, 
    status: 'accepted' | 'rejected' | 'completed'
  ) => {
    try {
      setLoading(true)

      const updates: CollaborationUpdate = {
        status,
        ...(status === 'accepted' && { started_at: new Date().toISOString() }),
        ...(status === 'completed' && { completed_at: new Date().toISOString(), progress: 100 })
      }

      const { error } = await supabase
        .from('collaborations')
        .update(updates)
        .eq('id', collaborationId)

      if (error) throw error

      toast.success(`Colaboración ${status === 'accepted' ? 'aceptada' : status === 'rejected' ? 'rechazada' : 'completada'}`)
      await loadCollaborations()
      
      return { success: true }
    } catch (error: any) {
      console.error('Error updating collaboration:', error)
      toast.error(error.message || 'Error al actualizar colaboración')
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  const updateProgress = async (collaborationId: string, progress: number) => {
    try {
      const { error } = await supabase
        .from('collaborations')
        .update({ progress })
        .eq('id', collaborationId)

      if (error) throw error

      toast.success('Progreso actualizado')
      await loadCollaborations()
      
      return { success: true }
    } catch (error: any) {
      console.error('Error updating progress:', error)
      toast.error(error.message || 'Error al actualizar progreso')
      return { success: false }
    }
  }

  const removeCollaboration = async (collaborationId: string) => {
    try {
      setLoading(true)

      const { error } = await supabase
        .from('collaborations')
        .delete()
        .eq('id', collaborationId)

      if (error) throw error

      toast.success('Colaboración eliminada')
      await loadCollaborations()
      
      return { success: true }
    } catch (error: any) {
      console.error('Error removing collaboration:', error)
      toast.error(error.message || 'Error al eliminar colaboración')
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  const getCollaborationByProject = (projectId: string) => {
    return collaborations.find(c => c.project_id === projectId)
  }

  const hasCollaborated = (projectId: string) => {
    return collaborations.some(c => c.project_id === projectId)
  }

  return {
    collaborations,
    loading,
    addCollaboration,
    updateCollaborationStatus,
    updateProgress,
    removeCollaboration,
    getCollaborationByProject,
    hasCollaborated,
    refreshCollaborations: loadCollaborations
  }
}