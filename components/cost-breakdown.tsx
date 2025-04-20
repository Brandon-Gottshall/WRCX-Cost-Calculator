"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shimmer } from "@/components/ui/shimmer"
import { AnimatedNumber } from "@/components/ui/animated-number"
import { formatCurrency } from "@/lib/utils"
import type { Costs, SettingsState } from "@/lib/types"
import { ClientOnly } from "@/components/client-only"

interface CostBreakdownProps {
  costs?: Costs | null
  settings: SettingsState
  isCalculating?: boolean
}

// Default costs object to use when costs is null or undefined
const defaultCosts: Costs = {
  encoding: 0,
  storage: 0,
  delivery: 0,
  other: 0,
}

export function CostBreakdown({ costs, settings, isCalculating = false }: CostBreakdownProps) {
  // Use default costs if costs is null or undefined
  const safeCosts = costs || defaultCosts

  const totalMonthlyCost = safeCosts.encoding + safeCosts.storage + safeCosts.delivery + safeCosts.other
  const annualCost = totalMonthlyCost * 12

  return (
    <ClientOnly>
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-slate-500 dark:text-slate-400">Encoding</div>
              <Shimmer active={isCalculating} className="inline-block">
                <AnimatedNumber value={safeCosts.encoding} className="text-sm font-mono tabular-nums" />
              </Shimmer>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-slate-500 dark:text-slate-400">Storage</div>
              <Shimmer active={isCalculating} className="inline-block">
                <AnimatedNumber value={safeCosts.storage} className="text-sm font-mono tabular-nums" />
              </Shimmer>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-slate-500 dark:text-slate-400">Delivery</div>
              <Shimmer active={isCalculating} className="inline-block">
                <AnimatedNumber value={safeCosts.delivery} className="text-sm font-mono tabular-nums" />
              </Shimmer>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-slate-500 dark:text-slate-400">Other</div>
              <Shimmer active={isCalculating} className="inline-block">
                <AnimatedNumber value={safeCosts.other} className="text-sm font-mono tabular-nums" />
              </Shimmer>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Annual Cost</span>
              <span className="text-sm font-mono tabular-nums">{formatCurrency(annualCost)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </ClientOnly>
  )
}
