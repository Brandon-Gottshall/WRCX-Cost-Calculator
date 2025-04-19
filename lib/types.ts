export type Platform = "mux" | "cloudflare" | "self-hosted" | "hybrid"

export type Tab = "live" | "legacy-vod" | "storage" | "email" | "cdn" | "hardware" | "analytics" | "revenue"

export interface ChannelStatistics {
  id: string
  name: string
  viewership: number
  averageRetentionMinutes: number
  adSpotsPerHour: number
  cpmRate: number
}

export interface VodStatistics {
  id: string
  name: string
  monthlyViews: number
  averageWatchTimeMinutes: number
  adSpotsPerView: number
  cpmRate: number
}

export interface SettingsState {
  // Stream (Live)
  platform: Platform
  streamEnabled: boolean // New property to toggle stream functionality
  channelCount: number
  peakConcurrentViewers: number
  encodingPreset: string
  liveDvrEnabled: boolean
  recordingStorageLocation: string

  // Channel-specific statistics
  channels: ChannelStatistics[]

  // Live → VOD
  vodEnabled: boolean
  vodProvider: string
  hoursPerDayArchived: number
  retentionWindow: number
  deliveryRegion: string
  peakConcurrentVodViewers: number

  // VOD-specific statistics
  vodCategories: VodStatistics[]

  // Legacy VOD
  legacyEnabled: boolean
  backCatalogHours: number
  legacyProvider: string
  preEncoded: boolean

  // Storage & DB
  dataStore: string
  dbBackupRetention: number
  videoStorageStrategy: string

  // Email
  outboundEmail: boolean
  monthlyEmailVolume: number

  // CDN
  cdnPlan: string
  cdnEgressRate?: number
  websiteCdnPlan?: string
  videoCdnProvider?: string
  videoCdnPlan?: string
  videoCdnEgressRate?: number

  // Hardware & Hosting
  macMiniNeeded: boolean
  networkSwitchNeeded: boolean
  rackHostingLocation: string
  rackCost: number
  serverType: string
  serverCount: number
  serverCost: number
  hardwareAvailable: boolean
  recommendedHardware?: string

  // Analytics
  viewerAnalytics: string
  siteAnalytics: string
  // In a real implementation, we would update these to be arrays
  // viewerAnalytics: string[]
  // siteAnalytics: string[]

  // Self-Hosted Configuration
  networkInterface?: string
  nicCost?: number
  enterpriseNetworkCost?: string
  transcodingEngine?: string
  redundancyLevel?: string
  secondaryServerCost?: number
  cloudProvider?: string
  originEgressCost?: number
  bandwidthCapacity?: number
  streamingServer?: string
  hybridRedundancyMode?: string

  // Revenue settings
  revenue: RevenueState
}

export interface Costs {
  encoding: number
  storage: number
  delivery: number
  other: number
}

// Add these new types for revenue calculations
export interface RevenueState {
  // Live Ad Revenue
  liveAdsEnabled: boolean
  averageDailyUniqueViewers: number
  averageViewingHoursPerViewer: number
  adSpotsPerHour: number
  cpmRate: number

  // Advanced revenue controls
  peakTimeMultiplier: number
  seasonalMultiplier: number
  targetDemographicValue: number

  // Paid Programming
  paidProgrammingEnabled: boolean
  monthlyPaidBlocks: number
  ratePerBlock: number

  // Premium tier options
  premiumSponsorshipEnabled: boolean
  premiumSponsorshipRate: number
  premiumSponsorshipCount: number

  // VOD Ad Revenue
  vodAdsEnabled: boolean
  monthlyVodViews: number
  adSpotsPerVodView: number
  vodCpmRate: number

  // VOD advanced options
  vodSkipRate: number
  vodCompletionRate: number
  vodPremiumPlacementRate: number
}

export interface RevenueCalculations {
  liveAdRevenue: number
  paidProgrammingRevenue: number
  vodAdRevenue: number
  totalRevenue: number
  netOperatingProfit: number

  // Detailed breakdowns
  channelRevenues: { channelId: string; revenue: number }[]
  vodCategoryRevenues: { categoryId: string; revenue: number }[]
  premiumSponsorshipRevenue?: number
}
