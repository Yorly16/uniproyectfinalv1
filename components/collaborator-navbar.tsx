"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { LogOut, User, Settings, Bell, Search, Briefcase } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import { useUnreadCounts } from "../hooks/use-unread-counts"

export function CollaboratorNavbar() {
  const router = useRouter()
  const { user, userProfile, signOut, loading } = useAuth()

  const { unreadCount, isFetching } = useUnreadCounts(5000)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])



  const handleLogout = async () => {
    await signOut()
    // La navegación ocurre dentro de signOut() (router.replace('/login'))
  }

  const getInitials = (name?: string) => {
    const safe = (name ?? '').trim()
    if (!safe) return '??'
    return safe
      .split(/\s+/)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading || !user) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/logo.png" 
                alt="Uni Project Logo" 
                width={32} 
                height={32} 
                className="h-8 w-8"
              />
              <span className="text-xl font-bold text-balance">Uni Project</span>
            </Link>
          </div>
          <div className="text-sm text-muted-foreground">Cargando...</div>
        </div>
      </nav>
    )
  }

  // No mostrar "Cargando..." a nivel de Navbar; sólo esqueletos internos
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/logo.png" 
              alt="Uni Project Logo" 
              width={32} 
              height={32} 
              className="h-8 w-8"
            />
            <span className="text-xl font-bold text-balance">Uni Project</span>
          </Link>

          {/* Barra de búsqueda rápida */}
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar proyectos para colaborar..." 
              className="pl-10 w-64"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost">Explorar Proyectos</Button>
          </Link>

          {/* Botón de cerrar sesión visible */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>

          {/* Notificaciones */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
              >
                {unreadCount}
              </Badge>
            )}
            {isFetching && (
              <span className="absolute -top-1 -left-1 h-2 w-2 rounded-full bg-muted-foreground/50 animate-pulse" />
            )}
          </Button>
        </div>
      </div>
    </nav>
  )
}