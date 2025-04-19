import type { RevenueState, ChannelStatistics, VodStatistics } from "@/lib/types"
import type { Costs } from "@/lib/types"
import type { RevenueCalculations } from "@/lib/types"

// Helper function to ensure numeric values and prevent NaN
function ensureNumber(value: any, defaultValue = 0): number {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return defaultValue
  }
  return Number(value)
}

export function calculateRevenue(
  revenueState: RevenueState,
  costs: Costs,
  channels?: ChannelStatistics[],
  vodCategories?: VodStatistics[],
): RevenueCalculations {
  // Calculate Live Ad Revenue
  let liveAdRevenue = 0
  const channelRevenues: { channelId: string; revenue: number }[] = []

  if (revenueState.liveAdsEnabled) {
    if (channels && channels.length > 0) {
      // Calculate per-channel revenue
      channels.forEach((channel) => {
        // Get channel-specific fill rate or use global default
        const fillRate =
          channel.fillRate !== undefined
            ? ensureNumber(channel.fillRate, 100) / 100
            : ensureNumber(revenueState.fillRate, 100) / 100

        // Daily revenue = viewership * retention (hours) * ad spots per hour * fill rate * CPM / 1000
        const dailyRevenue =
          (ensureNumber(channel.viewership) *
            (ensureNumber(channel.averageRetentionMinutes) / 60) *
            ensureNumber(channel.adSpotsPerHour) *
            fillRate *
            ensureNumber(channel.cpmRate)) /
          1000

        // Apply multipliers if available
        const multiplier =
          ensureNumber(revenueState.peakTimeMultiplier, 1) *
          ensureNumber(revenueState.seasonalMultiplier, 1) *
          ensureNumber(revenueState.targetDemographicValue, 1)

        // Monthly revenue (30 days) with multipliers
        const channelRevenue = dailyRevenue * 30 * multiplier

        liveAdRevenue += channelRevenue
        channelRevenues.push({
          channelId: channel.id,
          revenue: channelRevenue,
        })
      })
    } else {
      // Use the aggregate numbers if no channel breakdown is available
      const fillRate = ensureNumber(revenueState.fillRate, 100) / 100

      liveAdRevenue =
        ((ensureNumber(revenueState.averageDailyUniqueViewers) *
          ensureNumber(revenueState.averageViewingHoursPerViewer) *
          ensureNumber(revenueState.adSpotsPerHour) *
          fillRate *
          ensureNumber(revenueState.cpmRate)) /
          1000) *
        30 * // Assuming 30 days per month
        ensureNumber(revenueState.peakTimeMultiplier, 1) *
        ensureNumber(revenueState.seasonalMultiplier, 1) *
        ensureNumber(revenueState.targetDemographicValue, 1)
    }
  }

  // Calculate Paid Programming Revenue
  let paidProgrammingRevenue = revenueState.paidProgrammingEnabled
    ? ensureNumber(revenueState.monthlyPaidBlocks) * ensureNumber(revenueState.ratePerBlock)
    : 0

  // Add premium sponsorship revenue if enabled
  let premiumSponsorshipRevenue = 0
  if (revenueState.paidProgrammingEnabled && revenueState.premiumSponsorshipEnabled) {
    premiumSponsorshipRevenue =
      ensureNumber(revenueState.premiumSponsorshipCount) * ensureNumber(revenueState.premiumSponsorshipRate)
    paidProgrammingRevenue += premiumSponsorshipRevenue
  }

  // Calculate VOD Ad Revenue
  let vodAdRevenue = 0
  const vodCategoryRevenues: { categoryId: string; revenue: number }[] = []

  if (revenueState.vodAdsEnabled) {
    if (vodCategories && vodCategories.length > 0) {
      // Calculate per-category revenue
      vodCategories.forEach((category) => {
        // Get category-specific fill rate or use global default
        const fillRate =
          category.fillRate !== undefined
            ? ensureNumber(category.fillRate, 100) / 100
            : ensureNumber(revenueState.vodFillRate, 100) / 100

        // Apply advanced factors if available
        const skipFactor = 1 - ensureNumber(revenueState.vodSkipRate, 0)
        const completionFactor = ensureNumber(revenueState.vodCompletionRate, 1)
        const premiumFactor = 1 + ensureNumber(revenueState.vodPremiumPlacementRate, 0)

        // Monthly revenue = views * ad spots per view * fill rate * CPM / 1000 * factors
        const categoryRevenue =
          ((ensureNumber(category.monthlyViews) *
            ensureNumber(category.adSpotsPerView) *
            fillRate *
            ensureNumber(category.cpmRate)) /
            1000) *
          skipFactor *
          completionFactor *
          premiumFactor

        vodAdRevenue += categoryRevenue
        vodCategoryRevenues.push({
          categoryId: category.id,
          revenue: categoryRevenue,
        })
      })
    } else {
      // Use the aggregate numbers if no category breakdown is available
      const fillRate = ensureNumber(revenueState.vodFillRate, 100) / 100
      const skipFactor = 1 - ensureNumber(revenueState.vodSkipRate, 0)
      const completionFactor = ensureNumber(revenueState.vodCompletionRate, 1)
      const premiumFactor = 1 + ensureNumber(revenueState.vodPremiumPlacementRate, 0)

      vodAdRevenue =
        ((ensureNumber(revenueState.monthlyVodViews) *
          ensureNumber(revenueState.adSpotsPerVodView) *
          fillRate *
          ensureNumber(revenueState.vodCpmRate)) /
          1000) *
        skipFactor *
        completionFactor *
        premiumFactor
    }
  }

  // Calculate Total Revenue
  const totalRevenue = liveAdRevenue + paidProgrammingRevenue + vodAdRevenue

  // Calculate Net Operating Profit
  const totalCost =
    ensureNumber(costs.encoding) +
    ensureNumber(costs.storage) +
    ensureNumber(costs.delivery) +
    ensureNumber(costs.other)
  const netOperatingProfit = totalRevenue - totalCost

  return {
    liveAdRevenue,
    paidProgrammingRevenue,
    vodAdRevenue,
    totalRevenue,
    netOperatingProfit,
    channelRevenues,
    vodCategoryRevenues,
    premiumSponsorshipRevenue: premiumSponsorshipRevenue > 0 ? premiumSponsorshipRevenue : undefined,
  }
}
