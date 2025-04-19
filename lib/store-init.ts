"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { SettingsState } from "./types"

// Original localStorage functions
export function initializeStore(defaultState: SettingsState): SettingsState {
  if (typeof window === "undefined") {
    return defaultState
  }

  try {
    const savedState = localStorage.getItem("wrcx-calculator-state")
    if (savedState) {
      return JSON.parse(savedState)
    }
  } catch (error) {
    console.error("Error loading state from localStorage:", error)
  }

  return defaultState
}

export function saveStore(state: SettingsState): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.setItem("wrcx-calculator-state", JSON.stringify(state))
  } catch (error) {
    console.error("Error saving state to localStorage:", error)
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
    <InfrastructureContext.Provider value={{ hardwareSettings, updateHardwareSettings }}>
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
