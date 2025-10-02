"use client"

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './use-auth'
import type { ProjectWithAuthors, ProjectInsert, ProjectFormData } from '@/lib/types'
import { toast } from 'sonner'
import { mockProjects } from '@/lib/mock-data'

export function useProjects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<ProjectWithAuthors[]>([])
  const [userProjects, setUserProjects] = useState<ProjectWithAuthors[]>([])
  const [loading, setLoading] = useState(false)

  // Fallback: convertir mock al formato esperado y ordenar por fecha descendente
  const convertMockProjects = (options?: { category?: string; search?: string }): ProjectWithAuthors[] => {
    let filteredProjects = mockProjects

    if (options?.category && options.category !== 'all') {
      filteredProjects = filteredProjects.filter(p => p.category === options.category)
    }

    if (options?.search) {
      const searchLower = options.search.toLowerCase()
      filteredProjects = filteredProjects.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    const convertedProjects: ProjectWithAuthors[] = filteredProjects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      category: project.category,
      tags: project.tags,
      image_url: project.imageUrl,
      contact_email: project.contact,
      estimated_cost: project.estimatedCost,
      status: 'active',
      created_by: 'mock-user',
      created_at: project.createdAt ? project.createdAt.toISOString() : new Date().toISOString(),
      updated_at: new Date().toISOString(),
      project_authors: project.authors.map(author => ({
        id: `mock-${author.name}`,
        project_id: project.id,
        name: author.name,
        university: author.university,
        email: author.email,
        role: 'author',
        created_at: new Date().toISOString()
      })),
      collaboration_count: Math.floor(Math.random() * 10),
      user_collaboration: null
    }))

    // Orden por created_at descendente para simular los más recientes primero
    return convertedProjects.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }

  // Estabiliza la función y habilita fallback cuando no hay proyectos
  const loadProjects = useCallback(async (options?: { category?: string; search?: string }) => {
    try {
      setLoading(true)

      let query = supabase
        .from('projects')
        .select(`
          *,
          project_authors (*),
          users!projects_created_by_fkey (full_name, avatar_url)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (options?.category && options.category !== 'all') {
        query = query.eq('category', options.category)
      }

      if (options?.search) {
        query = query.or(`name.ilike.%${options?.search}%,description.ilike.%${options?.search}%`)
      }

      const { data, error } = await query
      if (error) throw error

      // Si no hay proyectos en la BD, usar los mock como predeterminado
      if (!data || data.length === 0) {
        setProjects(convertMockProjects(options))
        return
      }

      const projectsWithStats = await Promise.all(
        data.map(async (project) => {
          const [collaborationCount, userCollaboration] = await Promise.all([
            getCollaborationCount(project.id),
            user ? getUserCollaboration(project.id, user.id) : null
          ])

          return {
            ...project,
            collaboration_count: collaborationCount,
            user_collaboration: userCollaboration
          }
        })
      )

      setProjects(projectsWithStats)
    } catch (supabaseError) {
      console.log('Supabase no disponible, usando datos mock:', supabaseError)
      setProjects(convertMockProjects(options))
    } finally {
      setLoading(false)
    }
  }, [user])

  // Evita doble carga: solo carga los proyectos del usuario cuando haya sesión
  useEffect(() => {
    if (user) {
      loadUserProjects()
    }
  }, [user])

  const loadUserProjects = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_authors (*)
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setUserProjects(data || [])
    } catch (error) {
      console.log('Error loading user projects (usando mock):', error)
      // No mostrar error para proyectos de usuario si no hay datos
      setUserProjects([])
    }
  }

  const createProject = async (projectData: ProjectFormData) => {
    if (!user) {
      toast.error('Debes iniciar sesión para crear un proyecto')
      return { success: false }
    }

    try {
      setLoading(true)

      const projectInsert: ProjectInsert = {
        name: projectData.name,
        description: projectData.description,
        category: projectData.category,
        tags: projectData.tags,
        image_url: projectData.imageUrl,
        contact_email: projectData.contactEmail,
        estimated_cost: projectData.estimatedCost,
        created_by: user.id,
        status: 'active'
      }

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert(projectInsert)
        .select()
        .single()

      if (projectError) throw projectError

      // Insertar autores
      if (projectData.authors && projectData.authors.length > 0) {
        const authorsInsert = projectData.authors.map(author => ({
          project_id: project.id,
          name: author.name,
          university: author.university ?? null,
          email: author.email ?? null,
          role: 'author'
        }))

        const { error: authorsError } = await supabase
          .from('project_authors')
          .insert(authorsInsert)

        if (authorsError) throw authorsError
      }

      toast.success('Proyecto creado exitosamente')
      await loadProjects()
      await loadUserProjects()
      
      return { success: true, data: project }
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Error al crear el proyecto')
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  const updateProject = async (id: string, projectData: Partial<ProjectFormData>) => {
    if (!user) {
      toast.error('Debes iniciar sesión para actualizar un proyecto')
      return { success: false }
    }

    try {
      setLoading(true)

      const { error } = await supabase
        .from('projects')
        .update({
          name: projectData.name,
          description: projectData.description,
          category: projectData.category,
          tags: projectData.tags,
          image_url: projectData.imageUrl,
          contact_email: projectData.contactEmail,
          estimated_cost: projectData.estimatedCost,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('created_by', user.id)

      if (error) throw error

      toast.success('Proyecto actualizado exitosamente')
      await loadProjects()
      await loadUserProjects()
      
      return { success: true }
    } catch (error) {
      console.error('Error updating project:', error)
      toast.error('Error al actualizar el proyecto')
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  const deleteProject = async (id: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para eliminar un proyecto')
      return { success: false }
    }

    try {
      setLoading(true)

      const { error } = await supabase
        .from('projects')
        .update({ status: 'deleted' })
        .eq('id', id)
        .eq('created_by', user.id)

      if (error) throw error

      toast.success('Proyecto eliminado exitosamente')
      await loadProjects()
      await loadUserProjects()
      
      return { success: true }
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Error al eliminar el proyecto')
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  // Se eliminan funciones de likes y registro de vistas
  // const likeProject = async (projectId: string) => { ... }
  // const unlikeProject = async (projectId: string) => { ... }
  // const recordView = async (projectId: string) => { ... }

  // Funciones auxiliares
  const getCollaborationCount = async (projectId: string): Promise<number> => {
    try {
      const { count } = await supabase
        .from('collaborations')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId)
        .eq('status', 'accepted')

      return count || 0
    } catch {
      return 0
    }
  }

  // Se eliminan: getViewCount, getLikeCount, getUserLike
  const getViewCount = async (projectId: string): Promise<number> => {
    try {
      const { count } = await supabase
        .from('project_views')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId)

      return count || 0
    } catch {
      return 0
    }
  }

  const getLikeCount = async (projectId: string): Promise<number> => {
    try {
      const { count } = await supabase
        .from('project_likes')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId)

      return count || 0
    } catch {
      return 0
    }
  }

  const getUserLike = async (projectId: string, userId: string) => {
    try {
      const { data } = await supabase
        .from('project_likes')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single()

      return data
    } catch {
      return null
    }
  }

  const getUserCollaboration = async (projectId: string, userId: string) => {
    try {
      const { data } = await supabase
        .from('collaborations')
        .select('*')
        .eq('project_id', projectId)
        .eq('collaborator_id', userId)
        .single()

      return data
    } catch {
      return null
    }
  }

  return {
    projects,
    userProjects,
    loading,
    loadProjects,
    loadUserProjects,
    createProject,
    updateProject,
    deleteProject,
    // Se eliminan del retorno: likeProject, unlikeProject, recordView
  }
}