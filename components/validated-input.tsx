"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { ValidationAlert } from "./validation-alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { InputFeedbackWrapper } from "./input-feedback-wrapper"

interface ValidatedInputProps {
  id: string
  label: string
  value: string | number
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  type?: string
  min?: number
  max?: number
  step?: number
  className?: string
  tooltip?: string
  error?: string
  isCalculating?: boolean
}

export function ValidatedInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type = "text",
  min,
  max,
  step,
  className,
  tooltip,
  error,
  isCalculating = false,
}: ValidatedInputProps) {
  const [localValue, setLocalValue] = useState(value)
  const [isFocused, setIsFocused] = useState(false)

  // Update local value when prop value changes
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value)
    }
  }, [value, isFocused])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    onChange(newValue)
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (onBlur) onBlur()
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <InputFeedbackWrapper isCalculating={isCalculating}>
        <Input
          id={id}
          type={type}
          value={localValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={cn(error ? "border-destructive" : "")}
        />
      </InputFeedbackWrapper>

      {error && <ValidationAlert message={error} />}
    </div>
  )
}
