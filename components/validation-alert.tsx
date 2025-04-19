import { AlertCircle, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { ValidationResult } from "@/lib/validation"

interface ValidationAlertProps {
  validationResults: ValidationResult[]
}

export function ValidationAlert({ validationResults }: ValidationAlertProps) {
  if (validationResults.length === 0) return null

  const errors = validationResults.filter((result) => result.severity === "error")
  const warnings = validationResults.filter((result) => result.severity === "warning")

  return (
    <div className="space-y-3">
      {errors.length > 0 && (
        <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-sm text-red-700 dark:text-red-300">
            <div className="font-medium mb-1">Please fix the following errors:</div>
            <ul className="list-disc pl-5 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {warnings.length > 0 && (
        <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/30">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-sm text-amber-700 dark:text-amber-300">
            <div className="font-medium mb-1">Warnings:</div>
            <ul className="list-disc pl-5 space-y-1">
              {warnings.map((warning, index) => (
                <li key={index}>{warning.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
