export type Platform = "mux" | "cloudflare" | "self-hosted" | "hybrid"

export type Tab =
  | "live"
  | "legacy-vod"
  | "storage"
  | "email"
  | "cdn"
  | "hardware"
  | "analytics"
  | "revenue"
  | "reference"

export interface ChannelStatistics {
  id: string
  name: string
  viewership: number
  averageRetentionMinutes: number
  adSpotsPerHour: number
  cpmRate: number
  fillRate?: number // Added fill rate override for per-channel
  liveHours: number // NEW: "Live Hours/Day" – hours of new live content broadcast each day
  vodUniques: number // NEW: "Daily VOD Viewers" – unique on-demand viewers per day
  vodWatchMin: number // NEW: "Avg VOD Watch Time (min)" – average minutes each watches VOD
}

export interface VodStatistics {
  id: string
  name: string
  monthlyViews: number
  averageWatchTimeMinutes: number
  adSpotsPerView: number
  cpmRate: number
  fillRate?: number // Added fill rate override for VOD categories
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

  // New hardware fields
  hardwareMode?: "own" | "rent"
  amortizationMonths?: number
  powerConsumptionKwh?: number
  powerCostPerKwh?: number
  internetColoMonthlyCost?: number
  monthlyRentalCost?: number
  networkSwitchCost?: number

  // Global Settings
  globalFillRate: number // "Global Fill Rate %" – fallback fill rate for all channels
  powerRate: number // "Power $/kWh" – electricity cost per kilowatt-hour
  cdnCostPerGB: number // "CDN $/GB" – egress cost per GB of streaming data
  avgBitrateOverride?: number // "Avg Bitrate (Mbps)" – use this value instead of preset for self-host

  // New fields for hardware recommendations
  cpuCores?: number
  memoryGB?: number
  avgBitrateOverride?: number // Average bitrate per viewer in Mbps

  // Hardware & Hosting Opex
  capEx?: number // "Cap-ex $" – up-front cost of hardware (e.g. Mac Mini)
  amortMonths?: number // "Amortisation (mo)" – over how many months to amortise cap-ex
  wattage?: number // "Wattage (W)" – average power draw of your server
  serverOpexMo: number // "Server $/mo" – amortised hardware cost per month
  electricityOpexMo: number // "Electricity $/mo" – monthly power bill
  internetOpexMo: number // "Internet $/mo" – business-class connection cost

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
  fillRate: number // Added global fill rate

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
  vodFillRate: number // Added global VOD fill rate

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
