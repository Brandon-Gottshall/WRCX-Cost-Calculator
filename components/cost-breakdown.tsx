"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BarChart3,
  TrendingUp,
  Database,
  HardDrive,
  Globe,
  ChevronDown,
  ChevronUp,
  Info,
  AlertTriangle,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { Costs, SettingsState, Platform } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { CitationLink, FormulaExplanation } from "@/components/citations"

interface CostBreakdownProps {
  costs: Costs
  settings: SettingsState
  validationErrors?: boolean
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

export function CostBreakdown({ costs, settings, validationErrors }: CostBreakdownProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    encoding: false,
    storage: false,
    delivery: false,
    other: false,
  })

  const totalMonthlyCost = costs.encoding + costs.storage + costs.delivery + costs.other
  const totalLiveHoursPerDay = calculateTotalLiveHoursPerDay(settings)

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const costItems = [
    {
      name: "Encoding",
      value: costs.encoding,
      icon: TrendingUp,
      color: "text-blue-500 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      details: getEncodingDetails(settings, costs),
      assumptions: getEncodingAssumptions(settings),
    },
    {
      name: "Storage",
      value: costs.storage,
      icon: Database,
      color: "text-purple-500 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      details: getStorageDetails(settings, costs, totalLiveHoursPerDay),
      assumptions: getStorageAssumptions(settings),
    },
    {
      name: "Delivery",
      value: costs.delivery,
      icon: Globe,
      color: "text-green-500 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      details: getDeliveryDetails(settings, costs),
      assumptions: getDeliveryAssumptions(settings),
    },
    {
      name: "Other",
      value: costs.other,
      icon: HardDrive,
      color: "text-amber-500 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      details: getOtherDetails(settings, costs),
      assumptions: getOtherAssumptions(settings),
    },
  ]

  return (
    <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/30 flex flex-row items-center justify-between">
        <div>
          <CardTitle>Cost Breakdown</CardTitle>
          <CardDescription>Monthly estimated costs</CardDescription>
        </div>
        <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900/50">
          <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6" role="region" aria-live="polite">
          {validationErrors && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-lg flex items-start gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  Cost estimate may be inaccurate
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Please fix validation errors to ensure accurate pricing calculations.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {costItems.map((item) => (
              <Collapsible
                key={item.name}
                open={expandedSections[item.name.toLowerCase()]}
                onOpenChange={() => toggleSection(item.name.toLowerCase())}
                className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden"
              >
                <div className="flex items-center justify-between p-2 sm:p-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${item.bgColor}`}>
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
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
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {expandedSections[item.name.toLowerCase()] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                <CollapsibleContent>
                  <div className="px-2 sm:px-3 pb-2 sm:pb-3 pt-0">
                    <Separator className="mb-4" />
                    <div className="space-y-4">
                      {/* Cost Details */}
                      {item.details.map((detail, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <span>{detail.label}</span>
                            {detail.tooltip && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-slate-400 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">{detail.tooltip}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {detail.citation && <CitationLink id={detail.citation} />}
                          </div>
                          <span className="font-mono">{formatCurrency(detail.value)}</span>
                        </div>
                      ))}

                      {/* Formula Explanation */}
                      {item.name === "Encoding" && (
                        <FormulaExplanation
                          formula="24 h/day × 60 min/h × 30 days × (rate per min)"
                          className="mt-2 p-2 bg-slate-50 dark:bg-slate-900/50 rounded"
                        />
                      )}

                      {item.name === "Storage" && (
                        <FormulaExplanation
                          formula={`${totalLiveHoursPerDay} h/day × 60 min/h × ${settings.retentionWindow} days × (storage rate per min)`}
                          className="mt-2 p-2 bg-slate-50 dark:bg-slate-900/50 rounded"
                        />
                      )}

                      {item.name === "Delivery" && settings.platform !== "self-hosted" && (
                        <FormulaExplanation
                          formula="minutes delivered × rate/min × 24 h × 60 min × 30 d"
                          className="mt-2 p-2 bg-slate-50 dark:bg-slate-900/50 rounded"
                        />
                      )}

                      {/* Self-hosted bandwidth explanation */}
                      {item.name === "Delivery" && settings.platform === "self-hosted" && (
                        <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-900/50 rounded text-xs text-slate-600 dark:text-slate-400">
                          <p className="font-medium mb-1">Self-hosted bandwidth considerations:</p>
                          <p>
                            For self-hosted streaming without a CDN, delivery costs are fixed based on your internet
                            connection rather than variable per-viewer costs. These fixed costs are included in the
                            "Other" category.
                          </p>
                          <p className="mt-1">
                            Your current setup can theoretically support{" "}
                            <span className="font-medium">
                              {Math.floor((settings.bandwidthCapacity || 1000) / 3)} concurrent viewers
                            </span>{" "}
                            at 1080p (assuming 3 Mbps per viewer).
                          </p>
                          {settings.videoCdnProvider && settings.videoCdnProvider !== "none" && (
                            <p className="mt-1">
                              Since you're using {settings.videoCdnProvider} as a CDN, variable delivery costs apply
                              based on actual usage.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Pricing Assumptions */}
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium">Pricing Assumptions</h4>
                        </div>
                        <div className="space-y-2">
                          {item.assumptions.map((assumption, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400"
                            >
                              <div className="flex items-center gap-1">
                                <span>{assumption.label}</span>
                                {assumption.citation && <CitationLink id={assumption.citation} />}
                              </div>
                              <span className="font-mono">{assumption.value}</span>
                            </div>
                          ))}
                        </div>
                        {item.assumptions.length > 0 && (
                          <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                            <a href="#citations" className="flex items-center gap-1 hover:underline">
                              <span>View full pricing documentation</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
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
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">Annual Cost</span>
                <CitationLink id="12" />
              </div>
              <span className="text-sm font-mono tabular-nums">{formatCurrency(totalMonthlyCost * 12)}</span>
            </div>
            <FormulaExplanation formula="Monthly subtotal × 12" className="mt-1" />
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-2 sm:p-3 rounded-lg">
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
              {settings.platform === "self-hosted" && (
                <p>• Bandwidth capacity: {settings.bandwidthCapacity || 1000} Mbps</p>
              )}
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

// Helper functions to get cost details and assumptions for each category
function getEncodingDetails(settings: SettingsState, costs: Costs) {
  const details = []

  if (settings.streamEnabled !== false) {
    details.push({
      label: "Live Encoding",
      value: costs.encoding * 0.7,
      tooltip: `Based on ${settings.channelCount} channel(s) at ${settings.encodingPreset} quality`,
      citation: "1",
    })
  }

  if (settings.legacyEnabled) {
    details.push({
      label: "Legacy VOD Encoding",
      value: costs.encoding * 0.3,
      tooltip: `One-time encoding cost for ${settings.backCatalogHours} hours of content, amortized monthly`,
    })
  }

  return details
}

function getEncodingAssumptions(settings: SettingsState) {
  const assumptions = []

  if (settings.platform === "mux") {
    assumptions.push(
      { label: "1080p Live Encoding (Plus)", value: "$0.040/min", citation: "1" },
      { label: "720p Live Encoding (Plus)", value: "$0.030/min", citation: "1" },
    )
  } else if (settings.platform === "cloudflare") {
    assumptions.push({ label: "Live Encoding", value: "Free", citation: "3" })
  } else if (settings.platform === "self-hosted" || settings.platform === "hybrid") {
    assumptions.push(
      { label: "Server Compute Cost", value: "Based on hardware" },
      { label: "Transcoding Engine", value: settings.transcodingEngine || "hardware" },
    )
  }

  return assumptions
}

function getStorageDetails(settings: SettingsState, costs: Costs, totalLiveHoursPerDay: number) {
  const details = []

  if (settings.vodEnabled && settings.streamEnabled !== false) {
    details.push({
      label: "VOD Storage",
      value: costs.storage * 0.6,
      tooltip: `${totalLiveHoursPerDay} hours/day × ${settings.retentionWindow} days retention (based on channel schedules)`,
      citation: "3",
    })
  }

  if (settings.legacyEnabled) {
    details.push({
      label: "Legacy Content Storage",
      value: costs.storage * 0.4,
      tooltip: `${settings.backCatalogHours} hours of content`,
    })
  }

  return details
}

function getStorageAssumptions(settings: SettingsState) {
  const assumptions = []

  if (settings.platform === "mux") {
    assumptions.push({ label: "Storage Rate", value: "$0.003/min", citation: "1" })
  } else if (settings.platform === "cloudflare") {
    assumptions.push({ label: "Storage Rate", value: "$0.005/min", citation: "3" })
  } else if (settings.platform === "self-hosted") {
    assumptions.push(
      { label: "Storage Type", value: settings.videoStorageStrategy || "local-nas" },
      { label: "R2 Storage Cost", value: "$0.015/GB-month" },
    )
  } else if (settings.platform === "hybrid") {
    assumptions.push(
      { label: "Local Storage", value: settings.videoStorageStrategy || "local-nas" },
      { label: "Cloud Storage", value: "$0.015/GB-month (R2)" },
    )
  }

  return assumptions
}

function getDeliveryDetails(settings: SettingsState, costs: Costs) {
  const details = []

  if (settings.streamEnabled !== false) {
    // For self-hosted without CDN, show $0 for delivery costs
    if (settings.platform === "self-hosted" && (!settings.videoCdnProvider || settings.videoCdnProvider === "none")) {
      details.push({
        label: "Live Stream Delivery",
        value: 0,
        tooltip: `Fixed cost internet connection (included in "Other" costs)`,
        citation: "2",
      })
    } else {
      details.push({
        label: "Live Stream Delivery",
        value: costs.delivery * 0.7,
        tooltip: `${settings.channelCount} channel(s) × ${settings.peakConcurrentViewers} viewers`,
        citation: "2",
      })
    }
  }

  if (settings.vodEnabled && settings.streamEnabled !== false) {
    // For self-hosted without CDN, show $0 for VOD delivery costs
    if (settings.platform === "self-hosted" && (!settings.videoCdnProvider || settings.videoCdnProvider === "none")) {
      details.push({
        label: "VOD Delivery",
        value: 0,
        tooltip: `Fixed cost internet connection (included in "Other" costs)`,
      })
    } else {
      details.push({
        label: "VOD Delivery",
        value: costs.delivery * 0.3,
        tooltip: `Based on ${settings.peakConcurrentVodViewers} concurrent VOD viewers`,
      })
    }
  }

  return details
}

function getDeliveryAssumptions(settings: SettingsState) {
  const assumptions = []

  if (settings.platform === "mux") {
    assumptions.push({ label: "Delivery Rate", value: "$0.00096/min", citation: "2" })
  } else if (settings.platform === "cloudflare") {
    assumptions.push({ label: "Delivery Rate", value: "$0.001/min", citation: "3" })
  } else if (settings.platform === "self-hosted") {
    if (settings.videoCdnProvider && settings.videoCdnProvider !== "none") {
      assumptions.push(
        { label: "CDN Provider", value: settings.videoCdnProvider },
        { label: "CDN Egress Rate", value: `$${settings.videoCdnEgressRate || 0.085}/GB`, citation: "5" },
      )
    } else {
      assumptions.push(
        { label: "Direct Delivery", value: "Fixed cost (ISP)" },
        { label: "Bandwidth Capacity", value: `${settings.bandwidthCapacity || 1000} Mbps`, citation: "4" },
        { label: "Max Concurrent Viewers", value: `~${Math.floor((settings.bandwidthCapacity || 1000) / 3)} at 1080p` },
      )
    }
  } else if (settings.platform === "hybrid") {
    assumptions.push(
      { label: "Origin Egress", value: `$${settings.originEgressCost || 0.09}/GB`, citation: "5" },
      { label: "CDN Provider", value: settings.cloudProvider || "cloudflare" },
    )
  }

  return assumptions
}

function getOtherDetails(settings: SettingsState, costs: Costs) {
  const details = []

  if (settings.cdnPlan !== "free" || settings.websiteCdnPlan !== "free") {
    details.push({
      label: `CDN Plan (${settings.websiteCdnPlan || settings.cdnPlan})`,
      value:
        settings.websiteCdnPlan === "pro" || settings.cdnPlan === "pro"
          ? 20
          : settings.websiteCdnPlan === "business" || settings.cdnPlan === "business"
            ? 200
            : 0,
    })
  }

  // Add internet costs for self-hosted
  if (settings.platform === "self-hosted" || settings.platform === "hybrid") {
    const internetCost =
      settings.internetOpexMo ||
      (settings.peakConcurrentViewers > 300
        ? 500
        : settings.peakConcurrentViewers > 100
          ? 300
          : settings.peakConcurrentViewers > 30
            ? 150
            : 100)

    details.push({
      label: "Internet Connection",
      value: internetCost,
      tooltip: `Business-class internet with sufficient bandwidth for streaming`,
    })
  }

  if (settings.macMiniNeeded) {
    details.push({
      label: "Mac Mini (Amortized)",
      value: 36,
    })
  }

  if (settings.networkSwitchNeeded) {
    details.push({
      label: "Network Switch (Amortized)",
      value: 2,
    })
  }

  if (settings.outboundEmail) {
    details.push({
      label: "Email Service",
      value: Math.min(settings.monthlyEmailVolume / 1000, 1) * 10,
      tooltip: `${settings.monthlyEmailVolume} emails/month`,
    })
  }

  if (settings.viewerAnalytics !== "none") {
    const analyticsValue =
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
                : 0

    details.push({
      label: "Viewer Analytics",
      value: analyticsValue,
      tooltip: `${settings.viewerAnalytics} analytics service`,
      citation: "7",
    })
  }

  if (settings.siteAnalytics !== "none") {
    const siteAnalyticsValue =
      settings.siteAnalytics === "plausible"
        ? 9
        : settings.siteAnalytics === "fathom"
          ? 14
          : settings.siteAnalytics === "matomo"
            ? 19
            : 0

    details.push({
      label: "Site Analytics",
      value: siteAnalyticsValue,
      tooltip: `${settings.siteAnalytics} analytics service`,
    })
  }

  return details
}

function getOtherAssumptions(settings: SettingsState) {
  const assumptions = []

  if (settings.cdnPlan !== "free" || settings.websiteCdnPlan !== "free") {
    assumptions.push({
      label: "CDN Plan",
      value:
        settings.websiteCdnPlan === "pro" || settings.cdnPlan === "pro"
          ? "Pro: $20/mo"
          : settings.websiteCdnPlan === "business" || settings.cdnPlan === "business"
            ? "Business: $200/mo"
            : "Free",
    })
  }

  // Add internet assumptions for self-hosted
  if (settings.platform === "self-hosted" || settings.platform === "hybrid") {
    assumptions.push({
      label: "Internet Connection",
      value: settings.internetOpexMo
        ? `$${settings.internetOpexMo}/mo (custom)`
        : settings.peakConcurrentViewers > 300
          ? "$500/mo (enterprise)"
          : settings.peakConcurrentViewers > 100
            ? "$300/mo (business fiber)"
            : "$100-150/mo (business cable)",
    })

    assumptions.push({
      label: "Bandwidth Required",
      value: `~${settings.peakConcurrentViewers * 3} Mbps peak`,
    })
  }

  if (settings.outboundEmail) {
    assumptions.push({
      label: "Email Cost",
      value: "$0.10 per 1k emails",
    })
  }

  if (settings.viewerAnalytics !== "none" || settings.siteAnalytics !== "none") {
    if (settings.viewerAnalytics !== "none") {
      assumptions.push({
        label: settings.viewerAnalytics,
        value:
          settings.viewerAnalytics === "mux-data" && settings.platform === "mux"
            ? "Included"
            : settings.viewerAnalytics === "cf-analytics" && settings.platform === "cloudflare"
              ? "Included"
              : settings.viewerAnalytics === "mux-data"
                ? "$50/mo"
                : settings.viewerAnalytics === "cf-analytics"
                  ? "$20/mo"
                  : settings.viewerAnalytics === "self-host-grafana"
                    ? "$10/mo"
                    : "Free",
        citation: "7",
      })
    }

    if (settings.siteAnalytics !== "none") {
      assumptions.push({
        label: settings.siteAnalytics,
        value:
          settings.siteAnalytics === "plausible"
            ? "$9/mo"
            : settings.siteAnalytics === "fathom"
              ? "$14/mo"
              : settings.siteAnalytics === "matomo"
                ? "$19/mo"
                : "Free",
      })
    }
  }

  return assumptions
}
