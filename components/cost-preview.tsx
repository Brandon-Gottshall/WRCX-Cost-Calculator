"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BarChart3, TrendingUp, Database, HardDrive, Globe, X, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Costs, SettingsState, Platform } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

interface CostPreviewProps {
  costs: Costs
  settings: SettingsState
}

export function CostPreview({ costs, settings }: CostPreviewProps) {
  const [showDetailView, setShowDetailView] = useState(false)
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
        {!showDetailView ? (
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

            <button
              onClick={() => setShowDetailView(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md transition-colors"
            >
              <ChevronDown size={16} />
              <span className="text-sm font-medium">Show Detailed Breakdown</span>
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white dark:bg-slate-900 overflow-auto"
          >
            <div className="max-w-4xl mx-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Detailed Cost Breakdown</h2>
                <button
                  onClick={() => setShowDetailView(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8">
                {/* Encoding Costs */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/30">
                      <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold">Encoding Costs</h3>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="text-left py-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            Item
                          </th>
                          <th className="text-right py-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            Cost
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <td className="py-3 text-sm">
                            <div className="font-medium">Live Encoding</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {settings.channelCount} channel(s) × 24 hours × 30 days
                            </div>
                          </td>
                          <td className="py-3 text-right font-mono text-sm">{formatCurrency(costs.encoding * 0.7)}</td>
                        </tr>
                        {settings.legacyEnabled && (
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <td className="py-3 text-sm">
                              <div className="font-medium">Legacy VOD Encoding</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {settings.backCatalogHours} hours of content
                              </div>
                            </td>
                            <td className="py-3 text-right font-mono text-sm">
                              {formatCurrency(costs.encoding * 0.3)}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td className="py-3 text-sm font-medium">Total Encoding</td>
                          <td className="py-3 text-right font-mono text-sm font-bold">
                            {formatCurrency(costs.encoding)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Storage Costs */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-purple-100 dark:bg-purple-900/30">
                      <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold">Storage Costs</h3>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="text-left py-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            Item
                          </th>
                          <th className="text-right py-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            Cost
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {settings.vodEnabled && (
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <td className="py-3 text-sm">
                              <div className="font-medium">VOD Storage</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {settings.hoursPerDayArchived} hours/day × {settings.retentionWindow} days retention
                              </div>
                            </td>
                            <td className="py-3 text-right font-mono text-sm">{formatCurrency(costs.storage * 0.6)}</td>
                          </tr>
                        )}
                        {settings.legacyEnabled && (
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <td className="py-3 text-sm">
                              <div className="font-medium">Legacy Content Storage</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {settings.backCatalogHours} hours of content
                              </div>
                            </td>
                            <td className="py-3 text-right font-mono text-sm">{formatCurrency(costs.storage * 0.4)}</td>
                          </tr>
                        )}
                        <tr>
                          <td className="py-3 text-sm font-medium">Total Storage</td>
                          <td className="py-3 text-right font-mono text-sm font-bold">
                            {formatCurrency(costs.storage)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Delivery Costs */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-green-100 dark:bg-green-900/30">
                      <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold">Delivery Costs</h3>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="text-left py-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            Item
                          </th>
                          <th className="text-right py-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            Cost
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <td className="py-3 text-sm">
                            <div className="font-medium">Live Stream Delivery</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {settings.channelCount} channel(s) × {settings.peakConcurrentViewers} viewers
                            </div>
                          </td>
                          <td className="py-3 text-right font-mono text-sm">{formatCurrency(costs.delivery * 0.7)}</td>
                        </tr>
                        {settings.vodEnabled && (
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <td className="py-3 text-sm">
                              <div className="font-medium">VOD Delivery</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                Based on {settings.peakConcurrentVodViewers} concurrent VOD viewers
                              </div>
                            </td>
                            <td className="py-3 text-right font-mono text-sm">
                              {formatCurrency(costs.delivery * 0.3)}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td className="py-3 text-sm font-medium">Total Delivery</td>
                          <td className="py-3 text-right font-mono text-sm font-bold">
                            {formatCurrency(costs.delivery)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Other Costs */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-amber-100 dark:bg-amber-900/30">
                      <HardDrive className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-xl font-semibold">Other Costs</h3>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="text-left py-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            Item
                          </th>
                          <th className="text-right py-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            Cost
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {settings.cdnPlan !== "free" && (
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <td className="py-3 text-sm">
                              <div className="font-medium">CDN Plan ({settings.cdnPlan})</div>
                            </td>
                            <td className="py-3 text-right font-mono text-sm">
                              {formatCurrency(settings.cdnPlan === "pro" ? 20 : 200)}
                            </td>
                          </tr>
                        )}
                        {settings.macMiniNeeded && (
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <td className="py-3 text-sm">
                              <div className="font-medium">Mac Mini (Amortized)</div>
                            </td>
                            <td className="py-3 text-right font-mono text-sm">{formatCurrency(36)}</td>
                          </tr>
                        )}
                        {settings.networkSwitchNeeded && (
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <td className="py-3 text-sm">
                              <div className="font-medium">Network Switch (Amortized)</div>
                            </td>
                            <td className="py-3 text-right font-mono text-sm">{formatCurrency(2)}</td>
                          </tr>
                        )}
                        {settings.outboundEmail && (
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <td className="py-3 text-sm">
                              <div className="font-medium">Email Service</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {settings.monthlyEmailVolume} emails/month
                              </div>
                            </td>
                            <td className="py-3 text-right font-mono text-sm">
                              {formatCurrency(Math.min(settings.monthlyEmailVolume / 1000, 1) * 10)}
                            </td>
                          </tr>
                        )}
                        {settings.viewerAnalytics !== "none" && (
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <td className="py-3 text-sm">
                              <div className="font-medium">Viewer Analytics</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {settings.viewerAnalytics}
                              </div>
                            </td>
                            <td className="py-3 text-right font-mono text-sm">
                              {formatCurrency(
                                settings.viewerAnalytics === "mux-data" && settings.platform === "mux"
                                  ? 0
                                  : settings.viewerAnalytics === "cf-analytics" && settings.platform === "cloudflare"
                                    ? 0
                                    : settings.viewerAnalytics === "mux-data"
                                      ? 50
                                      : settings.viewerAnalytics === "cf-analytics"
                                        ? 20
                                        : settings.viewerAnalytics === "self-host-grafana"
                                          ? 10
                                          : 0,
                              )}
                            </td>
                          </tr>
                        )}

                        {settings.siteAnalytics !== "none" && (
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <td className="py-3 text-sm">
                              <div className="font-medium">Site Analytics</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">{settings.siteAnalytics}</div>
                            </td>
                            <td className="py-3 text-right font-mono text-sm">
                              {formatCurrency(
                                settings.siteAnalytics === "plausible"
                                  ? 9
                                  : settings.siteAnalytics === "fathom"
                                    ? 14
                                    : settings.siteAnalytics === "matomo"
                                      ? 19
                                      : 0,
                              )}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td className="py-3 text-sm font-medium">Total Other Costs</td>
                          <td className="py-3 text-right font-mono text-sm font-bold">{formatCurrency(costs.other)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Hardware Costs */}
                {(settings.platform === "self-hosted" || settings.platform === "hybrid") && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-purple-100 dark:bg-purple-900/30">
                        <HardDrive className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-xl font-semibold">Hardware Costs</h3>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <th className="text-left py-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                              Item
                            </th>
                            <th className="text-right py-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                              Cost
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {!settings.hardwareAvailable && (
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                              <td className="py-3 text-sm">
                                <div className="font-medium">
                                  {settings.serverType.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} (
                                  {settings.serverCount})
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  Amortized over 36 months
                                </div>
                              </td>
                              <td className="py-3 text-right font-mono text-sm">
                                {formatCurrency((settings.serverCost * settings.serverCount) / 36)}
                              </td>
                            </tr>
                          )}
                          {settings.networkSwitchNeeded && (
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                              <td className="py-3 text-sm">
                                <div className="font-medium">Network Switch</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">Amortized cost</div>
                              </td>
                              <td className="py-3 text-right font-mono text-sm">{formatCurrency(20)}</td>
                            </tr>
                          )}
                          {settings.rackHostingLocation === "colo" && (
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                              <td className="py-3 text-sm">
                                <div className="font-medium">Colocation Costs</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {settings.rackCost} per rack unit
                                </div>
                              </td>
                              <td className="py-3 text-right font-mono text-sm">
                                {formatCurrency(
                                  settings.rackCost *
                                    (settings.serverType.includes("studio") ? 2 : 1) *
                                    settings.serverCount,
                                )}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4">Cost Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Encoding</span>
                      <span className="font-mono">{formatCurrency(costs.encoding)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Storage</span>
                      <span className="font-mono">{formatCurrency(costs.storage)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Delivery</span>
                      <span className="font-mono">{formatCurrency(costs.delivery)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Other</span>
                      <span className="font-mono">{formatCurrency(costs.other)}</span>
                    </div>
                    <div className="pt-3 border-t border-blue-200 dark:border-blue-800 flex justify-between">
                      <span className="font-bold">Monthly Total</span>
                      <span className="font-mono font-bold">{formatCurrency(totalMonthlyCost)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                      <span>Annual Cost</span>
                      <span className="font-mono">{formatCurrency(totalMonthlyCost * 12)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowDetailView(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  <ChevronUp size={16} />
                  <span className="font-medium">Close Detailed View</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
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
