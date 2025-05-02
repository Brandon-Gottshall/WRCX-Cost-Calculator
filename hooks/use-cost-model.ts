"use client"

import { useMemo } from "react"
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

export function useCostModel(settings: SettingsState) {
  // Memoize cost calculations
  const costs = useMemo(() => {
    try {
      return calculateCosts(settings)
    } catch (error) {
      console.error("Error calculating costs:", error)
      return defaultCosts
    }
  }, [settings])

  // Memoize revenue calculations
  const revenue = useMemo(() => {
    try {
      return calculateRevenue(settings.revenue, costs, settings.channels || [], settings.vodCategories || [])
    } catch (error) {
      console.error("Error calculating revenue:", error)
      return defaultRevenue
    }
  }, [settings.revenue, costs, settings.channels, settings.vodCategories])

  // Memoize total cost calculation
  const totalMonthlyCost = useMemo(() => {
    return costs.encoding + costs.storage + costs.delivery + costs.other
  }, [costs])

  // Memoize annual cost calculation
  const annualCost = useMemo(() => {
    return totalMonthlyCost * 12
  }, [totalMonthlyCost])

  return {
    costs,
    revenue,
    totalMonthlyCost,
    annualCost,
  }
}
