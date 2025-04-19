"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BarChart3, TrendingUp, Database, HardDrive, Globe, X, ChevronDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Costs, SettingsState, Platform, RevenueCalculations } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Add this helper function at the top of the file, before the CostPreview component
function getPricingAssumptions(platform: Platform) {
  const assumptions = {
    mux: {
      encoding: [
        { label: "1080p Live Encoding (Plus)", value: "$0.040/min" },
        { label: "720p Live Encoding (Plus)", value: "$0.030/min" },
        { label: "Storage", value: "$0.003/min" },
        { label: "Delivery", value: "$0.00096/min (starting)" },
      ],
      analytics: [
        { label: "Mux Data", value: "Free base tier (up to 100k views)" },
        { label: "Premium Analytics", value: "$50/mo (over 100k views)" },
      ],
    },
    cloudflare: {
      encoding: [
        { label: "Encoding", value: "Free" },
        { label: "Storage", value: "$5 / 1000 min ($0.005/min)" },
        { label: "Delivery", value: "$1 / 1000 min ($0.001/min)" },
      ],
      analytics: [
        { label: "CF Web Analytics", value: "Free" },
        { label: "Advanced Analytics", value: "Included with Pro/Business plans" },
      ],
    },
    "self-hosted": {
      infrastructure: [
        { label: "Mac Mini Amortization (3yr)", value: "~$36/month" },
        { label: "Network Switch Amortization", value: "~$1-2/month" },
        { label: "ISP Monthly (No SLA)", value: "$70-$150" },
        { label: "ISP Monthly (with SLA)", value: "$400-$800+" },
      ],
      storage: [
        { label: "Cloudflare R2 Storage", value: "$0.015/GB-month (Note: $0 egress)" },
        { label: "AWS S3 Standard", value: "$0.023/GB-month + egress" },
        { label: "Local NAS (amortized)", value: "~$0.01/GB-month" },
      ],
    },
    hybrid: {
      infrastructure: [
        { label: "Mac Mini Amortization (3yr)", value: "~$36/month" },
        { label: "Cloud Egress", value: "$0.05-0.09/GB" },
        { label: "ISP Monthly (No SLA)", value: "$70-$150" },
      ],
      cloud: [
        { label: "Cloudflare Stream Delivery", value: "$1 / 1000 min ($0.001/min)" },
        { label: "AWS CloudFront", value: "$0.085/GB (first 10TB)" },
        { label: "Bunny.net", value: "$0.01/GB (volume pricing)" },
      ],
    },
  }

  return assumptions[platform] || {}
}

interface CostPreviewProps {
  costs: Costs
  settings: SettingsState
  revenue?: RevenueCalculations
}

// Helper function to get the platform name
function getPlatformName(platform: Platform): string {
  switch (platform) {
    case "mux":
      return "Mux"
    case "cloudflare":
      return "Cloudflare"
    case "self-hosted":
      return "Self-Hosted"
    case "hybrid":
      return "Hybrid"
    default:
      return "Unknown"
  }
}

// Helper function to calculate total live hours per day across all enabled channels
function calculateTotalLiveHoursPerDay(settings: SettingsState): number {
  // If channels array doesn't exist or is empty, fall back to the global setting
  if (!settings.channels || settings.channels.length === 0) {
    return settings.hoursPerDayArchived || 0
  }

  // Sum up liveHours from all enabled channels
  return settings.channels
    .filter((channel) => channel.enabled !== false) // Only include enabled channels
    .reduce((total, channel) => total + (channel.liveHours || 0), 0)
}

