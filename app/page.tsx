"use client"

import { useState } from "react"
import { SettingsCard } from "@/components/settings-card"
import { CostBreakdown } from "@/components/cost-breakdown"
import { CostPreview } from "@/components/cost-preview"
import { PlatformPicker } from "@/components/platform-picker"
import { ChannelStatisticsManager as ChannelStatistics } from "@/components/channel-statistics"
import { VodStatisticsManager as VodStatistics } from "@/components/vod-statistics"
import { RevenueSettings } from "@/components/revenue-settings"
import { RevenueKPIs as RevenueKpis } from "@/components/revenue-kpis"
import { RevenueVsCost } from "@/components/revenue-vs-cost"
import { SettingsTabs } from "@/components/settings-tabs"
import { PricingAssumptions } from "@/components/pricing-assumptions"
import ValidatedAssumptions from "@/components/validated-assumptions"
import { CitationsList as Citations } from "@/components/citations"
import { InfrastructureRecommendation } from "@/components/infrastructure-recommendation"
import { InfrastructureProvider } from "@/lib/store-init"
import { initializeStore, saveStore } from "@/lib/store-init"
import { calculateCosts } from "@/lib/cost-engine"
import { calculateRevenue } from "@/lib/revenue-engine"
import { validateSettings } from "@/lib/validation"
import type {
  SettingsState,
  Tab,
  Platform,
  ChannelStatistics as ChannelStatsType,
  VodStatistics as VodStatsType,
  RevenueState,
} from "@/lib/types"
import { AlertTriangle, Info } from "lucide-react"
import { UnifiedHardwareRecommendations } from "@/components/unified-hardware-recommendations"

