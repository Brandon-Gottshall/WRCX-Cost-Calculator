import type { SettingsState } from "@/lib/types"

export const globalDefaults: Partial<SettingsState> = {
  // Global Settings
  globalFillRate: 35, // % of ad slots filled station-wide
  powerRate: 0.144, // $/kWh (Ohio average)
  cdnCostPerGB: 0.03, // $/GB (≈ $0.001/min @5 Mbps)
  avgBitrateOverride: undefined, // use preset ladder by default

  // Hardware & Hosting Opex
  capEx: 1299, // Default Mac Mini cost
  amortMonths: 36, // Default 3-year amortization
  wattage: 25, // Default Mac Mini wattage
  serverOpexMo: 36.08, // Default calculated value (1299 / 36)
  electricityOpexMo: 2.59, // Default calculated value (25W * 24h * 30d * 0.144 / 1000)
  internetOpexMo: 99, // Default business internet cost

  // Revenue settings
  revenue: {
    liveAdsEnabled: true,
    averageDailyUniqueViewers: 1000,
    averageViewingHoursPerViewer: 2,
    adSpotsPerHour: 4,
    cpmRate: 15,
    fillRate: 35,

    // Advanced revenue controls
    peakTimeMultiplier: 1.2,
    seasonalMultiplier: 1.0,
    targetDemographicValue: 1.1,

    paidProgrammingEnabled: true,
    monthlyPaidBlocks: 4,
    ratePerBlock: 250,

    // Premium tier options
    premiumSponsorshipEnabled: false,
    premiumSponsorshipRate: 500,
    premiumSponsorshipCount: 0,

    vodAdsEnabled: true,
    monthlyVodViews: 5000,
    adSpotsPerVodView: 1,
    vodCpmRate: 20,
    vodFillRate: 35,

    // VOD advanced options
    vodSkipRate: 0.15,
    vodCompletionRate: 0.85,
    vodPremiumPlacementRate: 0.05,
  },
}
