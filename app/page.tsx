"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { Download, RefreshCw, Copy } from "lucide-react"
import { calculateCosts } from "@/lib/cost-engine"
import { PlatformPicker } from "@/components/platform-picker"
import { SettingsCard } from "@/components/settings-card"
import { CostPreview } from "@/components/cost-preview"
import { SettingsTabs } from "@/components/settings-tabs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { SettingsState, Tab } from "@/lib/types"

export default function CostCalculator() {
  const [settings, setSettings] = useState<SettingsState>({
    platform: "mux",
    streamEnabled: true, // Initialize to true
    channelCount: 1,
    peakConcurrentViewers: 100,
    encodingPreset: "1080p-tri-ladder",
    liveDvrEnabled: true,
    recordingStorageLocation: "same-as-vod",
    vodEnabled: true,
    vodProvider: "same-as-live",
    hoursPerDayArchived: 24,
    retentionWindow: 30,
    deliveryRegion: "us",
    peakConcurrentVodViewers: 50,
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
    serverCost: 1299,
    hardwareAvailable: false,
    // Self-hosted defaults
    networkInterface: "1gbe",
    nicCost: 300,
    enterpriseNetworkCost: 5000,
    bandwidthCapacity: 1000,
    streamingServer: "mediamtx",
    transcodingEngine: "hardware",
    redundancyLevel: "none",
    secondaryServerCost: 1300,
    cloudProvider: "cloudflare",
    originEgressCost: 0.09,
    hybridRedundancyMode: "active-passive",
  })

  const [activeTab, setActiveTab] = useState<Tab>("live")

  const costs = calculateCosts(settings)

  const updateSettings = (newSettings: Partial<SettingsState>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const resetSettings = () => {
    setSettings({
      platform: "mux",
      streamEnabled: true, // Initialize to true
      channelCount: 1,
      peakConcurrentViewers: 100,
      encodingPreset: "1080p-tri-ladder",
      liveDvrEnabled: true,
      recordingStorageLocation: "same-as-vod",
      vodEnabled: true,
      vodProvider: "same-as-live",
      hoursPerDayArchived: 24,
      retentionWindow: 30,
      deliveryRegion: "us",
      peakConcurrentVodViewers: 50,
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
      serverCost: 1299,
      hardwareAvailable: false,
      // Self-hosted defaults
      networkInterface: "1gbe",
      nicCost: 300,
      enterpriseNetworkCost: 5000,
      bandwidthCapacity: 1000,
      streamingServer: "mediamtx",
      transcodingEngine: "hardware",
      redundancyLevel: "none",
      secondaryServerCost: 1300,
      cloudProvider: "cloudflare",
      originEgressCost: 0.09,
      hybridRedundancyMode: "active-passive",
    })
    setActiveTab("live")
  }

  const copyToEstimate = () => {
    // Implementation for copying to estimate
    console.log("Copying to estimate:", settings, costs)
    // This would typically call an API or generate a CSV
  }

  const isSelfHosted = settings.platform === "self-hosted" || settings.platform === "hybrid"

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
            />

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
                  />
                )}

                {/* Only show Live->VOD section if streaming is enabled */}
                {activeTab === "live" && settings.streamEnabled !== false && (
                  <SettingsCard
                    key="live-to-vod"
                    title="Live → VOD"
                    description="Configure how live streams are archived to VOD"
                    settings={settings}
                    updateSettings={updateSettings}
                    type="live-to-vod"
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
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column - Cost Preview (40%) */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <CostPreview costs={costs} settings={settings} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer / Actions */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Button variant="outline" onClick={resetSettings} className="gap-2">
            <RefreshCw size={16} />
            <span>Reset</span>
          </Button>

          <Button onClick={copyToEstimate} className="gap-2">
            <Copy size={16} />
            <span>Copy to Estimate</span>
          </Button>
        </div>
      </footer>
    </div>
  )
}
