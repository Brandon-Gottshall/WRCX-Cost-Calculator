import type { RevenueState, ChannelStatistics, VodStatistics } from "@/lib/types"
import type { Costs } from "@/lib/types"
import type { RevenueCalculations } from "@/lib/types"

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
        // Daily revenue = viewership * retention (hours) * ad spots per hour * CPM / 1000
        const dailyRevenue =
          (channel.viewership * (channel.averageRetentionMinutes / 60) * channel.adSpotsPerHour * channel.cpmRate) /
          1000

        // Apply multipliers if available
        const multiplier =
          (revenueState.peakTimeMultiplier || 1) *
          (revenueState.seasonalMultiplier || 1) *
          (revenueState.targetDemographicValue || 1)

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
      liveAdRevenue =
        ((revenueState.averageDailyUniqueViewers *
          revenueState.averageViewingHoursPerViewer *
          revenueState.adSpotsPerHour *
          revenueState.cpmRate) /
          1000) *
        30 * // Assuming 30 days per month
        (revenueState.peakTimeMultiplier || 1) *
        (revenueState.seasonalMultiplier || 1) *
        (revenueState.targetDemographicValue || 1)
    }
  }

  // Calculate Paid Programming Revenue
  let paidProgrammingRevenue = revenueState.paidProgrammingEnabled
    ? revenueState.monthlyPaidBlocks * revenueState.ratePerBlock
    : 0

  // Add premium sponsorship revenue if enabled
  let premiumSponsorshipRevenue = 0
  if (revenueState.paidProgrammingEnabled && revenueState.premiumSponsorshipEnabled) {
    premiumSponsorshipRevenue = (revenueState.premiumSponsorshipCount || 0) * (revenueState.premiumSponsorshipRate || 0)
    paidProgrammingRevenue += premiumSponsorshipRevenue
  }

  // Calculate VOD Ad Revenue
  let vodAdRevenue = 0
  const vodCategoryRevenues: { categoryId: string; revenue: number }[] = []

  if (revenueState.vodAdsEnabled) {
    if (vodCategories && vodCategories.length > 0) {
      // Calculate per-category revenue
      vodCategories.forEach((category) => {
        // Apply advanced factors if available
        const skipFactor = 1 - (revenueState.vodSkipRate || 0)
        const completionFactor = revenueState.vodCompletionRate || 1
        const premiumFactor = 1 + (revenueState.vodPremiumPlacementRate || 0)

        // Monthly revenue = views * ad spots per view * CPM / 1000 * factors
        const categoryRevenue =
          ((category.monthlyViews * category.adSpotsPerView * category.cpmRate) / 1000) *
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
      const skipFactor = 1 - (revenueState.vodSkipRate || 0)
      const completionFactor = revenueState.vodCompletionRate || 1
      const premiumFactor = 1 + (revenueState.vodPremiumPlacementRate || 0)

      vodAdRevenue =
        ((revenueState.monthlyVodViews * revenueState.adSpotsPerVodView * revenueState.vodCpmRate) / 1000) *
        skipFactor *
        completionFactor *
        premiumFactor
    }
  }

  // Calculate Total Revenue
  const totalRevenue = liveAdRevenue + paidProgrammingRevenue + vodAdRevenue

  // Calculate Net Operating Profit
  const totalCost = costs.encoding + costs.storage + costs.delivery + costs.other
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
