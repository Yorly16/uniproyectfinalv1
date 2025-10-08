"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { UserWithProfile, RegisterFormData, LoginFormData } from '@/lib/types'
import { toast } from 'sonner'

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserWithProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  // Blindaje contra doble inicialización en Strict Mode
  const initRef = useRef(false)

  useEffect(() => {
    // Ejecutar solo una vez
    if (initRef.current) return
    initRef.current = true

    // Obtener sesión inicial
    getInitialSession()

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email)
      
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await loadUserProfile(session.user.id)
      } else {
        setUserProfile(null)
      }
      
      setLoading(false)

      // Manejar eventos específicos
      if (event === 'SIGNED_IN') {
        toast.success('¡Bienvenido!')
      } else if (event === 'SIGNED_OUT') {
        // No navegamos aquí; signOut() manejará la redirección
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const getInitialSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.log('Error getting session:', error)
        setLoading(false)
        return
      }

      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await loadUserProfile(session.user.id)
      }
    } catch (error) {
      console.log('Error in getInitialSession:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          developer_profile:developer_profiles(*)
        `)
        .eq('id', userId)
        .single()

      if (error) {
        console.log('Error loading user profile:', error)
        return
      }

      setUserProfile(data)
    } catch (error) {
      console.log('Error in loadUserProfile:', error)
    }
  }

  const signUp = async (formData: RegisterFormData) => {
    try {
      setLoading(true)

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            user_type: formData.userType,
            ...(formData.userType === 'student' && {
              career: formData.career,
              university: formData.university
            })
          }
        }
      })

      if (error) throw error

      if (data.user && !data.session) {
        toast.success('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.')
        router.push('/login')
      } else if (data.session) {
        toast.success('¡Cuenta creada exitosamente!')
        router.push('/dashboard')
      }

      return { success: true }
    } catch (error: any) {
      console.error('Error signing up:', error)
      toast.error(error.message || 'Error al crear la cuenta')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (formData: LoginFormData) => {
    try {
      setLoading(true)

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error

      toast.success('¡Bienvenido de nuevo!')

      const authUser = data.user
      if (authUser) {
        const { data: profileRow } = await supabase
          .from('users')
          .select('user_type')
          .eq('id', authUser.id)
          .single()

        const metaType = (authUser.user_metadata as any)?.user_type as 'student' | 'collaborator' | undefined
        const dbType = profileRow?.user_type as 'student' | 'collaborator' | undefined

        const userType = metaType ?? dbType ?? 'collaborator'

        // Si hay discrepancia, sincroniza BD con metadata de auth
        if (metaType && dbType && metaType !== dbType) {
          await supabase
            .from('users')
            .update({ user_type: metaType })
            .eq('id', authUser.id)
        }

        const destination = userType === 'student' ? '/dashboard' : '/collaborator'
        router.replace(destination) // replace evita volver al login con el botón "atrás"
      }

      return { success: true }
    } catch (error: any) {
      console.error('Error signing in:', error)
      toast.error(error.message || 'Error al iniciar sesión')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast.success('Sesión cerrada')
      router.replace('/login')

      return { success: true }
    } catch (error: any) {
      console.error('Error signing out:', error)
      toast.error('Error al cerrar sesión')
      return { success: false }
    }
  }

  const updateProfile = async (updates: Partial<UserWithProfile>) => {
    if (!user) return { success: false }

    try {
      setLoading(true)

      const { error } = await supabase
        .from('users')
        .update({
          full_name: (updates as any).full_name, // aseguramos que se escriba full_name
          avatar_url: updates.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Perfil actualizado exitosamente')
      await loadUserProfile(user.id)
      
      return { success: true }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error('Error al actualizar el perfil')
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  const updateDeveloperProfile = async (updates: any) => {
    if (!user || !userProfile?.developer_profile) return { success: false }

    try {
      setLoading(true)

      const { error } = await supabase
        .from('developer_profiles')
        .update({
          career: updates.career,
          university: updates.university,
          bio: updates.bio,
          skills: updates.skills,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('Perfil de desarrollador actualizado')
      await loadUserProfile(user.id)
      
      return { success: true }
    } catch (error: any) {
      console.error('Error updating developer profile:', error)
      toast.error('Error al actualizar el perfil')
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    userProfile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    updateDeveloperProfile
  }
}