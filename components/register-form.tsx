"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Eye, EyeOff, Lock, User, Building2, Mail, GraduationCap } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

type AccountType = "student" | "collaborator"

export function RegisterForm() {
  const [accountType, setAccountType] = useState<AccountType>("student")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()

  // Campos comunes
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Campos específicos para estudiantes
  const [career, setCareer] = useState("")
  const [university, setUniversity] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    try {
      const fullName = `${firstName} ${lastName}`.trim()
      const result = await signUp({
        email,
        password,
        confirmPassword,
        fullName,
        userType: accountType === "student" ? "student" : "collaborator",
        university: accountType === "student" ? university : undefined,
        career: accountType === "student" ? career : undefined,
      })

      if (!result.success) {
        toast.error(result.error || "Error al crear la cuenta")
        setIsLoading(false)
        return
      }

      // El hook maneja los toasts y la redirección (login/dashboard)
    } catch (err: any) {
      toast.error(err.message || "Error al crear la cuenta")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-balance">Crear Cuenta</CardTitle>
        <CardDescription className="text-pretty">
          Elige tu tipo de cuenta y completa tus datos
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Selector de tipo de cuenta */}
          <div className="space-y-2">
            <Label>Tipo de Cuenta</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={accountType === "student" ? "default" : "outline"}
                className="h-auto flex-col gap-2 p-4"
                onClick={() => setAccountType("student")}
              >
                <GraduationCap className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Estudiante</div>
                  <div className="text-xs text-muted-foreground">Sube proyectos</div>
                </div>
              </Button>
              <Button
                type="button"
                variant={accountType === "collaborator" ? "default" : "outline"}
                className="h-auto flex-col gap-2 p-4"
                onClick={() => setAccountType("collaborator")}
              >
                <Building2 className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Colaborador</div>
                  <div className="text-xs text-muted-foreground">Explora proyectos</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Campos comunes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombres</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Juan Carlos"
                  className="pl-10"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Apellidos</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Pérez García"
                  className="pl-10"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Campos específicos para estudiantes */}
          {accountType === "student" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="career">Carrera</Label>
                <Select value={career} onValueChange={setCareer} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu carrera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ingenieria-sistemas">Ingeniería de Sistemas</SelectItem>
                    <SelectItem value="ingenieria-industrial">Ingeniería Industrial</SelectItem>
                    <SelectItem value="ingenieria-civil">Ingeniería Civil</SelectItem>
                    <SelectItem value="medicina">Medicina</SelectItem>
                    <SelectItem value="derecho">Derecho</SelectItem>
                    <SelectItem value="administracion">Administración de Empresas</SelectItem>
                    <SelectItem value="psicologia">Psicología</SelectItem>
                    <SelectItem value="arquitectura">Arquitectura</SelectItem>
                    <SelectItem value="comunicacion">Comunicación Social</SelectItem>
                    <SelectItem value="economia">Economía</SelectItem>
                    <SelectItem value="otra">Otra</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="university">Universidad</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="university"
                    type="text"
                    placeholder="Universidad Tecnológia del Perú"
                    className="pl-10"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder={accountType === "student" ? "tu.email@universidad.edu" : "tu.email@empresa.com"}
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Alert>
            <AlertDescription className="text-sm">
              <strong>Nota: Recuerda Validar Tu email antes de Iniciar Sesión</strong>
            </AlertDescription>
          </Alert>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Inicia sesión aquí
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}