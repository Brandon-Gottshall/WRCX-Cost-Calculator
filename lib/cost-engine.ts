import type { SettingsState } from "@/types"
import type { Costs } from "@/types"

const MUX_PRICING = {
  ENCODING: {
    "720p": 0.03,
    "1080p": 0.06,
  },
  STORAGE: 0.003,
  DELIVERY: 0.00096, // Corrected Mux delivery rate
}

const CLOUDFLARE_PRICING = {
  STORAGE: 0.005,
  DELIVERY: 0.001,
}

const SELF_HOSTED_PRICING = {
  COMPUTE: {
    "t3.medium": 0.0624,
  },
  STORAGE: {
    r2: 0.015,
  },
  EGRESS: 0.04,
}

function minutesPerMonth(hoursPerDay: number): number {
  return hoursPerDay * 60 * 30
}

function calculateStorageMinutes(hoursPerDayArchived: number, retentionWindow: number): number {
  return hoursPerDayArchived * 60 * retentionWindow
}

// Helper function to calculate total live hours per day across all enabled channels
function calculateTotalLiveHoursPerDay(settings: SettingsState): number {
  // If channels array doesn't exist or is empty, fall back to the global setting
  if (!settings.channels || settings.channels.length === 0) {
    return settings.hoursPerDayArchived || 0
  }

  // Sum up liveHours from all enabled channels
  return settings.channels
    .filter((channel) => channel.enabled !== false) // Only include enabled channels
    .reduce((total, channel) => total + (channel.liveHours || 0), 0)
}

function getBitrateMultiplier(encodingPreset: string): number {
  switch (encodingPreset) {
    case "1080p-tri-ladder":
      return 5 * 2.8 // 5 Mbps base × 2.8 for ladder
    case "720p-tri-ladder":
      return 3 * 2.8 // 3 Mbps base × 2.8 for ladder
    case "480p-tri-ladder":
      return 1.5 * 2.8 // 1.5 Mbps base × 2.8 for ladder
    case "1080p-single":
      return 5 // 5 Mbps single rendition
    case "720p-single":
      return 3 // 3 Mbps single rendition
    case "480p-single":
      return 1.5 // 1.5 Mbps single rendition
    case "4k-tri-ladder":
      return 15 * 2.8 // 15 Mbps base × 2.8 for ladder
    case "4k-single":
      return 15 // 15 Mbps single rendition
    default:
      return 5 * 2.8 // Default to 1080p tri-ladder
  }
}

