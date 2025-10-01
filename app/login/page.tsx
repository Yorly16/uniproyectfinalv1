import { Navbar } from "@/components/navbar"
import { LoginForm } from "@/components/login-form"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
        <div className="flex w-full max-w-5xl flex-col items-center gap-8 lg:flex-row lg:gap-12">
          <div className="flex-1 space-y-4 text-center lg:text-left">
            <div className="flex items-center justify-center gap-3 lg:justify-start">
              <Image 
                src="/logo.png" 
                alt="Uni Project Logo" 
                width={48} 
                height={48} 
                className="h-12 w-12"
              />
              <h1 className="text-4xl font-bold text-balance">Uni Project</h1>
            </div>
            <p className="text-lg text-muted-foreground text-pretty">
              Comparte tus proyectos universitarios con el mundo y descubre el trabajo innovador de estudiantes de todas
              las universidades.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2 justify-center lg:justify-start">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                  ✓
                </span>
                Sube y gestiona tus proyectos
              </p>
              <p className="flex items-center gap-2 justify-center lg:justify-start">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                  ✓
                </span>
                Conecta con otros estudiantes
              </p>
              <p className="flex items-center gap-2 justify-center lg:justify-start">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                  ✓
                </span>
                Muestra tu trabajo al mundo
              </p>
            </div>
          </div>

          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </main>
    </div>
  )
}
