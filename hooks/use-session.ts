"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  email: string
  name: string
  type: string
  isLoggedIn: boolean
  loginTime: string
  [key: string]: any
}

export function useSession() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('windowHiddenTime')
    router.push('/login')
  }

  // Función para verificar y cargar la sesión
  const checkSession = () => {
    const userData = localStorage.getItem('currentUser')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        if (user.isLoggedIn) {
          setCurrentUser(user)
        } else {
          logout()
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        logout()
      }
    } else {
      router.push('/login')
    }
    setIsLoading(false)
  }

  // Efecto para cargar la sesión inicial
  useEffect(() => {
    checkSession()
  }, [])

  // Efecto para manejar el cierre automático de sesión
  useEffect(() => {
    if (!currentUser) return

    // Función para cerrar sesión cuando se cierre la ventana/pestaña
    const handleBeforeUnload = () => {
      localStorage.removeItem('currentUser')
    }

    // Función para detectar cuando la ventana pierde el foco
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Marcar el tiempo cuando se oculta la ventana
        localStorage.setItem('windowHiddenTime', new Date().toISOString())
      } else {
        // Cuando vuelve a ser visible, verificar si ha pasado mucho tiempo
        const hiddenTime = localStorage.getItem('windowHiddenTime')
        if (hiddenTime) {
          const timeDiff = new Date().getTime() - new Date(hiddenTime).getTime()
          const minutesDiff = timeDiff / (1000 * 60)
          
          // Si han pasado más de 30 minutos, cerrar sesión automáticamente
          if (minutesDiff > 30) {
            logout()
            return
          }
        }
        localStorage.removeItem('windowHiddenTime')
      }
    }

    // Detectar inactividad del usuario
    let inactivityTimer: NodeJS.Timeout
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer)
      inactivityTimer = setTimeout(() => {
        // Cerrar sesión después de 60 minutos de inactividad
        logout()
      }, 60 * 60 * 1000) // 60 minutos
    }

    // Eventos que resetean el timer de inactividad
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    // Agregar event listeners
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    events.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true)
    })

    // Iniciar el timer de inactividad
    resetInactivityTimer()

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      events.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer, true)
      })
      clearTimeout(inactivityTimer)
    }
  }, [currentUser, router])

  return {
    currentUser,
    isLoading,
    logout,
    checkSession
  }
}