import { Navbar } from "@/components/navbar"
import { RegisterForm } from "@/components/register-form"
import Image from "next/image"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
        <div className="flex w-full max-w-6xl flex-col items-center gap-8 lg:flex-row lg:gap-12">
          <div className="flex-1 space-y-4 text-center lg:text-left">
            <div className="flex items-center justify-center gap-3 lg:justify-start">
              <Image 
                src="/logo.png" 
                alt="Uni Project Logo" 
                width={48} 
                height={48} 
                className="h-12 w-12"
              />
              <h1 className="text-4xl font-bold text-balance">Únete a Uni Project</h1>
            </div>
            <p className="text-lg text-muted-foreground text-pretty">
              Crea tu cuenta y comienza a compartir tus proyectos universitarios o descubre el trabajo innovador de otros estudiantes.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2 justify-center lg:justify-start">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  👨‍🎓
                </span>
                <strong>Estudiante:</strong> Sube y gestiona tus proyectos
              </p>
              <p className="flex items-center gap-2 justify-center lg:justify-start">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                  🤝
                </span>
                <strong>Colaborador:</strong> Explora y guarda proyectos
              </p>
              <p className="flex items-center gap-2 justify-center lg:justify-start">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                  🌟
                </span>
                Conecta con la comunidad universitaria
              </p>
            </div>
          </div>

          <div className="w-full max-w-lg">
            <RegisterForm />
          </div>
        </div>
      </main>
    </div>
  )
}