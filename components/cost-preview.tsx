"use client"

import { motion, AnimatePresence } from "framer-motion"
import { BarChart3, TrendingUp, Database, HardDrive, Globe } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Costs, SettingsState, Platform } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

interface CostPreviewProps {
  costs: Costs
  settings: SettingsState
}

export function CostPreview({ costs, settings }: CostPreviewProps) {
  const totalMonthlyCost = costs.encoding + costs.storage + costs.delivery + costs.other

  const costItems = [
    {
      name: "Encoding",
      value: costs.encoding,
      icon: TrendingUp,
      color: "text-blue-500 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      name: "Storage",
      value: costs.storage,
      icon: Database,
      color: "text-purple-500 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      name: "Delivery",
      value: costs.delivery,
      icon: Globe,
      color: "text-green-500 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      name: "Other",
      value: costs.other,
      icon: HardDrive,
      color: "text-amber-500 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
  ]

  return (
    <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/30 flex flex-row items-center justify-between">
        <div>
          <CardTitle>Cost Preview</CardTitle>
          <CardDescription>Monthly estimated costs</CardDescription>
        </div>
        <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900/50">
          <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6" role="region" aria-live="polite">
          <div className="space-y-4">
            {costItems.map((item) => (
              <motion.div
                key={item.name}
                className="flex items-center justify-between"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${item.bgColor}`}>
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={item.value}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="text-sm font-mono tabular-nums"
                  >
                    {formatCurrency(item.value)}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Total Monthly</span>
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={totalMonthlyCost}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-lg font-bold font-mono tabular-nums"
                >
                  {formatCurrency(totalMonthlyCost)}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Annual Cost</span>
              <span className="text-sm font-mono tabular-nums">{formatCurrency(totalMonthlyCost * 12)}</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Platform: {getPlatformName(settings.platform)}</h3>
            <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
              <p>
                • {settings.channelCount} live channel{settings.channelCount !== 1 ? "s" : ""}
              </p>
              <p>• {settings.peakConcurrentViewers} peak viewers per channel</p>
              {settings.liveDvrEnabled && <p>• Live DVR enabled</p>}
              {settings.vodEnabled && <p>• VOD archiving: {settings.hoursPerDayArchived} hours/day</p>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getPlatformName(platform: Platform): string {
  switch (platform) {
    case "mux":
      return "Mux"
    case "cloudflare":
      return "Cloudflare Stream"
    case "self-hosted":
      return "Self-Hosted"
    case "hybrid":
      return "Hybrid"
    default:
      return "Unknown"
  }
}
