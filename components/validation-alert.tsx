import { AlertCircle, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ValidationAlertProps {
  message: string
  severity?: "error" | "warning"
}

export function ValidationAlert({ message, severity = "error" }: ValidationAlertProps) {
  return (
    <Alert
      variant={severity === "error" ? "destructive" : undefined}
      className={
        severity === "error"
          ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30"
          : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/30"
      }
    >
      {severity === "error" ? (
        <AlertCircle className="h-4 w-4 text-red-700 dark:text-red-400" />
      ) : (
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      )}
      <AlertDescription
        className={`text-sm ${severity === "error" ? "text-red-700 dark:text-red-300" : "text-amber-700 dark:text-amber-300"}`}
      >
        {message}
      </AlertDescription>
    </Alert>
  )
}
