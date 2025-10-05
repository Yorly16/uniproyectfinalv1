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
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Upload, X, Plus, DollarSign, User, Target, Gift, Briefcase, Award, Link } from "lucide-react"
import type { ProjectCategory, DeveloperProfile } from "@/lib/types"
import { PROJECT_CATEGORIES } from "@/lib/types"
import { useProjects } from "@/hooks/use-projects"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function ProjectUploadForm() {
  const router = useRouter()
  const { createProject } = useProjects()
  const [projectName, setProjectName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<ProjectCategory | "">("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [authors, setAuthors] = useState([{ 
    name: "", 
    university: "", 
    email: "",
    profile: {
      bio: "",
      experience: "",
      skills: [],
      achievements: [],
      goals: "",
      motivation: "",
      linkedinUrl: "",
      portfolioUrl: ""
    }
  }])
  const [contact, setContact] = useState("")
  const [estimatedCost, setEstimatedCost] = useState("")
  const [isFree, setIsFree] = useState(false)
  const [seeksFunding, setSeeksFunding] = useState(true)
  const [projectGoals, setProjectGoals] = useState("")
  const [expectedOutcomes, setExpectedOutcomes] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const categoryOptions = Object.entries(PROJECT_CATEGORIES) // [ ["ai","Inteligencia Artificial"], ... ]

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
    setAuthors([...authors, { 
      name: "", 
      university: "", 
      email: "",
      profile: {
        bio: "",
        experience: "",
        skills: [],
        achievements: [],
        goals: "",
        motivation: "",
        linkedinUrl: "",
        portfolioUrl: ""
      }
    }])
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

  const handleAuthorProfileChange = (index: number, field: keyof DeveloperProfile, value: string | string[]) => {
    const newAuthors = [...authors]
    newAuthors[index].profile[field] = value as any
    setAuthors(newAuthors)
  }

  const handleAddSkill = (authorIndex: number, skill: string) => {
    if (skill.trim()) {
      const newAuthors = [...authors]
      if (!newAuthors[authorIndex].profile.skills.includes(skill.trim())) {
        newAuthors[authorIndex].profile.skills.push(skill.trim())
        setAuthors(newAuthors)
      }
    }
  }

  const handleRemoveSkill = (authorIndex: number, skillToRemove: string) => {
    const newAuthors = [...authors]
    newAuthors[authorIndex].profile.skills = newAuthors[authorIndex].profile.skills.filter(skill => skill !== skillToRemove)
    setAuthors(newAuthors)
  }

  const handleAddAchievement = (authorIndex: number, achievement: string) => {
    if (achievement.trim()) {
      const newAuthors = [...authors]
      newAuthors[authorIndex].profile.achievements.push(achievement.trim())
      setAuthors(newAuthors)
    }
  }

  const handleRemoveAchievement = (authorIndex: number, achievementIndex: number) => {
    const newAuthors = [...authors]
    newAuthors[authorIndex].profile.achievements.splice(achievementIndex, 1)
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

  // Helper para evitar cuelgues
  const promiseTimeout = <T,>(p: Promise<T>, ms: number) =>
    new Promise<T>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error("timeout")), ms)
      p.then((res) => {
        clearTimeout(t)
        resolve(res)
      }).catch((err) => {
        clearTimeout(t)
        reject(err)
      })
    })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación manual de campos obligatorios (Select de Shadcn no respeta required)
    if (
      !projectName.trim() ||
      !description.trim() ||
      !projectGoals.trim() ||
      !expectedOutcomes.trim() ||
      !category
    ) {
      toast.error("Por favor completa todos los campos obligatorios.")
      return
    }
    const hasInvalidAuthor = authors.some(
      (a) => !a.name.trim() || !a.university.trim() || !a.email.trim()
    )
    if (hasInvalidAuthor) {
      toast.error("Completa los datos de todos los desarrolladores (nombre, universidad y email).")
      return
    }
    if (!contact.trim()) {
      toast.error("El email de contacto es obligatorio.")
      return
    }

    setIsLoading(true)
    try {
      let imageUrl: string | undefined
      const UPLOAD_TIMEOUT_MS = 15000
      const CREATE_TIMEOUT_MS = 15000

      if (imageFile) {
        try {
          const fileExt = imageFile.name.split(".").pop()
          const filePath = `projects/${Date.now()}.${fileExt}`
          const { error: uploadError } = await promiseTimeout(
            supabase.storage
              .from("project-images")
              .upload(filePath, imageFile, { upsert: true, contentType: imageFile.type }),
            UPLOAD_TIMEOUT_MS
          )

          if (uploadError) {
            toast.error("Error subiendo la imagen. Crearemos el proyecto sin imagen.")
          } else {
            const { data } = supabase.storage.from("project-images").getPublicUrl(filePath)
            imageUrl = data.publicUrl
          }
        } catch {
          toast.error("Tiempo de espera al subir la imagen. Crearemos el proyecto sin imagen.")
        }
      }

      const result = await promiseTimeout(
        createProject({
          name: projectName,
          description,
          category: category as ProjectCategory,
          tags,
          imageUrl,
          contactEmail: contact,
          estimatedCost: isFree ? 0 : Number.parseFloat(estimatedCost || "0"),
          authors: authors.map((a) => ({ name: a.name, university: a.university, email: a.email }))
        }),
        CREATE_TIMEOUT_MS
      ).catch((err) => {
        console.error("Timeout/Error creando proyecto:", err)
        toast.error("No se pudo crear el proyecto. Intenta nuevamente.")
        return null
      })

      if (result?.success) {
        router.push("/dashboard")
      }
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
            Información del Proyecto
          </CardTitle>
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
              placeholder="Describe tu proyecto, metodología y características principales..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectGoals">
              Objetivos del Proyecto <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="projectGoals"
              placeholder="¿Qué objetivos específicos busca alcanzar este proyecto? ¿Qué problemas resuelve?"
              rows={3}
              value={projectGoals}
              onChange={(e) => setProjectGoals(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedOutcomes">
              Resultados Esperados <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="expectedOutcomes"
              placeholder="¿Qué impacto esperas generar? ¿Cuáles son los resultados esperados?"
              rows={3}
              value={expectedOutcomes}
              onChange={(e) => setExpectedOutcomes(e.target.value)}
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
                {
                  categoryOptions.map(([value, label]) => (
                    <SelectItem key={value} value={value as ProjectCategory}>
                      {label}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags Tecnológicos</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Ej: Machine Learning, Python, React..."
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

      {/* Sección de Financiamiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Tipo de Proyecto y Financiamiento
          </CardTitle>
          <CardDescription>Define si tu proyecto busca financiamiento o es de acceso libre</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isFree" 
              checked={isFree}
              onCheckedChange={(checked) => {
                setIsFree(checked as boolean)
                if (checked) {
                  setSeeksFunding(false)
                  setEstimatedCost("0")
                }
              }}
            />
            <Label htmlFor="isFree" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Proyecto Gratuito - Solo busco publicarlo y compartir conocimiento
            </Label>
          </div>

          {!isFree && (
            <>
              <Separator />
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="seeksFunding" 
                  checked={seeksFunding}
                  onCheckedChange={(checked) => setSeeksFunding(checked as boolean)}
                />
                <Label htmlFor="seeksFunding" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Busco financiamiento para este proyecto
                </Label>
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
                    required={!isFree}
                    min="0"
                    step="0.01"
                    disabled={isFree}
                  />
                </div>
              </div>
            </>
          )}

          {isFree && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <Gift className="inline h-4 w-4 mr-1" />
                ¡Excelente! Tu proyecto será marcado como gratuito y de acceso libre para la comunidad.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sección de Autores con Perfiles Detallados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Desarrolladores del Proyecto
          </CardTitle>
          <CardDescription>Información detallada de todos los desarrolladores participantes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {authors.map((author, index) => (
            <div key={index} className="space-y-6 rounded-lg border p-6 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Desarrollador {index + 1}
                </h4>
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

              {/* Información Básica */}
              <div className="space-y-4">
                <h5 className="font-medium text-sm text-gray-600 uppercase tracking-wide">Información Básica</h5>
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

              <Separator />

              {/* Perfil Profesional */}
              <div className="space-y-4">
                <h5 className="font-medium text-sm text-gray-600 uppercase tracking-wide flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Perfil Profesional
                </h5>
                
                <div className="space-y-2">
                  <Label htmlFor={`author-bio-${index}`}>
                    Biografía Profesional <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id={`author-bio-${index}`}
                    placeholder="Describe tu formación académica, área de especialización y experiencia relevante..."
                    rows={3}
                    value={author.profile.bio}
                    onChange={(e) => handleAuthorProfileChange(index, "bio", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`author-experience-${index}`}>
                    Experiencia Relevante <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id={`author-experience-${index}`}
                    placeholder="Proyectos anteriores, prácticas profesionales, investigaciones, etc..."
                    rows={3}
                    value={author.profile.experience}
                    onChange={(e) => handleAuthorProfileChange(index, "experience", e.target.value)}
                    required
                  />
                </div>

                {/* Habilidades */}
                <div className="space-y-2">
                  <Label>Habilidades Técnicas</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ej: Python, React, Machine Learning..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddSkill(index, e.currentTarget.value)
                          e.currentTarget.value = ""
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement
                        handleAddSkill(index, input.value)
                        input.value = ""
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {author.profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {author.profile.skills.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="outline" className="gap-1">
                          {skill}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveSkill(index, skill)} 
                            className="hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Logros y Objetivos */}
              <div className="space-y-4">
                <h5 className="font-medium text-sm text-gray-600 uppercase tracking-wide flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Logros y Objetivos
                </h5>

                {/* Logros */}
                <div className="space-y-2">
                  <Label>Logros y Reconocimientos</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ej: Primer lugar en hackathon universitario..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddAchievement(index, e.currentTarget.value)
                          e.currentTarget.value = ""
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement
                        handleAddAchievement(index, input.value)
                        input.value = ""
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {author.profile.achievements.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {author.profile.achievements.map((achievement, achievementIndex) => (
                        <div key={achievementIndex} className="flex items-center gap-2 p-2 bg-white rounded border">
                          <Award className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                          <span className="flex-1 text-sm">{achievement}</span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveAchievement(index, achievementIndex)} 
                            className="text-destructive hover:text-destructive/80"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`author-goals-${index}`}>
                    Objetivos Profesionales <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id={`author-goals-${index}`}
                    placeholder="¿Qué planeas lograr en tu carrera? ¿Cuáles son tus metas profesionales?"
                    rows={2}
                    value={author.profile.goals}
                    onChange={(e) => handleAuthorProfileChange(index, "goals", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`author-motivation-${index}`}>
                    Motivación para este Proyecto <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id={`author-motivation-${index}`}
                    placeholder="¿Qué te motiva a desarrollar este proyecto? ¿Qué esperas lograr?"
                    rows={2}
                    value={author.profile.motivation}
                    onChange={(e) => handleAuthorProfileChange(index, "motivation", e.target.value)}
                    required
                  />
                </div>
              </div>

              <Separator />

              {/* Enlaces Profesionales */}
              <div className="space-y-4">
                <h5 className="font-medium text-sm text-gray-600 uppercase tracking-wide flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Enlaces Profesionales (Opcional)
                </h5>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`author-linkedin-${index}`}>LinkedIn</Label>
                    <Input
                      id={`author-linkedin-${index}`}
                      placeholder="https://linkedin.com/in/tu-perfil"
                      value={author.profile.linkedinUrl}
                      onChange={(e) => handleAuthorProfileChange(index, "linkedinUrl", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`author-portfolio-${index}`}>Portafolio/GitHub</Label>
                    <Input
                      id={`author-portfolio-${index}`}
                      placeholder="https://github.com/tu-usuario"
                      value={author.profile.portfolioUrl}
                      onChange={(e) => handleAuthorProfileChange(index, "portfolioUrl", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={handleAddAuthor} className="w-full bg-transparent">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Otro Desarrollador
          </Button>
        </CardContent>
      </Card>

      {/* Información de Contacto */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Contacto</CardTitle>
          <CardDescription>Email principal para contacto sobre el proyecto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact">
              Email de Contacto Principal <span className="text-destructive">*</span>
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
