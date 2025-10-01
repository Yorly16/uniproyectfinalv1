"use client"

import type React from "react"

import type { ProjectCategory } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Sparkles, Heart, Cpu, Building, MoreHorizontal } from "lucide-react"

interface CategoryFilterProps {
  selectedCategory: ProjectCategory | "Todos"
  onCategoryChange: (category: ProjectCategory | "Todos") => void
}

const categories: { value: ProjectCategory | "Todos"; label: string; icon: React.ReactNode }[] = [
  { value: "Todos", label: "Todos", icon: <MoreHorizontal className="h-4 w-4" /> },
  { value: "Inteligencia Artificial", label: "IA", icon: <Sparkles className="h-4 w-4" /> },
  { value: "Social", label: "Social", icon: <Heart className="h-4 w-4" /> },
  { value: "Tecnológico", label: "Tecnológico", icon: <Cpu className="h-4 w-4" /> },
  { value: "Construcción/Arquitectura", label: "Arquitectura", icon: <Building className="h-4 w-4" /> },
  { value: "Otros", label: "Otros", icon: <MoreHorizontal className="h-4 w-4" /> },
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
