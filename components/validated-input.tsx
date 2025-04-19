import { Input, type InputProps } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { ValidationResult } from "@/lib/validation"
import { AlertCircle, AlertTriangle } from "lucide-react"

interface ValidatedInputProps extends InputProps {
  id: string
  label: string
  description?: string
  validation?: ValidationResult
}

export function ValidatedInput({ id, label, description, validation, className, ...props }: ValidatedInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className={validation?.severity === "error" ? "text-red-500 dark:text-red-400" : ""}>
          {label}
        </Label>
        {validation && (
          <div className="flex items-center">
            {validation.severity === "error" ? (
              <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 mr-1" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400 mr-1" />
            )}
            <span
              className={`text-xs ${
                validation.severity === "error"
                  ? "text-red-500 dark:text-red-400"
                  : "text-amber-500 dark:text-amber-400"
              }`}
            >
              {validation.message}
            </span>
          </div>
        )}
      </div>
      <Input
        id={id}
        className={cn(
          validation?.severity === "error" && "border-red-300 focus:border-red-500 dark:border-red-700",
          className,
        )}
        aria-invalid={validation?.severity === "error"}
        aria-errormessage={validation ? `${id}-error` : undefined}
        {...props}
      />
      {description && !validation && <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>}
    </div>
  )
}
