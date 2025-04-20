"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { InputFeedbackWrapper } from "./input-feedback-wrapper"

interface EnhancedValidatedInputProps {
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
  required?: boolean
  inputMode?: "numeric" | "text" | "tel" | "email" | "url" | "search" | "none" | "decimal"
  pattern?: string
}

export function EnhancedValidatedInput({
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
  error: externalError,
  isCalculating = false,
  required = false,
  inputMode,
  pattern,
}: EnhancedValidatedInputProps) {
  const [localValue, setLocalValue] = useState(value)
  const [isFocused, setIsFocused] = useState(false)
  const [internalError, setInternalError] = useState<string | null>(null)

  // Update local value when prop value changes
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value)
    }
  }, [value, isFocused])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)

    // Validate for numeric inputs
    if (type === "number") {
      const numValue = Number.parseFloat(newValue)
      if (newValue && (isNaN(numValue) || (min !== undefined && numValue < min))) {
        setInternalError(
          `Please enter a ${min !== undefined ? `number greater than or equal to ${min}` : "valid number"}.`,
        )
      } else {
        setInternalError(null)
      }
    }

    onChange(newValue)
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)

    // Additional validation on blur
    if (type === "number" && localValue) {
      const numValue = Number.parseFloat(localValue.toString())
      if (isNaN(numValue) || (min !== undefined && numValue < min)) {
        setInternalError(
          `Please enter a ${min !== undefined ? `number greater than or equal to ${min}` : "valid number"}.`,
        )
      } else {
        setInternalError(null)
      }
    }

    if (onBlur) onBlur()
  }

  const error = externalError || internalError

  return (
    <div className={cn("flex flex-col space-y-1", className)}>
      <Label htmlFor={id} className="min-h-[1.5rem] text-sm font-medium">
        {label}
        {required && <span className="text-red-700 ml-1">*</span>}
      </Label>

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
          className={cn(error ? "border-destructive" : "", "focus:outline focus:outline-offset-2")}
          required={required}
          inputMode={inputMode}
          pattern={pattern}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </InputFeedbackWrapper>

      {error && (
        <p id={`${id}-error`} className="text-xs text-red-700 mt-1">
          {error}
        </p>
      )}
    </div>
  )
}
