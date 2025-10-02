"use client"

import type React from "react"

import type { ProjectCategory } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Sparkles, Cpu, Building, MoreHorizontal } from "lucide-react"

interface CategoryFilterProps {
  selectedCategory: ProjectCategory | "Todos"
  onCategoryChange: (category: ProjectCategory | "Todos") => void
}

const categories: { value: ProjectCategory | "Todos"; label: string; icon: React.ReactNode }[] = [
  { value: "Todos", label: "Todos", icon: <MoreHorizontal className="h-4 w-4" /> },
  { value: "ai", label: "Inteligencia Artificial", icon: <Sparkles className="h-4 w-4" /> },
  { value: "web", label: "Desarrollo Web", icon: <Cpu className="h-4 w-4" /> },
  { value: "mobile", label: "Aplicaciones Móviles", icon: <Cpu className="h-4 w-4" /> },
  { value: "iot", label: "Internet de las Cosas", icon: <Building className="h-4 w-4" /> },
  { value: "blockchain", label: "Blockchain", icon: <MoreHorizontal className="h-4 w-4" /> },
  { value: "other", label: "Otros", icon: <MoreHorizontal className="h-4 w-4" /> },
]

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category.value}
          variant={selectedCategory === category.value ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category.value)}
          className="gap-2"
        >
          {category.icon}
          {category.label}
        </Button>
      ))}
    </div>
  )
}
