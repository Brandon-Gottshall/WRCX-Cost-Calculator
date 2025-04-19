import { defaultChannels } from "@/seed/defaultChannels"
import { globalDefaults } from "@/seed/globalDefaults"
import type { SettingsState } from "@/lib/types"

const STORAGE_KEY = "wrcx-calculator-state"

export function initializeStore(initialState: SettingsState): SettingsState {
  // Check if code is running in browser environment
  if (typeof window === "undefined") {
    // Return default state when running on the server
    return {
      ...initialState,
      channels: defaultChannels,
      ...globalDefaults,
    }
  }

  // Only access localStorage when in browser environment
  try {
    const savedState = localStorage.getItem(STORAGE_KEY)
    if (savedState) {
      try {
        // Parse and return the saved state
        return JSON.parse(savedState)
      } catch (error) {
        console.error("Failed to parse saved state:", error)
        // Fall back to default initialization
      }
    }
  } catch (error) {
    console.error("Error accessing localStorage:", error)
  }

  // If no saved state or parsing failed, initialize with defaults
  return {
    ...initialState,
    channels: defaultChannels,
    ...globalDefaults,
  }
}

export function saveStore(state: SettingsState): void {
  // Only attempt to save if in browser environment
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error("Failed to save state:", error)
  }
}
