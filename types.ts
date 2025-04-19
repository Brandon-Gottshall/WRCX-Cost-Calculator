export type Platform = "mux" | "cloudflare" | "self-hosted" | "hybrid"

export type Tab = "live" | "legacy-vod" | "storage" | "email" | "cdn" | "hardware" | "analytics"

export interface SettingsState {
  // Stream (Live)
  platform: Platform
  streamEnabled: boolean // New property to toggle stream functionality
  channelCount: number
  peakConcurrentViewers: number
  encodingPreset: string
  liveDvrEnabled: boolean
  recordingStorageLocation: string

  // Live → VOD
  vodEnabled: boolean
  vodProvider: string
  hoursPerDayArchived: number
  retentionWindow: number
  deliveryRegion: string
  peakConcurrentVodViewers: number

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
}

export interface Costs {
  encoding: number
  storage: number
  delivery: number
  other: number
}