// Main cost calculation function
export function calculateCosts(settings: SettingsState): Costs {
  let encodingCost = 0
  let storageCost = 0
  let deliveryCost = 0
  let otherCost = 0

  // Live streaming costs - only calculate if streaming is enabled
  if (settings.streamEnabled !== false) {
    // Count only enabled channels
    const enabledChannelCount = settings.channels.filter((channel) => channel.enabled !== false).length
    // Use enabledChannelCount instead of settings.channelCount
    const liveMinutesPerMonth = minutesPerMonth(24) * enabledChannelCount

    // Calculate encoding costs
    if (settings.platform === "mux") {
      encodingCost +=
        liveMinutesPerMonth *
        (MUX_PRICING.ENCODING[settings.encodingPreset as keyof typeof MUX_PRICING.ENCODING] || 0.04)
    } else if (settings.platform === "cloudflare") {
      // Cloudflare has a different pricing model
      encodingCost += liveMinutesPerMonth * 0.0035
    } else if (settings.platform === "self-hosted") {
      // Self-hosted encoding costs based on compute
      encodingCost += 24 * 30 * SELF_HOSTED_PRICING.COMPUTE["t3.medium"] * enabledChannelCount
    } else if (settings.platform === "hybrid") {
      // Hybrid is a mix of self-hosted and cloud
      encodingCost += (liveMinutesPerMonth * 0.0035) / 2
      encodingCost += (24 * 30 * SELF_HOSTED_PRICING.COMPUTE["t3.medium"] * enabledChannelCount) / 2
    }

    // Live delivery costs - FIXED: Calculate average concurrent viewers instead of using peak
    // For Mux, we need to calculate total view-minutes, not multiply by peak concurrency
    // Assuming average viewers is about 40% of peak viewers for a typical broadcast pattern
    const averageConcurrentViewers = Math.round(settings.peakConcurrentViewers * 0.4)
    const liveDeliveryMinutes = liveMinutesPerMonth * averageConcurrentViewers

    // UPDATED: Handle delivery costs differently based on platform
    if (settings.platform === "mux") {
      deliveryCost += liveDeliveryMinutes * MUX_PRICING.DELIVERY
    } else if (settings.platform === "cloudflare") {
      deliveryCost += liveDeliveryMinutes * CLOUDFLARE_PRICING.DELIVERY
    } else if (settings.platform === "self-hosted") {
      // For self-hosted, only calculate delivery costs if using a CDN
      if (settings.videoCdnProvider && settings.videoCdnProvider !== "none") {
        // Convert minutes to GB for self-hosted egress
        const estimatedGbPerMinute = 0.01 // Assuming 1080p average
        const totalGbDelivered = liveDeliveryMinutes * estimatedGbPerMinute

        // Apply the appropriate egress rate
        const egressRate =
          settings.videoCdnEgressRate ||
          (settings.videoCdnProvider === "cloudfront"
            ? 0.085
            : settings.videoCdnProvider === "bunny"
              ? 0.01
              : settings.videoCdnProvider === "fastly"
                ? 0.12
                : 0.01)

        deliveryCost += totalGbDelivered * egressRate
      }
      // If not using a CDN, no variable delivery costs - it's just fixed ISP costs
      // which are accounted for in otherCost
    } else if (settings.platform === "hybrid") {
      // For hybrid, calculate delivery costs for the cloud portion
      const estimatedGbPerMinute = 0.01 // Assuming 1080p average
      const totalGbDelivered = liveDeliveryMinutes * estimatedGbPerMinute * 0.5 // Assume 50% through cloud

      // Apply the appropriate egress rate
      const egressRate = settings.originEgressCost || 0.09
      deliveryCost += totalGbDelivered * egressRate
    }

    // VOD storage costs - only if streaming is enabled and VOD is enabled
    if (settings.liveDvrEnabled && settings.vodEnabled) {
      // UPDATED: Use the total live hours from enabled channels instead of global setting
      const totalLiveHoursPerDay = calculateTotalLiveHoursPerDay(settings)

      // Calculate VOD minutes based on actual live content produced
      const vodMinutes = minutesPerMonth(totalLiveHoursPerDay)
      const storageMinutes = calculateStorageMinutes(totalLiveHoursPerDay, settings.retentionWindow)

      if (settings.vodProvider === "same-as-live" || settings.vodProvider === "mux") {
        storageCost += storageMinutes * MUX_PRICING.STORAGE
      } else if (settings.vodProvider === "cloudflare") {
        storageCost += storageMinutes * CLOUDFLARE_PRICING.STORAGE
      } else if (settings.vodProvider === "self-hosted-r2") {
        storageCost += storageMinutes * SELF_HOSTED_PRICING.STORAGE["r2"]
      }

      // VOD delivery costs - FIXED: Use average concurrent VOD viewers
      const averageConcurrentVodViewers = Math.round(settings.peakConcurrentVodViewers * 0.4)
      const deliveryMinutes = vodMinutes * averageConcurrentVodViewers

      // UPDATED: Handle VOD delivery costs differently based on provider
      if (settings.vodProvider === "same-as-live" || settings.vodProvider === "mux") {
        deliveryCost += deliveryMinutes * MUX_PRICING.DELIVERY
      } else if (settings.vodProvider === "cloudflare") {
        deliveryCost += deliveryMinutes * CLOUDFLARE_PRICING.DELIVERY
      } else if (settings.vodProvider === "self-hosted-r2") {
        // For self-hosted VOD, only calculate delivery costs if using a CDN
        if (settings.videoCdnProvider && settings.videoCdnProvider !== "none") {
          // Convert minutes to GB for self-hosted egress
          const estimatedGbPerMinute = 0.0075 // Assuming 720p average
          const totalGbDelivered = deliveryMinutes * estimatedGbPerMinute

          // Apply the appropriate egress rate
          const egressRate =
            settings.videoCdnEgressRate ||
            (settings.videoCdnProvider === "cloudfront"
              ? 0.085
              : settings.videoCdnProvider === "bunny"
                ? 0.01
                : settings.videoCdnProvider === "fastly"
                  ? 0.12
                  : 0.01)

          deliveryCost += totalGbDelivered * egressRate
        }
        // If not using a CDN, no variable delivery costs for VOD
      }
    }
  }

  // Legacy VOD costs - calculate regardless of streaming status
  if (settings.legacyEnabled) {
    const legacyStorageMinutes = settings.backCatalogHours * 60

    if (!settings.preEncoded) {
      // One-time encoding cost (amortized over a month)
      if (settings.legacyProvider === "same-as-vod" || settings.legacyProvider === "mux") {
        const encodingRate = MUX_PRICING.ENCODING[settings.encodingPreset as keyof typeof MUX_PRICING.ENCODING] || 0.04
        encodingCost += (legacyStorageMinutes * encodingRate) / 12
      } else if (settings.legacyProvider === "cloudflare") {
        encodingCost += (legacyStorageMinutes * 0.0035) / 12
      }
    }

    // Legacy storage costs
    if (settings.legacyProvider === "same-as-vod" || settings.legacyProvider === "mux") {
      storageCost += legacyStorageMinutes * MUX_PRICING.STORAGE
    } else if (settings.legacyProvider === "cloudflare") {
      storageCost += legacyStorageMinutes * CLOUDFLARE_PRICING.STORAGE
    } else if (settings.legacyProvider === "self-hosted-r2") {
      storageCost += legacyStorageMinutes * SELF_HOSTED_PRICING.STORAGE["r2"]
    }
  }

  // Other costs

  // CDN costs
  if (settings.websiteCdnPlan === "pro" || settings.cdnPlan === "pro") {
    otherCost += 20 // Cloudflare Pro
  } else if (settings.websiteCdnPlan === "business" || settings.cdnPlan === "business") {
    otherCost += 200 // Cloudflare Business
  }

  // UPDATED: Add fixed internet costs for self-hosted
  if (settings.platform === "self-hosted" || settings.platform === "hybrid") {
    // Add internet costs if not already accounted for
    if (!settings.internetOpexMo) {
      // Default internet costs based on bandwidth needs
      const averageConcurrentViewers = Math.round(settings.peakConcurrentViewers * 0.4)
      const estimatedBandwidthMbps = averageConcurrentViewers * 3 // Assume 3 Mbps per viewer

      // Estimate internet costs based on required bandwidth
      if (estimatedBandwidthMbps > 1000) {
        otherCost += 500 // Enterprise fiber
      } else if (estimatedBandwidthMbps > 500) {
        otherCost += 300 // Business fiber
      } else if (estimatedBandwidthMbps > 100) {
        otherCost += 150 // Business cable/fiber
      } else {
        otherCost += 100 // Standard business internet
      }
    }
  }

  // Video CDN costs for self-hosted/hybrid - MOVED to delivery costs section above
  if (
    (settings.platform === "self-hosted" || settings.platform === "hybrid") &&
    settings.videoCdnProvider &&
    settings.videoCdnProvider !== "none"
  ) {
    // Add base costs for premium CDN plans
    if (settings.videoCdnPlan === "premium") {
      otherCost += 50 // Premium tier base cost
    } else if (settings.videoCdnPlan === "enterprise") {
      otherCost += 200 // Enterprise tier base cost
    }
  }

  // Hardware costs
  if (settings.platform === "self-hosted" || settings.platform === "hybrid") {
    // Use the new hardware opex fields for cost calculation
    if (settings.hardwareMode === "own" || !settings.hardwareMode) {
      // Use serverOpexMo directly if available
      if (settings.serverOpexMo) {
        otherCost += settings.serverOpexMo * settings.serverCount
      } else if (settings.capEx && settings.amortMonths && settings.amortMonths > 0) {
        // Calculate from capEx and amortMonths if serverOpexMo is not available
        otherCost += (settings.capEx / settings.amortMonths) * settings.serverCount
      }
    } else if (settings.hardwareMode === "rent") {
      // Add monthly rental cost
      otherCost += settings.monthlyRentalCost || 0
    }

    // Add electricity costs
    if (settings.electricityOpexMo) {
      otherCost += settings.electricityOpexMo * settings.serverCount
    } else if (settings.wattage && settings.powerRate) {
      // Calculate from wattage and powerRate if electricityOpexMo is not available
      otherCost += ((settings.wattage * 24 * 30 * settings.powerRate) / 1000) * settings.serverCount
    }

    // Add internet/colocation costs
    if (settings.internetOpexMo) {
      otherCost += settings.internetOpexMo
    }

    // Add network switch cost if needed
    if (settings.networkSwitchNeeded && settings.networkSwitchCost) {
      const amortizationMonths = settings.amortMonths || settings.amortizationMonths || 24
      otherCost += settings.networkSwitchCost / amortizationMonths
    }
  }

  if (settings.networkSwitchNeeded) {
    otherCost += 20 // Amortized cost per month
  }

  if (settings.rackHostingLocation === "colo") {
    // Estimate rack units based on server type
    let rackUnits = 1 // Default for Mac Mini
    if (settings.serverType.includes("studio")) {
      rackUnits = 2 // Mac Studio is larger
    } else if (settings.serverType.includes("rack-server")) {
      // Extract rack units from server type (1U, 2U, etc.)
      const match = settings.serverType.match(/(\d+)u/)
      if (match) {
        rackUnits = Number.parseInt(match[1])
      }
    }
    otherCost += settings.rackCost * rackUnits * settings.serverCount
  }

  // Analytics costs
  if (settings.viewerAnalytics === "mux-data") {
    otherCost += settings.platform === "mux" ? 0 : 50
  } else if (settings.viewerAnalytics === "cf-analytics") {
    otherCost += settings.platform === "cloudflare" ? 0 : 20
  } else if (settings.viewerAnalytics === "self-host-grafana") {
    otherCost += 10
  }

  if (settings.siteAnalytics === "plausible") {
    otherCost += 9
  } else if (settings.siteAnalytics === "fathom") {
    otherCost += 14
  } else if (settings.siteAnalytics === "matomo") {
    otherCost += 19
  }

  return {
    encoding: Math.round(encodingCost * 100) / 100,
    storage: Math.round(storageCost * 100) / 100,
    delivery: Math.round(deliveryCost * 100) / 100,
    other: Math.round(otherCost * 100) / 100,
  }
}
