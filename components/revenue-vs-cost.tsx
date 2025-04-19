"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { RevenueCalculations } from "@/lib/types"
import type { Costs } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

interface RevenueVsCostProps {
  revenue: RevenueCalculations
  costs: Costs
}

// Helper function to ensure numeric values and prevent NaN
function ensureNumber(value: any, defaultValue = 0): number {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return defaultValue
  }
  return Number(value)
}

export function RevenueVsCost({ revenue, costs }: RevenueVsCostProps) {
  const totalCost =
    ensureNumber(costs.encoding) +
    ensureNumber(costs.storage) +
    ensureNumber(costs.delivery) +
    ensureNumber(costs.other)

  const data = [
    {
      name: "Revenue",
      value: ensureNumber(revenue.totalRevenue),
      breakdown: [
        { name: "Live Ads", value: ensureNumber(revenue.liveAdRevenue) },
        { name: "Paid Programming", value: ensureNumber(revenue.paidProgrammingRevenue) },
        { name: "VOD Ads", value: ensureNumber(revenue.vodAdRevenue) },
      ],
    },
    {
      name: "Cost",
      value: totalCost,
      breakdown: [
        { name: "Encoding", value: ensureNumber(costs.encoding) },
        { name: "Storage", value: ensureNumber(costs.storage) },
        { name: "Delivery", value: ensureNumber(costs.delivery) },
        { name: "Other", value: ensureNumber(costs.other) },
      ],
    },
  ]

  const chartData = [{ name: "Revenue vs. Cost", Revenue: ensureNumber(revenue.totalRevenue), Cost: totalCost }]

  const isProfit = ensureNumber(revenue.netOperatingProfit) >= 0

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/30">
        <CardTitle>Revenue vs. Cost</CardTitle>
        <CardDescription>Monthly financial overview</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="h-auto">
          <div className="mb-4 text-center text-sm text-slate-500 dark:text-slate-400">Monthly Financial Overview</div>

          <div className="flex flex-col space-y-4">
            {/* Revenue Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Revenue</span>
                <span className="font-mono">{formatCurrency(ensureNumber(revenue.totalRevenue))}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-green-500 dark:bg-green-600 h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (ensureNumber(revenue.totalRevenue) / Math.max(ensureNumber(revenue.totalRevenue), totalCost)) * 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Live Ads: {formatCurrency(ensureNumber(revenue.liveAdRevenue))}</span>
                <span>Paid: {formatCurrency(ensureNumber(revenue.paidProgrammingRevenue))}</span>
                <span>VOD: {formatCurrency(ensureNumber(revenue.vodAdRevenue))}</span>
              </div>
            </div>

            {/* Cost Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Cost</span>
                <span className="font-mono">{formatCurrency(totalCost)}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-red-500 dark:bg-red-600 h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (totalCost / Math.max(ensureNumber(revenue.totalRevenue), totalCost)) * 100)}%`,
                  }}
                />
              </div>
              <div className="flex flex-wrap justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Encoding: {formatCurrency(ensureNumber(costs.encoding))}</span>
                <span>Storage: {formatCurrency(ensureNumber(costs.storage))}</span>
                <span>Delivery: {formatCurrency(ensureNumber(costs.delivery))}</span>
                <span>Other: {formatCurrency(ensureNumber(costs.other))}</span>
              </div>
            </div>

            {/* Net Profit/Loss */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <span className="font-medium">Net Profit/Loss</span>
                <span
                  className={`font-medium ${isProfit ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {formatCurrency(ensureNumber(revenue.netOperatingProfit))}
                </span>
              </div>

              {/* Profit/Loss Indicator */}
              <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`${isProfit ? "bg-green-500 dark:bg-green-600" : "bg-red-500 dark:bg-red-600"} h-full rounded-full`}
                  style={{
                    width: `${Math.min(100, (Math.abs(ensureNumber(revenue.netOperatingProfit)) / Math.max(ensureNumber(revenue.totalRevenue), totalCost)) * 100)}%`,
                    marginLeft: isProfit ? "0" : "auto",
                    marginRight: isProfit ? "auto" : "0",
                  }}
                />
              </div>

              <div className="mt-2 text-xs text-center text-slate-500 dark:text-slate-400">
                {isProfit
                  ? `${((ensureNumber(revenue.netOperatingProfit) / ensureNumber(revenue.totalRevenue)) * 100).toFixed(1)}% profit margin`
                  : `${((Math.abs(ensureNumber(revenue.netOperatingProfit)) / totalCost) * 100).toFixed(1)}% loss ratio`}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Net Operating Profit</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">Revenue - Cost</span>
            </div>
            <motion.div
              key={ensureNumber(revenue.netOperatingProfit)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`text-xl font-bold ${isProfit ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              {formatCurrency(ensureNumber(revenue.netOperatingProfit))}
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium mb-3">Revenue Breakdown</h3>
            <div className="space-y-2">
              {data[0].breakdown.map((item) => (
                <div key={item.name} className="flex justify-between items-center">
                  <span className="text-sm">{item.name}</span>
                  <span className="text-sm font-mono">{formatCurrency(item.value)}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="font-medium">Total Revenue</span>
                <span className="font-medium font-mono">{formatCurrency(ensureNumber(revenue.totalRevenue))}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3">Cost Breakdown</h3>
            <div className="space-y-2">
              {data[1].breakdown.map((item) => (
                <div key={item.name} className="flex justify-between items-center">
                  <span className="text-sm">{item.name}</span>
                  <span className="text-sm font-mono">{formatCurrency(item.value)}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="font-medium">Total Cost</span>
                <span className="font-medium font-mono">{formatCurrency(totalCost)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