// Now modify the CostPreview component to include the pricing assumptions in the detailed view
export function CostPreview({ costs, settings, revenue }: CostPreviewProps) {
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

  // Get platform-specific pricing assumptions
  const platformAssumptions = getPricingAssumptions(settings.platform)

  // Calculate total live hours per day for VOD storage
  const totalLiveHoursPerDay = calculateTotalLiveHoursPerDay(settings)

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

            {revenue && (
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Monthly Revenue</span>
                  <span className="text-sm font-mono tabular-nums text-green-600 dark:text-green-400">
                    {formatCurrency(revenue.totalRevenue)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium">Net Operating Profit</span>
                  <span
                    className={`text-sm font-mono tabular-nums ${revenue.netOperatingProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {formatCurrency(revenue.netOperatingProfit)}
                  </span>
                </div>
              </div>
            )}

            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Platform: {getPlatformName(settings.platform)}</h3>
              <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                <p>
                  • {settings.channelCount} live channel{settings.channelCount !== 1 ? "s" : ""}
                </p>
                <p>• {settings.peakConcurrentViewers} peak viewers per channel</p>
                {settings.liveDvrEnabled && <p>• Live DVR enabled</p>}
                {settings.vodEnabled && (
                  <p>• VOD archiving: {totalLiveHoursPerDay} hours/day (based on channel schedules)</p>
                )}
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

                  {/* Add platform-specific explanation */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                    {settings.platform === "self-hosted" || settings.platform === "hybrid" ? (
                      <div className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                        <p className="font-medium mb-2">For self-hosted solutions, encoding costs include:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Amortized hardware costs (servers used for transcoding)</li>
                          <li>Electricity consumption for encoding operations</li>
                          <li>Software licensing (if applicable)</li>
                          <li>Operational overhead</li>
                        </ul>
                        <p className="mt-2">
                          These are calculated based on your server specifications and usage patterns.
                        </p>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                        <p>
                          Encoding costs represent the fees charged by{" "}
                          {settings.platform === "mux" ? "Mux" : "Cloudflare"} for transcoding your live streams into
                          multiple formats and bitrates for delivery to viewers.
                        </p>
                      </div>
                    )}

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

                    {/* Encoding Pricing Assumptions Dropdown */}
                    {platformAssumptions.encoding && (
                      <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                        <Collapsible>
                          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                            <ChevronDown className="h-4 w-4" />
                            <span>View Pricing Assumptions</span>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pt-3">
                            <div className="space-y-3 pl-4 border-l-2 border-blue-200 dark:border-blue-800">
                              <div className="text-xs bg-blue-50 dark:bg-blue-900/30 p-2 rounded-md font-medium">
                                Platform: <span className="font-bold">{getPlatformName(settings.platform)}</span>
                              </div>

                              <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                                Based on your selections:
                              </div>

                              {/* Platform-specific encoding details */}
                              {settings.platform === "mux" && (
                                <>
                                  <div className="text-xs">
                                    <span className="text-slate-600 dark:text-slate-400">Encoding preset:</span>{" "}
                                    <span className="font-mono">{settings.encodingPreset}</span>{" "}
                                    <span className="text-slate-500">
                                      ({settings.encodingPreset.includes("1080p") ? "$0.040/min" : "$0.030/min"})
                                    </span>
                                  </div>
                                  <div className="text-xs">
                                    <span className="text-slate-600 dark:text-slate-400">Calculation:</span>{" "}
                                    <span className="font-mono">
                                      {settings.channelCount} channels × 24 hours × 60 min × 30 days × $
                                      {settings.encodingPreset.includes("1080p") ? "0.040" : "0.030"}/min
                                    </span>
                                  </div>
                                </>
                              )}

                              {settings.platform === "cloudflare" && (
                                <>
                                  <div className="text-xs">
                                    <span className="text-slate-600 dark:text-slate-400">Encoding:</span>{" "}
                                    <span className="font-mono">Free (included in Cloudflare Stream)</span>
                                  </div>
                                  <div className="text-xs">
                                    <span className="text-slate-600 dark:text-slate-400">Note:</span>{" "}
                                    <span>Cloudflare charges for storage and delivery, not encoding</span>
                                  </div>
                                </>
                              )}

                              {(settings.platform === "self-hosted" || settings.platform === "hybrid") && (
                                <>
                                  <div className="text-xs">
                                    <span className="text-slate-600 dark:text-slate-400">Server type:</span>{" "}
                                    <span className="font-mono">{settings.serverType.replace(/-/g, " ")}</span>
                                  </div>
                                  <div className="text-xs">
                                    <span className="text-slate-600 dark:text-slate-400">Transcoding engine:</span>{" "}
                                    <span className="font-mono">{settings.transcodingEngine || "hardware"}</span>
                                  </div>
                                  <div className="text-xs">
                                    <span className="text-slate-600 dark:text-slate-400">Calculation:</span>{" "}
                                    <span className="font-mono">
                                      Server cost (${settings.serverCost}) amortized over 36 months + operational costs
                                    </span>
                                  </div>
                                </>
                              )}

                              {/* Legacy VOD encoding if applicable */}
                              {settings.legacyEnabled && !settings.preEncoded && (
                                <>
                                  <div className="text-xs mt-2 font-medium">Legacy VOD Encoding:</div>
                                  <div className="text-xs">
                                    <span className="text-slate-600 dark:text-slate-400">Provider:</span>{" "}
                                    <span className="font-mono">
                                      {settings.legacyProvider === "same-as-vod"
                                        ? settings.vodProvider === "same-as-live"
                                          ? getPlatformName(settings.platform)
                                          : settings.vodProvider
                                        : settings.legacyProvider}
                                    </span>
                                  </div>
                                  <div className="text-xs">
                                    <span className="text-slate-600 dark:text-slate-400">Back-catalog hours:</span>{" "}
                                    <span className="font-mono">{settings.backCatalogHours} hours</span>
                                  </div>
                                  <div className="text-xs">
                                    <span className="text-slate-600 dark:text-slate-400">One-time cost amortized:</span>{" "}
                                    <span className="font-mono">
                                      ({settings.backCatalogHours} hours × 60 min × $
                                      {settings.encodingPreset.includes("1080p") ? "0.040" : "0.030"}/min) ÷ 12 months
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    )}
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
                                {totalLiveHoursPerDay} hours/day × {settings.retentionWindow} days retention
                                <br />
                                <span className="italic">(Based on actual live hours from enabled channels)</span>
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

                    {/* Storage Pricing Assumptions Dropdown */}
                    <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                      <Collapsible>
                        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                          <ChevronDown className="h-4 w-4" />
                          <span>View Pricing Assumptions</span>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-3">
                          <div className="space-y-3 pl-4 border-l-2 border-blue-200 dark:border-blue-800">
                            <div className="text-xs bg-purple-50 dark:bg-purple-900/30 p-2 rounded-md font-medium">
                              Platform: <span className="font-bold">{getPlatformName(settings.platform)}</span>
                              {settings.vodProvider && settings.vodProvider !== "same-as-live" && (
                                <>
                                  {" "}
                                  | VOD Provider: <span className="font-bold">{settings.vodProvider}</span>
                                </>
                              )}
                            </div>

                            <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                              Based on your selections:
                            </div>

                            {/* Self-hosted storage explanation */}
                            {(settings.platform === "self-hosted" || settings.platform === "hybrid") && (
                              <div className="text-xs bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md">
                                <span className="font-medium">Self-hosted storage costs include:</span>
                                <ul className="mt-1 list-disc pl-4 space-y-1">
                                  <li>Hardware amortization (drives, NAS devices)</li>
                                  <li>Maintenance and replacement costs</li>
                                  <li>Power consumption</li>
                                  <li>Backup infrastructure</li>
                                  <li>Cloud object storage (R2/S3) if selected</li>
                                </ul>
                                <p className="mt-1">
                                  These costs are estimated at ~$0.01/GB-month for local storage or $0.015/GB-month for
                                  R2.
                                </p>
                              </div>
                            )}

                            {/* VOD Storage details */}
                            {settings.vodEnabled && (
                              <>
                                <div className="text-xs">
                                  <span className="text-slate-600 dark:text-slate-400">VOD storage:</span>{" "}
                                  <span className="font-mono">
                                    {totalLiveHoursPerDay} hours/day × {settings.retentionWindow} days retention
                                  </span>
                                </div>
                                <div className="text-xs">
                                  <span className="text-slate-600 dark:text-slate-400">Channel breakdown:</span>{" "}
                                  <span className="font-mono">
                                    {settings.channels
                                      .filter((channel) => channel.enabled !== false)
                                      .map((channel) => `${channel.name}: ${channel.liveHours || 0}h/day`)
                                      .join(", ")}
                                  </span>
                                </div>
                                <div className="text-xs">
                                  <span className="text-slate-600 dark:text-slate-400">Storage rate:</span>{" "}
                                  <span className="font-mono">
                                    {settings.platform === "mux" || settings.vodProvider === "mux"
                                      ? "$0.003/min (Mux)"
                                      : settings.platform === "cloudflare" || settings.vodProvider === "cloudflare"
                                        ? "$0.005/min (Cloudflare)"
                                        : "$0.015/GB-month (R2) or ~$0.01/GB-month (local)"}
                                  </span>
                                </div>
                                <div className="text-xs">
                                  <span className="text-slate-600 dark:text-slate-400">Calculation:</span>{" "}
                                  <span className="font-mono">
                                    {totalLiveHoursPerDay} hours × 60 min × {settings.retentionWindow} days × $
                                    {settings.platform === "mux" || settings.vodProvider === "mux"
                                      ? "0.003"
                                      : settings.platform === "cloudflare" || settings.vodProvider === "cloudflare"
                                        ? "0.005"
                                        : "0.00025"}
                                    /min
                                  </span>
                                </div>
                              </>
                            )}

                            {/* Legacy Storage details */}
                            {settings.legacyEnabled && (
                              <>
                                <div className="text-xs mt-2 font-medium">Legacy Content Storage:</div>
                                <div className="text-xs">
                                  <span className="text-slate-600 dark:text-slate-400">Back-catalog:</span>{" "}
                                  <span className="font-mono">{settings.backCatalogHours} hours</span>
                                </div>
                                <div className="text-xs">
                                  <span className="text-slate-600 dark:text-slate-400">Provider:</span>{" "}
                                  <span className="font-mono">
                                    {settings.legacyProvider === "same-as-vod"
                                      ? settings.vodProvider === "same-as-live"
                                        ? getPlatformName(settings.platform)
                                        : settings.vodProvider
                                      : settings.legacyProvider}
                                  </span>
                                </div>
                                <div className="text-xs">
                                  <span className="text-slate-600 dark:text-slate-400">Calculation:</span>{" "}
                                  <span className="font-mono">
                                    {settings.backCatalogHours} hours × 60 min × $
                                    {settings.legacyProvider === "mux" ||
                                    (settings.legacyProvider === "same-as-vod" &&
                                      (settings.vodProvider === "mux" ||
                                        (settings.vodProvider === "same-as-live" && settings.platform === "mux")))
                                      ? "0.003"
                                      : settings.legacyProvider === "cloudflare" ||
                                          (settings.legacyProvider === "same-as-vod" &&
                                            (settings.vodProvider === "cloudflare" ||
                                              (settings.vodProvider === "same-as-live" &&
                                                settings.platform === "cloudflare")))
                                        ? "0.005"
                                        : "0.00025"}
                                    /min
                                  </span>
                                </div>
                              </>
                            )}

                            {/* Data conversion explanation */}
                            <div className="text-xs mt-2 text-slate-500 dark:text-slate-400">
                              <span className="font-medium">Note:</span> 1080p video at ~6 Mbps equals ~0.0439 GB/min
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
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
                              {settings.channelCount} channel(s) × {settings.peakConcurrentViewers} peak viewers
                              <span className="italic"> (calculated with 40% average)</span>
                            </div>
                          </td>
                          <td className="py-3 text-right font-mono text-sm">{formatCurrency(costs.delivery * 0.7)}</td>
                        </tr>
                        {settings.vodEnabled && (
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <td className="py-3 text-sm">
                              <div className="font-medium">VOD Delivery</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                Based on {settings.peakConcurrentVodViewers} peak VOD viewers
                                <span className="italic"> (calculated with 40% average)</span>
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

                    {/* Delivery Pricing Assumptions Dropdown */}
                    <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                      <Collapsible>
                        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                          <ChevronDown className="h-4 w-4" />
                          <span>View Pricing Assumptions</span>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-3">
                          <div className="space-y-3 pl-4 border-l-2 border-blue-200 dark:border-blue-800">
                            <div className="text-xs bg-green-50 dark:bg-green-900/30 p-2 rounded-md font-medium">
                              Platform: <span className="font-bold">{getPlatformName(settings.platform)}</span>
                              {settings.vodProvider && settings.vodProvider !== "same-as-live" && (
                                <>
                                  {" "}
                                  | VOD Provider: <span className="font-bold">{settings.vodProvider}</span>
                                </>
                              )}
                            </div>

                            <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                              Based on your selections:
                            </div>

                            {/* Delivery calculation explanation */}
                            <div className="text-xs bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md">
                              <span className="font-medium">Important note about delivery costs:</span>
                              <p className="mt-1">
                                Delivery costs are calculated using average concurrent viewers (estimated at 40% of
                                peak) rather than peak concurrent viewers. This provides a more realistic cost estimate,
                                as viewership fluctuates throughout the day.
                              </p>
                            </div>

                            {/* Live Delivery details */}
                            <div className="text-xs">
                              <span className="text-slate-600 dark:text-slate-400">Live viewers:</span>{" "}
                              <span className="font-mono">
                                {settings.peakConcurrentViewers} peak concurrent viewers (≈{" "}
                                {Math.round(settings.peakConcurrentViewers * 0.4)} average)
                              </span>
                            </div>
                            <div className="text-xs">
                              <span className="text-slate-600 dark:text-slate-400">Delivery rate:</span>{" "}
                              <span className="font-mono">
                                {settings.platform === "mux"
                                  ? "$0.00096/min (Mux)"
                                  : settings.platform === "cloudflare"
                                    ? "$0.001/min (Cloudflare)"
                                    : settings.platform === "self-hosted"
                                      ? `$${settings.cdnEgressRate || 0.085}/GB (${settings.videoCdnProvider || "CDN"})`
                                      : `$${settings.originEgressCost || 0.09}/GB origin + CDN costs (Hybrid)`}
                              </span>
                            </div>
                            <div className="text-xs">
                              <span className="text-slate-600 dark:text-slate-400">Calculation:</span>{" "}
                              <span className="font-mono">
                                {settings.channelCount} channels × {Math.round(settings.peakConcurrentViewers * 0.4)}{" "}
                                avg viewers × 24 hours × 60 min × 30 days × $
                                {settings.platform === "mux"
                                  ? "0.00096"
                                  : settings.platform === "cloudflare"
                                    ? "0.001"
                                    : "0.00035"}
                                /min
                              </span>
                            </div>

                            {/* VOD Delivery details */}
                            {settings.vodEnabled && (
                              <>
                                <div className="text-xs mt-2 font-medium">VOD Delivery:</div>
                                <div className="text-xs">
                                  <span className="text-slate-600 dark:text-slate-400">VOD viewers:</span>{" "}
                                  <span className="font-mono">
                                    {settings.peakConcurrentVodViewers} peak viewers (≈{" "}
                                    {Math.round(settings.peakConcurrentVodViewers * 0.4)} average)
                                  </span>
                                </div>
                                <div className="text-xs">
                                  <span className="text-slate-600 dark:text-slate-400">Provider:</span>{" "}
                                  <span className="font-mono">
                                    {settings.vodProvider === "same-as-live"
                                      ? getPlatformName(settings.platform)
                                      : settings.vodProvider}
                                  </span>
                                </div>
                                <div className="text-xs">
                                  <span className="text-slate-600 dark:text-slate-400">Calculation:</span>{" "}
                                  <span className="font-mono">
                                    {settings.hoursPerDayArchived} hours ×{" "}
                                    {Math.round(settings.peakConcurrentVodViewers * 0.4)} avg viewers × 30 days × $
                                    {settings.platform === "mux" || settings.vodProvider === "mux"
                                      ? "0.00096"
                                      : settings.platform === "cloudflare" || settings.vodProvider === "cloudflare"
                                        ? "0.001"
                                        : "0.00035"}
                                    /min
                                  </span>
                                </div>
                              </>
                            )}

                            {/* Self-hosted specific details */}
                            {(settings.platform === "self-hosted" || settings.platform === "hybrid") && (
                              <>
                                <div className="text-xs mt-2 font-medium">Network Details:</div>
                                <div className="text-xs">
                                  <span className="text-slate-600 dark:text-slate-400">Network interface:</span>{" "}
                                  <span className="font-mono">{settings.networkInterface || "1GbE"}</span>
                                </div>
                                <div className="text-xs">
                                  <span className="text-slate-600 dark:text-slate-400">Bandwidth capacity:</span>{" "}
                                  <span className="font-mono">{settings.bandwidthCapacity || 1000} Mbps</span>
                                </div>
                                {settings.videoCdnProvider && settings.videoCdnProvider !== "none" && (
                                  <div className="text-xs">
                                    <span className="text-slate-600 dark:text-slate-400">Video CDN:</span>{" "}
                                    <span className="font-mono">
                                      {settings.videoCdnProvider} (${settings.videoCdnEgressRate || 0.085}/GB)
                                    </span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
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

                    {/* Other Costs Pricing Assumptions Dropdown */}
                    <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                      <Collapsible>
                        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                          <ChevronDown className="h-4 w-4" />
                          <span>View Pricing Assumptions</span>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-3">
                          <div className="space-y-3 pl-4 border-l-2 border-blue-200 dark:border-blue-800">
                            <div className="text-xs bg-amber-50 dark:bg-amber-900/30 p-2 rounded-md font-medium">
                              Platform: <span className="font-bold">{getPlatformName(settings.platform)}</span>
                            </div>

                            <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                              Based on your selections:
                            </div>

                            {/* CDN details */}
                            {(settings.cdnPlan !== "free" || settings.websiteCdnPlan !== "free") && (
                              <>
                                <div className="text-xs">
                                  <span className="text-slate-600 dark:text-slate-400">CDN plan:</span>{" "}
                                  <span className="font-mono">
                                    {settings.websiteCdnPlan || settings.cdnPlan} (
                                    {settings.websiteCdnPlan === "pro" || settings.cdnPlan === "pro"
                                      ? "$20/mo"
                                      : settings.websiteCdnPlan === "business" || settings.cdnPlan === "business"
                                        ? "$200/mo"
                                        : "Free"}
                                    )
                                  </span>
                                </div>
                              </>
                            )}

                            {/* Hardware details */}
                            {settings.macMiniNeeded && (
                              <div className="text-xs">
                                <span className="text-slate-600 dark:text-slate-400">Mac Mini:</span>{" "}
                                <span className="font-mono">$1,299 amortized over 36 months = $36/mo</span>
                              </div>
                            )}

                            {settings.networkSwitchNeeded && (
                              <div className="text-xs">
                                <span className="text-slate-600 dark:text-slate-400">Network switch:</span>{" "}
                                <span className="font-mono">$72 amortized over 36 months = $2/mo</span>
                              </div>
                            )}

                            {/* Email details */}
                            {settings.outboundEmail && (
                              <>
                                <div className="text-xs">
                                  <span className="text-slate-600 dark:text-slate-400">Email volume:</span>{" "}
                                  <span className="font-mono">{settings.monthlyEmailVolume} emails/month</span>
                                </div>
                                <div className="text-xs">
                                  <span className="text-slate-600 dark:text-slate-400">Email cost:</span>{" "}
                                  <span className="font-mono">$0.10 per 1,000 emails</span>
                                </div>
                              </>
                            )}

                            {/* Analytics details */}
                            {(settings.viewerAnalytics !== "none" || settings.siteAnalytics !== "none") && (
                              <>
                                <div className="text-xs mt-2 font-medium">Analytics:</div>
                                {settings.viewerAnalytics !== "none" && (
                                  <div className="text-xs">
                                    <span className="text-slate-600 dark:text-slate-400">Viewer analytics:</span>{" "}
                                    <span className="font-mono">
                                      {settings.viewerAnalytics} (
                                      {settings.viewerAnalytics === "mux-data" && settings.platform === "mux"
                                        ? "Free"
                                        : settings.viewerAnalytics === "cf-analytics" &&
                                            settings.platform === "cloudflare"
                                          ? "Free"
                                          : settings.viewerAnalytics === "mux-data"
                                            ? "$50/mo"
                                            : settings.viewerAnalytics === "cf-analytics"
                                              ? "$20/mo"
                                              : settings.viewerAnalytics === "self-host-grafana"
                                                ? "$10/mo"
                                                : "Free"}
                                      )
                                    </span>
                                  </div>
                                )}
                                {settings.siteAnalytics !== "none" && (
                                  <div className="text-xs">
                                    <span className="text-slate-600 dark:text-slate-400">Site analytics:</span>{" "}
                                    <span className="font-mono">
                                      {settings.siteAnalytics} (
                                      {settings.siteAnalytics === "plausible"
                                        ? "$9/mo"
                                        : settings.siteAnalytics === "fathom"
                                          ? "$14/mo"
                                          : settings.siteAnalytics === "matomo"
                                            ? "$19/mo"
                                            : "Free"}
                                      )
                                    </span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
