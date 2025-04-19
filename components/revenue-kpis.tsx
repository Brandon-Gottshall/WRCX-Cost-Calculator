"use client"

import { motion, AnimatePresence } from "framer-motion"
import { DollarSign, TrendingUp, Tv2, Film } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { RevenueCalculations } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

interface RevenueKPIsProps {
  revenue: RevenueCalculations
}

// Helper function to ensure numeric values and prevent NaN
function ensureNumber(value: any, defaultValue = 0): number {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return defaultValue
  }
  return Number(value)
}

export function RevenueKPIs({ revenue }: RevenueKPIsProps) {
  const kpis = [
    {
      title: "Live Ad Revenue",
      value: ensureNumber(revenue.liveAdRevenue),
      icon: Tv2,
      color: "text-blue-500 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Paid Programming",
      value: ensureNumber(revenue.paidProgrammingRevenue),
      icon: DollarSign,
      color: "text-purple-500 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      title: "VOD Ad Revenue",
      value: ensureNumber(revenue.vodAdRevenue),
      icon: Film,
      color: "text-green-500 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Total Revenue",
      value: ensureNumber(revenue.totalRevenue),
      icon: TrendingUp,
      color: "text-amber-500 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      isTotal: true,
    },
  ]

  return (
    <div className="flex flex-col space-y-4">
      {kpis.map((kpi) => (
        <Card
          key={kpi.title}
          className={`border-slate-200 dark:border-slate-800 h-full ${kpi.isTotal ? "border-l-4 border-l-amber-500 dark:border-l-amber-400" : ""}`}
        >
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-md ${kpi.bgColor}`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
              <span className="text-sm font-medium">{kpi.title}</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={kpi.value}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className={`text-xl font-bold min-h-[28px] ${kpi.isTotal ? "text-amber-600 dark:text-amber-400" : ""}`}
              >
                {formatCurrency(kpi.value)}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
