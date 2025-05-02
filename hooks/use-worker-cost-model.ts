"use client"

import { useState, useEffect, useRef } from "react"
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

export function useWorkerCostModel(settings: SettingsState) {
  const [costs, setCosts] = useState<Costs>(defaultCosts)
  const [revenue, setRevenue] = useState<RevenueCalculations>(defaultRevenue)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    // Create worker only on client side
    if (typeof window !== "undefined" && !workerRef.current) {
      try {
        workerRef.current = new Worker(new URL("../workers/cost-worker.ts", import.meta.url))

        // Set up message handler
        workerRef.current.onmessage = (event) => {
          const { type, costs, revenue, error } = event.data

          if (type === "costs-result") {
            setCosts(costs)
            setIsCalculating(false)
          } else if (type === "revenue-result") {
            setCosts(costs)
            setRevenue(revenue)
            setIsCalculating(false)
          } else if (type === "error") {
            console.error("Worker error:", error)
            setError(new Error(error))
            setIsCalculating(false)
          }
        }

        // Handle worker errors
        workerRef.current.onerror = (error) => {
          console.error("Worker error:", error)
          setError(new Error("An error occurred in the cost calculation worker"))
          setIsCalculating(false)
        }
      } catch (err) {
        console.error("Failed to create worker:", err)
        setError(err instanceof Error ? err : new Error(String(err)))
      }
    }

    // Clean up worker on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
      }
    }
  }, [])

  // Trigger calculations when settings change
  useEffect(() => {
    if (workerRef.current) {
      setIsCalculating(true)
      workerRef.current.postMessage({
        type: "calculate-revenue",
        settings,
      })
    }
  }, [settings])

  // Calculate derived values
  const totalMonthlyCost = costs.encoding + costs.storage + costs.delivery + costs.other
  const annualCost = totalMonthlyCost * 12

  return {
    costs,
    revenue,
    totalMonthlyCost,
    annualCost,
    isCalculating,
    error,
  }
}
