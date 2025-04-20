"use client"

import { useState, useEffect, useCallback } from "react"
import { calculateCosts } from "@/lib/cost-engine"
import { calculateRevenue } from "@/lib/revenue-engine"
import type { Costs, SettingsState, RevenueCalculations } from "@/lib/types"

// Default costs object
const defaultCosts: Costs = {
  encoding: 0,
  storage: 0,
  delivery: 0,
  other: 0,
}

// Default revenue object
const defaultRevenue: RevenueCalculations = {
  liveAdRevenue: 0,
  paidProgrammingRevenue: 0,
  vodAdRevenue: 0,
  totalRevenue: 0,
  netOperatingProfit: 0,
  channelRevenues: [],
  vodCategoryRevenues: [],
}

export function useDebouncedCalculation(settings: SettingsState, delay = 300) {
  const [costs, setCosts] = useState<Costs>(defaultCosts)
  const [revenue, setRevenue] = useState<RevenueCalculations>(defaultRevenue)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const recalculate = useCallback(() => {
    setIsCalculating(true)
    setError(null)

    // Use setTimeout to simulate a delay and allow the UI to update
    setTimeout(() => {
      try {
        // Calculate costs
        const calculatedCosts = calculateCosts(settings)
        setCosts(calculatedCosts || defaultCosts)

        // Calculate revenue
        const calculatedRevenue = calculateRevenue(
          settings.revenue,
          calculatedCosts || defaultCosts,
          settings.channels || [],
          settings.vodCategories || [],
        )
        setRevenue(calculatedRevenue || defaultRevenue)
      } catch (err) {
        console.error("Error calculating costs or revenue:", err)
        setError(err instanceof Error ? err : new Error(String(err)))
        // Set default values on error
        setCosts(defaultCosts)
        setRevenue(defaultRevenue)
      } finally {
        setIsCalculating(false)
      }
    }, delay)
  }, [settings, delay])

  // Recalculate when settings change
  useEffect(() => {
    recalculate()
  }, [recalculate])

  return { costs, revenue, isCalculating, error, recalculate }
}
