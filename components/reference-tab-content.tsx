"use client"

import { memo } from "react"
import { PricingAssumptions } from "@/components/pricing-assumptions"
import ValidatedAssumptions from "@/components/validated-assumptions"
import { CitationsList } from "@/components/citations"
import type { SettingsState } from "@/lib/types"

interface ReferenceTabContentProps {
  settings: SettingsState
  validationResults: any[]
}

export const ReferenceTabContent = memo(function ReferenceTabContent({
  settings,
  validationResults,
}: ReferenceTabContentProps) {
  return (
    <>
      <PricingAssumptions platform={settings.platform} className="mb-6" />
      <ValidatedAssumptions settings={settings} validationResults={validationResults} className="mb-6" />
      <CitationsList platform={settings.platform} />
    </>
  )
})
