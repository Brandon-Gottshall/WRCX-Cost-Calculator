"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { defaultChannels } from "@/seed/defaultChannels"
import { globalDefaults } from "@/seed/globalDefaults"
import type { SettingsState } from "@/lib/types"

const STORAGE_KEY = "wrcx-calculator-state"

export function initializeStore(defaultState: SettingsState): SettingsState {
  // Check if code is running in browser environment
  if (typeof window === "undefined") {
    // Return default state when running on the server
    return {
      ...defaultState,
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
    ...defaultState,
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

// Infrastructure context
interface HardwareSettings {
  cpuCores: number
  memoryGB: number
  storageGB: number
  bandwidthMbps: number
  overrideMode: boolean
}

interface InfrastructureContextType {
  hardwareSettings: HardwareSettings
  updateHardwareSettings: (settings: Partial<HardwareSettings>) => void
}

const defaultHardwareSettings: HardwareSettings = {
  cpuCores: 4,
  memoryGB: 8,
  storageGB: 500,
  bandwidthMbps: 100,
  overrideMode: false,
}

const InfrastructureContext = createContext<InfrastructureContextType | undefined>(undefined)

export function InfrastructureProvider({ children }: { children: ReactNode }) {
  const [hardwareSettings, setHardwareSettings] = useState<HardwareSettings>(defaultHardwareSettings)

  const updateHardwareSettings = (settings: Partial<HardwareSettings>) => {
    setHardwareSettings((prev) => ({ ...prev, ...settings }))
  }

  return (
    <InfrastructureContext.Provider
      value={{
        hardwareSettings,
        updateHardwareSettings,
      }}
    >
      {children}
    </InfrastructureContext.Provider>
  )
}

export function useInfrastructure() {
  const context = useContext(InfrastructureContext)
  if (context === undefined) {
    throw new Error("useInfrastructure must be used within an InfrastructureProvider")
  }
  return context
}
