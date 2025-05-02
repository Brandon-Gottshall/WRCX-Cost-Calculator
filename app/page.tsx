"use client"

import { useState, useCallback, Suspense } from "react"
import { SettingsCard } from "@/components/settings-card"
import { CostBreakdown } from "@/components/cost-breakdown"
import { CostPreview } from "@/components/cost-preview"
import { PlatformPicker } from "@/components/platform-picker"
import { VodStatisticsManager as VodStatistics } from "@/components/vod-statistics"
import { RevenueSettings } from "@/components/revenue-settings"
import { RevenueKPIs as RevenueKpis } from "@/components/revenue-kpis"
import { SettingsTabs } from "@/components/settings-tabs"
import { InfrastructureProvider } from "@/lib/store-init"
import { initializeStore, saveStore } from "@/lib/store-init"
import { validateSettings } from "@/lib/validation"
import { LiveChannels } from "@/components/live-channels"
import type { SettingsState, Tab, Platform, VodStatistics as VodStatsType, RevenueState } from "@/lib/types"
import { Info } from "lucide-react"
import { UnifiedHardwareRecommendations } from "@/components/unified-hardware-recommendations"
import { StickyCostContainer } from "@/components/sticky-cost-container"
import { PerformanceProfiler } from "@/components/performance-profiler"
import { useCostModel } from "@/hooks/use-cost-model"
// Import dynamic components
import {
  DynamicRevenueVsCost,
  DynamicAnalyticsTabContent,
  DynamicReferenceTabContent,
} from "@/components/dynamic-imports"

// Shimmer component for loading states
const ShimmerLoader = () => <div className="h-64 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg"></div>

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

  // Use our memoized cost model hook
  const { costs, revenue } = useCostModel(settings)

  // Validate settings
  const validationResults = validateSettings(settings)

  // Update settings and save to localStorage
  const updateSettings = useCallback((newSettings: Partial<SettingsState>) => {
    setSettings((prevSettings) => {
      const updatedSettings = { ...prevSettings, ...newSettings }
      saveStore(updatedSettings)
      return updatedSettings
    })

    // Track which fields have been edited
    setEditedFields((prev) => {
      const newEditedFields = { ...prev }
      Object.keys(newSettings).forEach((key) => {
        newEditedFields[key] = true
      })
      return newEditedFields
    })
  }, [])

  // Function to update revenue settings
  const updateRevenue = useCallback(
    (revenueUpdates: Partial<RevenueState>) => {
      updateSettings({
        revenue: { ...settings.revenue, ...revenueUpdates },
      })
    },
    [settings.revenue, updateSettings],
  )

  // Function to update global fill rate
  const updateGlobalFillRate = useCallback(
    (value: number) => {
      updateSettings({ globalFillRate: value })
    },
    [updateSettings],
  )

  // Check if a field has been edited
  const isEdited = useCallback(
    (fieldPath: string) => {
      return editedFields[fieldPath] === true
    },
    [editedFields],
  )

  // Handle platform change
  const handlePlatformChange = useCallback(
    (platform: Platform) => {
      updateSettings({ platform })
    },
    [updateSettings],
  )

  // Add a function to update VOD categories
  const updateVodCategories = useCallback(
    (vodCategories: VodStatsType[]) => {
      updateSettings({ vodCategories })
    },
    [updateSettings],
  )

  // Determine if we should show hardware recommendations
  const showHardwareRecommendations = settings.platform === "self-hosted" || settings.platform === "hybrid"

  return (
    <PerformanceProfiler id="HomePage">
      <InfrastructureProvider>
        <main className="container mx-auto py-6 px-4 max-w-7xl">
          <h1 className="text-3xl font-bold mb-6">WRCX Stream/VOD Platform Calculator</h1>

          {/* Platform Picker - always visible at the top */}
          <div className="mb-6">
            <PlatformPicker
              platform={settings.platform}
              onChange={handlePlatformChange}
              settings={settings}
              updateSettings={updateSettings}
            />
          </div>

          {/* Mobile-only hardware recommendations - shown after Platform Picker on small screens */}
          {showHardwareRecommendations && (
            <div className="lg:hidden mb-6">
              <UnifiedHardwareRecommendations settings={settings} updateSettings={updateSettings} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Settings */}
            <div className="lg:col-span-2 space-y-6">
              <SettingsTabs activeTab={activeTab} onChange={setActiveTab} settings={settings} />

              {activeTab === "live" && (
                <>
                  <LiveChannels
                    settings={settings}
                    updateSettings={updateSettings}
                    validationResults={validationResults}
                    isEdited={isEdited}
                  />

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
                        Hardware recommendations are displayed below the platform picker on mobile devices and in the
                        right sidebar on desktop.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "analytics" && (
                <Suspense fallback={<ShimmerLoader />}>
                  <DynamicAnalyticsTabContent
                    settings={settings}
                    updateSettings={updateSettings}
                    validationResults={validationResults}
                    isEdited={isEdited}
                  />
                </Suspense>
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
                  <Suspense fallback={<ShimmerLoader />}>
                    <DynamicRevenueVsCost revenue={revenue} costs={costs} />
                  </Suspense>
                </>
              )}

              {activeTab === "reference" && (
                <Suspense fallback={<ShimmerLoader />}>
                  <DynamicReferenceTabContent settings={settings} validationResults={validationResults} />
                </Suspense>
              )}
            </div>

            {/* Right column - Hardware Recommendations and Cost Preview */}
            <div className="space-y-6">
              {/* Hardware Recommendations - desktop only */}
              {showHardwareRecommendations ? (
                <div className="hidden lg:block">
                  <UnifiedHardwareRecommendations settings={settings} updateSettings={updateSettings} />
                </div>
              ) : (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900/30">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">Managed Infrastructure</h3>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {settings.platform === "mux" ? "Mux" : "Cloudflare Stream"} provides fully managed
                        infrastructure for your streaming needs. No hardware configuration is required.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Cost Preview */}
              <StickyCostContainer
                settings={settings}
                updateSettings={updateSettings}
                showHardwareRecommendations={showHardwareRecommendations}
              >
                <CostPreview costs={costs} settings={settings} revenue={revenue} />
                <CostBreakdown costs={costs} settings={settings} />
              </StickyCostContainer>
            </div>
          </div>
        </main>
      </InfrastructureProvider>
    </PerformanceProfiler>
  )
}
