import { DashboardNavbar } from "@/components/dashboard-navbar"
import { StatsCard } from "@/components/stats-card"
import { MyProjectCard } from "@/components/my-project-card"
import { Button } from "@/components/ui/button"
import { mockProjects } from "@/lib/mock-data"
import { FolderOpen, Eye, Heart, TrendingUp, Plus } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  // Simulación: proyectos del usuario actual
  const myProjects = mockProjects.slice(0, 3)

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Panel de Control</h1>
            <p className="text-muted-foreground text-pretty">Gestiona tus proyectos universitarios</p>
          </div>
          <Link href="/dashboard/upload">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Subir Proyecto
            </Button>
          </Link>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Proyectos Publicados"
            value={myProjects.length}
            description="Total de proyectos activos"
            icon={FolderOpen}
          />
          <StatsCard
            title="Visualizaciones"
            value="1,234"
            description="Vistas totales"
            icon={Eye}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Me Gusta"
            value="89"
            description="Reacciones positivas"
            icon={Heart}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Tendencia"
            value="+23%"
            description="Crecimiento mensual"
            icon={TrendingUp}
            trend={{ value: 23, isPositive: true }}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Mis Proyectos</h2>
            <Button variant="outline" size="sm">
              Ver Todos
            </Button>
          </div>

          {myProjects.length === 0 ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed">
              <div className="text-center">
                <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No tienes proyectos</h3>
                <p className="mt-2 text-sm text-muted-foreground">Comienza subiendo tu primer proyecto</p>
                <Link href="/dashboard/upload">
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Subir Proyecto
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {myProjects.map((project) => (
                <MyProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
