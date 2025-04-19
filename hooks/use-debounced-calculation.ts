"use client"

import { useState, useEffect, useRef } from "react"
import type { SettingsState, Costs, RevenueCalculations } from "@/lib/types"
import { calculateCosts } from "@/lib/cost-engine"
import { calculateRevenue } from "@/lib/revenue-engine"

interface CalculationResult {
  costs: Costs
  revenue: RevenueCalculations | undefined
  isCalculating: boolean
}

export function useDebouncedCalculation(settings: SettingsState, debounceMs = 200): CalculationResult {
  const [costs, setCosts] = useState<Costs>(() => calculateCosts(settings))
  const [revenue, setRevenue] = useState<RevenueCalculations | undefined>(() =>
    calculateRevenue(settings.revenue, costs, settings.channels, settings.vodCategories),
  )
  const [isCalculating, setIsCalculating] = useState(false)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const latestSettingsRef = useRef(settings)

  // Update the ref whenever settings change
  useEffect(() => {
    latestSettingsRef.current = settings

    // Set calculating state immediately
    setIsCalculating(true)

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set a new timeout for the debounced calculation
    timeoutRef.current = setTimeout(() => {
      const newCosts = calculateCosts(latestSettingsRef.current)
      const newRevenue = calculateRevenue(
        latestSettingsRef.current.revenue,
        newCosts,
        latestSettingsRef.current.channels,
        latestSettingsRef.current.vodCategories,
      )

      setCosts(newCosts)
      setRevenue(newRevenue)
      setIsCalculating(false)
    }, debounceMs)

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [settings, debounceMs])

  return { costs, revenue, isCalculating }
}
