import type React from "react"
import { cn } from "@/lib/utils"

interface FormFieldWrapperProps {
  children: React.ReactNode
  className?: string
}

export function FormFieldWrapper({ children, className }: FormFieldWrapperProps) {
  return <div className={cn("flex flex-col space-y-1", className)}>{children}</div>
}
