"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Upload, Plus, Target, Link as LinkIcon, DollarSign } from "lucide-react"
import type { Project, ProjectCategory } from "@/lib/types"
import { PROJECT_CATEGORIES } from "@/lib/types"
import { useProjects } from "@/hooks/use-projects"
import { toast } from "sonner"

interface ProjectEditFormProps {
  project: Project
}

export function ProjectEditForm({ project }: ProjectEditFormProps) {
  const router = useRouter()
  const { updateProject } = useProjects()

  const [projectName, setProjectName] = useState(project.name || "")
  const [description, setDescription] = useState(project.description || "")
  const [category, setCategory] = useState<ProjectCategory>(project.category)
  const [tags, setTags] = useState<string[]>(project.tags || [])
  const [tagInput, setTagInput] = useState("")
  const [contactEmail, setContactEmail] = useState(project.contact_email || "")
  const [estimatedCost, setEstimatedCost] = useState(
    typeof project.estimated_cost === "number" ? String(project.estimated_cost) : ""
  )
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(project.image_url || null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!projectName.trim() || !description.trim() || !category) {
      toast.error("Por favor completa nombre, descripción y categoría.")
      return
    }
    if (!contactEmail.trim()) {
      toast.error("El email de contacto es obligatorio.")
      return
    }

    setIsLoading(true)
    try {
      let imageUrl = project.image_url || undefined

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop()
        const filePath = `projects/${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from("project-images")
          .upload(filePath, imageFile, { upsert: true, contentType: imageFile.type })
        if (uploadError) {
          toast.error("Error subiendo la imagen. Se mantendrá la imagen anterior.")
        } else {
          const { data } = supabase.storage.from("project-images").getPublicUrl(filePath)
          imageUrl = data.publicUrl
        }
      }

      const result = await updateProject(project.id, {
        name: projectName,
        description,
        category,
        tags,
        imageUrl,
        contactEmail,
        estimatedCost: Number.parseFloat(estimatedCost || "0"),
      })

      if (result?.success) {
        toast.success("Proyecto actualizado")
        router.push("/dashboard")
      }
    } catch (err) {
      console.error(err)
      toast.error("No se pudo actualizar el proyecto")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Editar Proyecto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="projectName">Nombre del Proyecto</Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
            />
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ProjectCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PROJECT_CATEGORIES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Etiquetas</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Añadir etiqueta"
              />
              <Button type="button" variant="secondary" onClick={handleAddTag}>
                <Plus className="h-4 w-4 mr-1" />
                Añadir
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Imagen */}
          <div className="space-y-2">
            <Label>Imagen del Proyecto</Label>
            <div className="flex items-center gap-3">
              <Input type="file" accept="image/*" onChange={handleImageChange} />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
            {imagePreview && (
              <div className="relative w-full max-w-md h-40 mt-2">
                <Image src={imagePreview} alt="Vista previa" fill className="object-cover rounded-md" />
              </div>
            )}
          </div>

          {/* Contacto y costo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email de contacto</Label>
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedCost">Costo estimado (USD)</Label>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="estimatedCost"
                  type="number"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isLoading}>
          Guardar cambios
        </Button>
      </div>
    </form>
  )
}