import type React from "react"
import { cn } from "@/lib/utils"

interface SectionCardProps {
  children: React.ReactNode
  className?: string
  title?: string
}

export function SectionCard({ children, className, title }: SectionCardProps) {
  return (
    <div className={cn("p-6 rounded-2xl shadow-sm space-y-4 bg-white dark:bg-slate-900", className)}>
      {title && <h3 className="text-lg font-medium">{title}</h3>}
      {children}
    </div>
  )
}
