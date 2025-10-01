"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Plus, DollarSign } from "lucide-react"
import type { ProjectCategory } from "@/lib/types"

export function ProjectUploadForm() {
  const [projectName, setProjectName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<ProjectCategory | "">("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [authors, setAuthors] = useState([{ name: "", university: "", email: "" }])
  const [contact, setContact] = useState("")
  const [estimatedCost, setEstimatedCost] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const categories: ProjectCategory[] = [
    "Inteligencia Artificial",
    "Social",
    "Tecnológico",
    "Construcción/Arquitectura",
    "Otros",
  ]

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleAddAuthor = () => {
    setAuthors([...authors, { name: "", university: "", email: "" }])
  }

  const handleRemoveAuthor = (index: number) => {
    if (authors.length > 1) {
      setAuthors(authors.filter((_, i) => i !== index))
    }
  }

  const handleAuthorChange = (index: number, field: "name" | "university" | "email", value: string) => {
    const newAuthors = [...authors]
    newAuthors[index][field] = value
    setAuthors(newAuthors)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulación de envío - aquí conectarás tu backend
    const formData = {
      projectName,
      description,
      category,
      tags,
      authors,
      contact,
      estimatedCost: Number.parseFloat(estimatedCost),
      imageFile,
    }

    console.log("Project data:", formData)

    setTimeout(() => {
      setIsLoading(false)
      alert("Proyecto subido exitosamente (demo)")
      // Aquí redirigirías al dashboard: router.push('/dashboard')
    }, 1500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del Proyecto</CardTitle>
          <CardDescription>Completa los detalles básicos de tu proyecto universitario</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">
              Nombre del Proyecto <span className="text-destructive">*</span>
            </Label>
            <Input
              id="projectName"
              placeholder="Ej: Sistema de Reconocimiento Facial"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Descripción <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe tu proyecto, objetivos, metodología y resultados..."
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">
              Categoría <span className="text-destructive">*</span>
            </Label>
            <Select value={category} onValueChange={(value) => setCategory(value as ProjectCategory)} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Ej: Machine Learning, Python..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Imagen del Proyecto</Label>
            <div className="flex items-center gap-4">
              <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="flex-1" />
              {imagePreview && (
                <div className="relative h-20 w-20 overflow-hidden rounded-lg border">
                  <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Autores del Proyecto</CardTitle>
          <CardDescription>Agrega información de todos los autores participantes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {authors.map((author, index) => (
            <div key={index} className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Autor {index + 1}</h4>
                {authors.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAuthor(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`author-name-${index}`}>
                    Nombre Completo <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`author-name-${index}`}
                    placeholder="Ej: María González"
                    value={author.name}
                    onChange={(e) => handleAuthorChange(index, "name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`author-university-${index}`}>
                    Universidad <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`author-university-${index}`}
                    placeholder="Ej: Universidad Nacional"
                    value={author.university}
                    onChange={(e) => handleAuthorChange(index, "university", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor={`author-email-${index}`}>
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`author-email-${index}`}
                    type="email"
                    placeholder="email@universidad.edu"
                    value={author.email}
                    onChange={(e) => handleAuthorChange(index, "email", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={handleAddAuthor} className="w-full bg-transparent">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Otro Autor
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información de Contacto y Costos</CardTitle>
          <CardDescription>Detalles adicionales sobre el proyecto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact">
              Email de Contacto <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contact"
              type="email"
              placeholder="contacto@example.com"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedCost">
              Costo Estimado de Ejecución (USD) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="estimatedCost"
                type="number"
                placeholder="15000"
                className="pl-10"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" size="lg" className="flex-1" disabled={isLoading}>
          {isLoading ? (
            "Subiendo..."
          ) : (
            <>
              <Upload className="mr-2 h-5 w-5" />
              Publicar Proyecto
            </>
          )}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => window.history.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
