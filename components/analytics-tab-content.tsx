"use client"

import { memo } from "react"
import { SettingsCard } from "@/components/settings-card"
import type { SettingsState } from "@/lib/types"

interface AnalyticsTabContentProps {
  settings: SettingsState
  updateSettings: (settings: Partial<SettingsState>) => void
  validationResults: any[]
  isEdited?: (fieldPath: string) => boolean
}

export const AnalyticsTabContent = memo(function AnalyticsTabContent({
  settings,
  updateSettings,
  validationResults,
  isEdited,
}: AnalyticsTabContentProps) {
  return (
    <SettingsCard
      title="Analytics"
      description="Configure analytics settings"
      settings={settings}
      updateSettings={updateSettings}
      type="analytics"
      validationResults={validationResults}
      isEdited={isEdited}
    />
  )
})
