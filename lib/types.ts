export type Platform = "mux" | "cloudflare" | "self-hosted" | "hybrid"

export type Tab = "live" | "legacy-vod" | "storage" | "email" | "cdn" | "hardware" | "analytics"

export interface SettingsState {
  // Stream (Live)
  platform: Platform
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

  // Hardware & Hosting
  macMiniNeeded: boolean
  networkSwitchNeeded: boolean
  rackHostingLocation: string
  rackCost: number

  // Analytics
  viewerAnalytics: string
  siteAnalytics: string
}

export interface Costs {
  encoding: number
  storage: number
  delivery: number
  other: number
}