export default function Home() {
  const [settings, setSettings] = useState<SettingsState>(
    initializeStore({
      platform: "mux",
      streamEnabled: true,
      channelCount: 1,
      peakConcurrentViewers: 100,
      encodingPreset: "1080p-tri-ladder",
      liveDvrEnabled: false,
      recordingStorageLocation: "same-as-vod",
      channels: [],
      vodEnabled: true,
      vodProvider: "same-as-live",
      hoursPerDayArchived: 8,
      retentionWindow: 30,
      deliveryRegion: "us",
      peakConcurrentVodViewers: 50,
      vodCategories: [],
      legacyEnabled: false,
      backCatalogHours: 0,
      legacyProvider: "same-as-vod",
      preEncoded: false,
      dataStore: "local-sqlite",
      dbBackupRetention: 7,
      videoStorageStrategy: "r2",
      outboundEmail: false,
      monthlyEmailVolume: 0,
      cdnPlan: "free",
      macMiniNeeded: false,
      networkSwitchNeeded: false,
      rackHostingLocation: "local",
      rackCost: 0,
      serverType: "mac-mini",
      serverCount: 1,
      serverCost: 1299,
      hardwareAvailable: true,
      serverOpexMo: 0,
      electricityOpexMo: 0,
      internetOpexMo: 0,
      viewerAnalytics: "none",
      siteAnalytics: "none",
      globalFillRate: 70,
      powerRate: 0.144,
      cdnCostPerGB: 0.085,
      revenue: {
        liveAdsEnabled: true,
        averageDailyUniqueViewers: 1000,
        averageViewingHoursPerViewer: 1.5,
        adSpotsPerHour: 4,
        cpmRate: 20,
        fillRate: 70,
        peakTimeMultiplier: 1.5,
        seasonalMultiplier: 1.2,
        targetDemographicValue: 1.0,
        paidProgrammingEnabled: false,
        monthlyPaidBlocks: 0,
        ratePerBlock: 0,
        premiumSponsorshipEnabled: false,
        premiumSponsorshipRate: 0,
        premiumSponsorshipCount: 0,
        vodAdsEnabled: true,
        monthlyVodViews: 5000,
        adSpotsPerVodView: 2,
        vodCpmRate: 15,
        vodFillRate: 60,
        vodSkipRate: 20,
        vodCompletionRate: 70,
        vodPremiumPlacementRate: 0,
      },
    }),
  )

  const [activeTab, setActiveTab] = useState<Tab>("live")
  const [editedFields, setEditedFields] = useState<Record<string, boolean>>({})
  const [infrastructureError, setInfrastructureError] = useState<Error | null>(null)

  // Calculate costs based on current settings
  const costs = calculateCosts(settings)

  // Calculate revenue based on current settings
  const revenue = calculateRevenue(settings.revenue, costs, settings.channels, settings.vodCategories)

  // Validate settings
  const validationResults = validateSettings(settings)

  // Update settings and save to localStorage
  const updateSettings = (newSettings: Partial<SettingsState>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    saveStore(updatedSettings)

    // Track which fields have been edited
    const newEditedFields = { ...editedFields }
    Object.keys(newSettings).forEach((key) => {
      newEditedFields[key] = true
    })
    setEditedFields(newEditedFields)
  }

  // Function to update revenue settings
  const updateRevenue = (revenueUpdates: Partial<RevenueState>) => {
    updateSettings({
      revenue: { ...settings.revenue, ...revenueUpdates },
    })
  }

  // Function to update global fill rate
  const updateGlobalFillRate = (value: number) => {
    updateSettings({ globalFillRate: value })
  }

  // Check if a field has been edited
  const isEdited = (fieldPath: string) => {
    return editedFields[fieldPath] === true
  }

  // Handle platform change
  const handlePlatformChange = (platform: Platform) => {
    updateSettings({ platform })
  }

  // Add a function to update channels
  const updateChannels = (channels: ChannelStatsType[]) => {
    updateSettings({ channels })
  }

  // Add a function to update VOD categories
  const updateVodCategories = (vodCategories: VodStatsType[]) => {
    updateSettings({ vodCategories })
  }

  return (
    <InfrastructureProvider>
      <main className="container mx-auto py-6 px-4 max-w-7xl">
        <h1 className="text-3xl font-bold mb-6">WRCX Stream/VOD Platform Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Settings */}
          <div className="lg:col-span-2 space-y-6">
            <PlatformPicker
              platform={settings.platform}
              onChange={handlePlatformChange}
              settings={settings}
              updateSettings={updateSettings}
            />

            <SettingsTabs activeTab={activeTab} onChange={setActiveTab} settings={settings} />

            {activeTab === "live" && (
              <>
                <SettingsCard
                  title="Live Streaming"
                  description="Configure your live streaming settings"
                  settings={settings}
                  updateSettings={updateSettings}
                  type="stream"
                  validationResults={validationResults}
                  isEdited={isEdited}
                />

                <ChannelStatistics
                  channels={settings.channels || []}
                  updateChannels={updateChannels}
                  defaultFillRate={settings.globalFillRate}
                  isEdited={isEdited}
                />

                <div className="relative">
                  {infrastructureError ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-red-800">Error loading infrastructure recommendations</h3>
                          <p className="text-sm text-red-600 mt-1">{infrastructureError.message}</p>
                          <button
                            onClick={() => setInfrastructureError(null)}
                            className="mt-2 text-xs text-blue-600 hover:underline"
                          >
                            Try again
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <InfrastructureRecommendation />
                  )}
                </div>

                <SettingsCard
                  title="Live → VOD"
                  description="Configure archiving live streams as VOD content"
                  settings={settings}
                  updateSettings={updateSettings}
                  type="live-to-vod"
                  validationResults={validationResults}
                  isEdited={isEdited}
                />
              </>
            )}

            {activeTab === "legacy-vod" && (
              <>
                <SettingsCard
                  title="Legacy VOD"
                  description="Configure existing video content"
                  settings={settings}
                  updateSettings={updateSettings}
                  type="legacy-vod"
                  validationResults={validationResults}
                  isEdited={isEdited}
                />

                <VodStatistics
                  vodCategories={settings.vodCategories || []}
                  updateVodCategories={updateVodCategories}
                  defaultFillRate={settings.globalFillRate}
                />
              </>
            )}

            {activeTab === "storage" && (
              <SettingsCard
                title="Storage & Database"
                description="Configure storage and database settings"
                settings={settings}
                updateSettings={updateSettings}
                type="storage-db"
                validationResults={validationResults}
                isEdited={isEdited}
              />
            )}

            {activeTab === "email" && (
              <SettingsCard
                title="Email"
                description="Configure email settings"
                settings={settings}
                updateSettings={updateSettings}
                type="email"
                validationResults={validationResults}
                isEdited={isEdited}
              />
            )}

            {activeTab === "cdn" && (
              <SettingsCard
                title="CDN"
                description="Configure content delivery network settings"
                settings={settings}
                updateSettings={updateSettings}
                type="cdn"
                validationResults={validationResults}
                isEdited={isEdited}
              />
            )}

            {activeTab === "hardware" && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900/30">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">Hardware Configuration</h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Hardware recommendations are now displayed in the right sidebar for easier access. You can
                      configure your infrastructure settings there.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "analytics" && (
              <SettingsCard
                title="Analytics"
                description="Configure analytics settings"
                settings={settings}
                updateSettings={updateSettings}
                type="analytics"
                validationResults={validationResults}
                isEdited={isEdited}
              />
            )}

            {activeTab === "revenue" && (
              <>
                <RevenueSettings
                  revenue={settings.revenue}
                  updateRevenue={updateRevenue}
                  globalFillRate={settings.globalFillRate}
                  updateGlobalFillRate={updateGlobalFillRate}
                  isEdited={isEdited}
                />
                <RevenueKpis revenue={revenue} />
                <RevenueVsCost revenue={revenue} costs={costs} />
              </>
            )}

            <PricingAssumptions settings={settings} updateSettings={updateSettings} />
            <ValidatedAssumptions settings={settings} validationResults={validationResults} />
            <Citations platform={settings.platform} />
          </div>

          {/* Right column - Hardware Recommendations and Cost Preview */}
          <div className="space-y-6">
            {/* Hardware Recommendations - now always visible in the right column */}
            {settings.platform === "self-hosted" || settings.platform === "hybrid" ? (
              <UnifiedHardwareRecommendations settings={settings} updateSettings={updateSettings} />
            ) : (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900/30">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">Managed Infrastructure</h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {settings.platform === "mux" ? "Mux" : "Cloudflare Stream"} provides fully managed infrastructure
                      for your streaming needs. No hardware configuration is required.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Cost Preview */}
            <CostPreview costs={costs} settings={settings} revenue={revenue} />
            <CostBreakdown costs={costs} settings={settings} />
          </div>
        </div>
      </main>
    </InfrastructureProvider>
  )
}
