"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

export function Navbar() {
  const { user, loading } = useAuth()

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-transparent bg-transparent backdrop-blur-sm transition-colors hover:border-border hover:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/logo.png" 
            alt="Uni Project Logo" 
            width={24} 
            height={24} 
            className="h-6 w-6"
          />
          <span className="text-lg font-semibold">Uni Project</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="sm">
              Explorar
            </Button>
          </Link>
          
          {loading ? (
            <Button size="sm" disabled>
              Cargando...
            </Button>
          ) : user ? (
            <Link href="/dashboard">
              <Button size="sm">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="sm">
                Iniciar Sesión
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
