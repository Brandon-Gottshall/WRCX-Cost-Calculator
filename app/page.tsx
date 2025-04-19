"use client"

import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { Download, RefreshCw, Copy, AlertTriangle, HelpCircle } from "lucide-react"
import { calculateCosts } from "@/lib/cost-engine"
import { validateSettings, hasValidationErrors } from "@/lib/validation"
import { PlatformPicker } from "@/components/platform-picker"
import { SettingsCard } from "@/components/settings-card"
import { CostPreview } from "@/components/cost-preview"
import { SettingsTabs } from "@/components/settings-tabs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ValidationAlert } from "@/components/validation-alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { SettingsState, Tab } from "@/lib/types"
import { initializeStore, saveStore } from "@/lib/store-init"

// Add these imports at the top with the other imports
import { calculateRevenue } from "@/lib/revenue-engine"
import { RevenueSettings } from "@/components/revenue-settings"
import { RevenueKPIs } from "@/components/revenue-kpis"
import { RevenueVsCost } from "@/components/revenue-vs-cost"
// Add these imports at the top with the other imports
import { ChannelStatisticsManager } from "@/components/channel-statistics"
import { VodStatisticsManager } from "@/components/vod-statistics"

export default function CostCalculator() {
  // Initial default state
  const defaultState: SettingsState = {
    platform: "mux",
    streamEnabled: true, // Initialize to true
    channelCount: 1,
    peakConcurrentViewers: 100,
    encodingPreset: "1080p-tri-ladder",
    liveDvrEnabled: true,
    recordingStorageLocation: "same-as-vod",
    // Add channel statistics - will be overridden by defaultChannels
    channels: [],
    vodEnabled: true,
    vodProvider: "same-as-live",
    hoursPerDayArchived: 24,
    retentionWindow: 30,
    deliveryRegion: "us",
    peakConcurrentVodViewers: 50,
    // Add VOD categories
    vodCategories: [
      {
        id: "vod-1",
        name: "News Archives",
        monthlyViews: 5000,
        averageWatchTimeMinutes: 20,
        adSpotsPerView: 1,
        cpmRate: 20,
      },
    ],
    legacyEnabled: false,
    backCatalogHours: 0,
    legacyProvider: "same-as-vod",
    preEncoded: false,
    dataStore: "local-sqlite",
    dbBackupRetention: 7,
    videoStorageStrategy: "local-nas",
    outboundEmail: false,
    monthlyEmailVolume: 0,
    cdnPlan: "free",
    cdnEgressRate: 0.085,
    macMiniNeeded: false,
    networkSwitchNeeded: false,
    rackHostingLocation: "in-station",
    rackCost: 0,
    viewerAnalytics: "none",
    siteAnalytics: "none",
    // Hardware defaults
    serverType: "mac-mini",
    serverCount: 1,
    serverCost: 800,
    hardwareAvailable: false,
    hardwareMode: "own",
    amortizationMonths: 24,
    powerConsumptionKwh: 15,
    powerCostPerKwh: 0.144,
    internetColoMonthlyCost: 100,
    networkSwitchNeeded: false,
    networkSwitchCost: 200,
    // Global Settings - will be overridden by globalDefaults
    globalFillRate: 35,
    powerRate: 0.144,
    cdnCostPerGB: 0.03,
    // Hardware & Hosting Opex - will be overridden by globalDefaults
    capEx: 1299,
    amortMonths: 36,
    wattage: 25,
    serverOpexMo: 36.08,
    electricityOpexMo: 2.59,
    internetOpexMo: 99,
    // Self-hosted defaults
    networkInterface: "1gbe",
    nicCost: 300,
    enterpriseNetworkCost: "5000",
    bandwidthCapacity: 1000,
    streamingServer: "mediamtx",
    transcodingEngine: "hardware",
    redundancyLevel: "none",
    secondaryServerCost: 1300,
    cloudProvider: "cloudflare",
    originEgressCost: 0.09,
    hybridRedundancyMode: "active-passive",
    // Add revenue settings - will be overridden by globalDefaults
    revenue: {
      liveAdsEnabled: true,
      averageDailyUniqueViewers: 1000,
      averageViewingHoursPerViewer: 2,
      adSpotsPerHour: 4,
      cpmRate: 15,
      fillRate: 35,
      peakTimeMultiplier: 1.2,
      seasonalMultiplier: 1.0,
      targetDemographicValue: 1.1,
      paidProgrammingEnabled: true,
      monthlyPaidBlocks: 4,
      ratePerBlock: 250,
      premiumSponsorshipEnabled: false,
      premiumSponsorshipRate: 500,
      premiumSponsorshipCount: 0,
      vodAdsEnabled: true,
      monthlyVodViews: 5000,
      adSpotsPerVodView: 1,
      vodCpmRate: 20,
      vodFillRate: 35,
      vodSkipRate: 0.15,
      vodCompletionRate: 0.85,
      vodPremiumPlacementRate: 0.05,
    },
  }

  // Initialize state with defaults or saved values
  const [settings, setSettings] = useState<SettingsState>(() => initializeStore(defaultState))

  // Track which fields have been edited by the user
  const [editedFields, setEditedFields] = useState<Set<string>>(new Set())

  const [activeTab, setActiveTab] = useState<Tab>("live")
  const [validationResults, setValidationResults] = useState(validateSettings ? validateSettings(settings) : [])
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false)

  // Calculate derived values whenever relevant inputs change
  useEffect(() => {
    const updates: Partial<SettingsState> = {}

    // Calculate serverOpexMo if capEx and amortMonths are set
    if (settings.capEx !== undefined && settings.amortMonths !== undefined && settings.amortMonths > 0) {
      updates.serverOpexMo = Number((settings.capEx / settings.amortMonths).toFixed(2))
    }

    // Calculate electricityOpexMo if wattage and powerRate are set
    if (settings.wattage !== undefined && settings.powerRate !== undefined) {
      // Formula: Wattage × 24h × 30d × Power $/kWh ÷ 1000
      updates.electricityOpexMo = Number(((settings.wattage * 24 * 30 * settings.powerRate) / 1000).toFixed(2))
    }

    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
      setSettings((prev) => ({ ...prev, ...updates }))
    }
  }, [settings.capEx, settings.amortMonths, settings.wattage, settings.powerRate])

  // Validate settings whenever they change
  useEffect(() => {
    if (validateSettings) {
      setValidationResults(validateSettings(settings))
    }
  }, [settings])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    saveStore(settings)
  }, [settings])

  const costs = calculateCosts(settings)

  // Add this after the costs calculation
  // Update the revenue calculations to use the channel and VOD statistics
  const revenueCalculations = calculateRevenue(settings.revenue, costs, settings.channels, settings.vodCategories)

  const updateSettings = (newSettings: Partial<SettingsState>) => {
    // Track which fields are being edited
    const newEditedFields = new Set(editedFields)
    Object.keys(newSettings).forEach((key) => {
      newEditedFields.add(key)
    })
    setEditedFields(newEditedFields)

    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  // Check if a field has been edited by the user
  const isFieldEdited = (fieldPath: string): boolean => {
    return editedFields.has(fieldPath)
  }

  // Update the resetSettings function to include the new fields
  const resetSettings = () => {
    setSettings(initializeStore(defaultState))
    setEditedFields(new Set())
    setActiveTab("live")
  }

  const copyToEstimate = () => {
    // Check for validation errors before allowing export
    if (hasValidationErrors && hasValidationErrors(validationResults)) {
      alert("Please fix validation errors before exporting the estimate.")
      return
    }

    // Implementation for copying to estimate
    console.log("Copying to estimate:", settings, costs)
    // This would typically call an API or generate a CSV
  }

  const tabs: { id: Tab; label: string; disabled?: boolean }[] = [
    { id: "live", label: "Live" },
    { id: "legacy-vod", label: "Legacy VOD" },
    { id: "storage", label: "Storage & DB" },
    { id: "email", label: "Email" },
    { id: "cdn", label: "CDN", disabled: settings.platform === "mux" && !settings.liveDvrEnabled },
    { id: "hardware", label: "Hardware & Hosting" },
    { id: "analytics", label: "Analytics" },
    { id: "revenue", label: "Revenue" }, // Add the revenue tab
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white font-bold rounded-lg p-2">WRCX</div>
            <Separator orientation="vertical" className="h-8" />
            <h1 className="text-xl font-semibold tracking-tight">Stream & VOD Cost Calculator</h1>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download size={16} />
            <span>Export</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column - Settings (60%) */}
          <div className="lg:col-span-3 space-y-8">
            <PlatformPicker
              selectedPlatform={settings.platform}
              onChange={(platform) => updateSettings({ platform })}
              settings={settings}
              updateSettings={updateSettings}
              isEdited={isFieldEdited}
            />

            {/* Display validation alerts */}
            {validationResults && validationResults.length > 0 && (
              <ValidationAlert validationResults={validationResults} />
            )}

            <SettingsTabs activeTab={activeTab} onChange={setActiveTab} settings={settings} />

            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {activeTab === "live" && (
                  <SettingsCard
                    key="stream-live"
                    title="Stream (Live)"
                    description="Configure your live streaming settings"
                    settings={settings}
                    updateSettings={updateSettings}
                    type="stream"
                    validationResults={validationResults || []}
                    isEdited={isFieldEdited}
                  />
                )}

                {/* Only show Live->VOD section if streaming is enabled */}
                {activeTab === "live" && settings.streamEnabled !== false && (
                  // Add the channel and VOD statistics components to the appropriate tabs
                  <ChannelStatisticsManager
                    key="channel-statistics"
                    channels={settings.channels}
                    updateChannels={(channels) => updateSettings({ channels })}
                    isEdited={isFieldEdited}
                    defaultFillRate={settings.globalFillRate}
                  />
                )}

                {activeTab === "live" && settings.streamEnabled !== false && (
                  <SettingsCard
                    key="live-to-vod"
                    title="Live → VOD"
                    description="Configure how live streams are archived to VOD"
                    settings={settings}
                    updateSettings={updateSettings}
                    type="live-to-vod"
                    validationResults={validationResults || []}
                    isEdited={isFieldEdited}
                  />
                )}

                {activeTab === "legacy-vod" && (
                  // Add the channel and VOD statistics components to the appropriate tabs
                  <VodStatisticsManager
                    key="vod-statistics"
                    vodCategories={settings.vodCategories}
                    updateVodCategories={(vodCategories) => updateSettings({ vodCategories })}
                    isEdited={isFieldEdited}
                  />
                )}

                {activeTab === "legacy-vod" && (
                  <SettingsCard
                    key="legacy-vod"
                    title="Legacy VOD"
                    description="Configure settings for your existing video content"
                    settings={settings}
                    updateSettings={updateSettings}
                    type="legacy-vod"
                    validationResults={validationResults || []}
                    isEdited={isFieldEdited}
                  />
                )}

                {activeTab === "storage" && (
                  <SettingsCard
                    key="storage-db"
                    title="Storage & Database"
                    description="Configure your data storage options"
                    settings={settings}
                    updateSettings={updateSettings}
                    type="storage-db"
                    validationResults={validationResults || []}
                    isEdited={isFieldEdited}
                  />
                )}

                {activeTab === "email" && (
                  <SettingsCard
                    key="email"
                    title="Email"
                    description="Configure outbound email settings"
                    settings={settings}
                    updateSettings={updateSettings}
                    type="email"
                    validationResults={validationResults || []}
                    isEdited={isFieldEdited}
                  />
                )}

                {activeTab === "cdn" && (
                  <SettingsCard
                    key="cdn"
                    title="CDN"
                    description="Configure content delivery network settings"
                    settings={settings}
                    updateSettings={updateSettings}
                    type="cdn"
                    validationResults={validationResults || []}
                    isEdited={isFieldEdited}
                  />
                )}

                {activeTab === "hardware" && (
                  <SettingsCard
                    key="hardware-hosting"
                    title="Hardware & Hosting"
                    description="Configure physical infrastructure requirements"
                    settings={settings}
                    updateSettings={updateSettings}
                    type="hardware-hosting"
                    validationResults={validationResults || []}
                    isEdited={isFieldEdited}
                  />
                )}

                {activeTab === "analytics" && (
                  <SettingsCard
                    key="analytics"
                    title="Analytics"
                    description="Configure viewer and site analytics"
                    settings={settings}
                    updateSettings={updateSettings}
                    type="analytics"
                    validationResults={validationResults || []}
                    isEdited={isFieldEdited}
                  />
                )}
                {activeTab === "revenue" && (
                  <RevenueSettings
                    key="revenue"
                    revenue={settings.revenue}
                    updateRevenue={(revenueUpdate) =>
                      setSettings((prev) => ({
                        ...prev,
                        revenue: { ...prev.revenue, ...revenueUpdate },
                      }))
                    }
                    globalFillRate={settings.globalFillRate}
                    updateGlobalFillRate={(value) => updateSettings({ globalFillRate: value })}
                    isEdited={isFieldEdited}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column - Cost Preview (40%) */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-6">
              <CostPreview costs={costs} settings={settings} revenue={revenueCalculations} />

              {/* Validation warning for cost preview */}
              {hasValidationErrors && hasValidationErrors(validationResults) && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-lg flex items-start gap-2">
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

              {/* Revenue KPIs */}
              <div className="mb-6">
                <RevenueKPIs revenue={revenueCalculations} />
              </div>

              {/* Revenue vs Cost chart */}
              <RevenueVsCost revenue={revenueCalculations} costs={costs} />
            </div>
          </div>
        </div>

        {/* Research footnote */}
        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1 mx-auto">
                <HelpCircle size={14} />
                <span className="underline">Why these defaults?</span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Default values are based on April 2025 research summary of typical local TV station streaming
                  operations.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </main>

      {/* Footer / Actions */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Button variant="outline" onClick={resetSettings} className="gap-2">
            <RefreshCw size={16} />
            <span>Reset</span>
          </Button>

          <Button
            onClick={copyToEstimate}
            className="gap-2"
            disabled={hasValidationErrors && hasValidationErrors(validationResults)}
          >
            <Copy size={16} />
            <span>Copy to Estimate</span>
          </Button>
        </div>
      </footer>
    </div>
  )
}
