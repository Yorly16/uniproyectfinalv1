import { DashboardNavbar } from "@/components/dashboard-navbar"
import { ProjectUploadForm } from "@/components/project-upload-form"

export default function UploadProjectPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">Subir Nuevo Proyecto</h1>
          <p className="text-muted-foreground text-pretty">
            Comparte tu proyecto universitario con la comunidad académica
          </p>
        </div>

        <ProjectUploadForm />
      </main>
    </div>
  )
}
