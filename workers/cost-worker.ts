// This file will be used as a web worker to offload cost calculations

import { calculateCosts } from "../lib/cost-engine"
import { calculateRevenue } from "../lib/revenue-engine"

// Listen for messages from the main thread
self.addEventListener("message", (event) => {
  const { settings, type } = event.data

  try {
    if (type === "calculate-costs") {
      const costs = calculateCosts(settings)
      self.postMessage({ type: "costs-result", costs })
    } else if (type === "calculate-revenue") {
      const costs = calculateCosts(settings)
      const revenue = calculateRevenue(settings.revenue, costs, settings.channels || [], settings.vodCategories || [])
      self.postMessage({ type: "revenue-result", revenue, costs })
    }
  } catch (error) {
    self.postMessage({
      type: "error",
      error: error instanceof Error ? error.message : String(error),
    })
  }
})
