import type { SettingsState, Costs } from "./types"

// Constants for cost calculations
const MUX_PRICING = {
  ENCODING: {
    "1080p-tri-ladder": 0.0045, // per minute
    "720p-tri-ladder": 0.0035, // per minute
    "1080p-single": 0.0025, // per minute
    "4k-tri-ladder": 0.0085, // per minute
    "4k-single": 0.0055, // per minute
  },
  STORAGE: 0.003, // per minute
  DELIVERY: 0.00096, // per minute
}

const CLOUDFLARE_PRICING = {
  STORAGE: 0.005, // per minute
  DELIVERY: 0.001, // per minute
}

const SELF_HOSTED_PRICING = {
  COMPUTE: {
    "t3.medium": 0.0416, // per hour
  },
  STORAGE: {
    "local-nas": 0.00001, // per minute
    r2: 0.00002, // per minute
    "s3-standard-ia": 0.00003, // per minute
  },
  EGRESS: 0.09, // per GB
}

// Helper function to calculate minutes per month
function minutesPerMonth(hoursPerDay: number): number {
  return hoursPerDay * 30 * 60
}

// Helper function to calculate storage minutes
function calculateStorageMinutes(hoursPerDay: number, retentionDays: number): number {
  return minutesPerMonth(hoursPerDay) * (retentionDays / 30)
}

// Main cost calculation function
export function calculateCosts(settings: SettingsState): Costs {
  let encodingCost = 0
  let storageCost = 0
  let deliveryCost = 0
  let otherCost = 0

  // Live streaming costs
  const liveMinutesPerMonth = minutesPerMonth(24) * settings.channelCount

  // Calculate encoding costs
  if (settings.platform === "mux") {
    encodingCost +=
      liveMinutesPerMonth * MUX_PRICING.ENCODING[settings.encodingPreset as keyof typeof MUX_PRICING.ENCODING]
  } else if (settings.platform === "cloudflare") {
    // Cloudflare has a different pricing model
    encodingCost += liveMinutesPerMonth * 0.0035
  } else if (settings.platform === "self-hosted") {
    // Self-hosted encoding costs based on compute
    encodingCost += 24 * 30 * SELF_HOSTED_PRICING.COMPUTE["t3.medium"] * settings.channelCount
  } else if (settings.platform === "hybrid") {
    // Hybrid is a mix of self-hosted and cloud
    encodingCost += (liveMinutesPerMonth * 0.0035) / 2
    encodingCost += (24 * 30 * SELF_HOSTED_PRICING.COMPUTE["t3.medium"] * settings.channelCount) / 2
  }

  // VOD storage costs
  if (settings.liveDvrEnabled && settings.vodEnabled) {
    const vodMinutes = minutesPerMonth(settings.hoursPerDayArchived) * settings.channelCount
    const storageMinutes =
      calculateStorageMinutes(settings.hoursPerDayArchived, settings.retentionWindow) * settings.channelCount

    if (settings.vodProvider === "same-as-live" || settings.vodProvider === "mux") {
      storageCost += storageMinutes * MUX_PRICING.STORAGE
    } else if (settings.vodProvider === "cloudflare") {
      storageCost += storageMinutes * CLOUDFLARE_PRICING.STORAGE
    } else if (settings.vodProvider === "self-hosted-r2") {
      storageCost += storageMinutes * SELF_HOSTED_PRICING.STORAGE["r2"]
    }

    // VOD delivery costs
    const deliveryMinutes = vodMinutes * settings.peakConcurrentVodViewers

    if (settings.vodProvider === "same-as-live" || settings.vodProvider === "mux") {
      deliveryCost += deliveryMinutes * MUX_PRICING.DELIVERY
    } else if (settings.vodProvider === "cloudflare") {
      deliveryCost += deliveryMinutes * CLOUDFLARE_PRICING.DELIVERY
    } else if (settings.vodProvider === "self-hosted-r2") {
      // Convert minutes to GB for self-hosted egress
      const estimatedGbPerMinute = 0.0075 // Assuming 720p average
      deliveryCost += deliveryMinutes * estimatedGbPerMinute * SELF_HOSTED_PRICING.EGRESS
    }
  }

  // Legacy VOD costs
  if (settings.legacyEnabled) {
    const legacyStorageMinutes = settings.backCatalogHours * 60

    if (!settings.preEncoded) {
      // One-time encoding cost (amortized over a month)
      if (settings.legacyProvider === "same-as-vod" || settings.legacyProvider === "mux") {
        encodingCost +=
          (legacyStorageMinutes * MUX_PRICING.ENCODING[settings.encodingPreset as keyof typeof MUX_PRICING.ENCODING]) /
          12
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

  // Live delivery costs
  const liveDeliveryMinutes = liveMinutesPerMonth * settings.peakConcurrentViewers

  if (settings.platform === "mux") {
    deliveryCost += liveDeliveryMinutes * MUX_PRICING.DELIVERY
  } else if (settings.platform === "cloudflare") {
    deliveryCost += liveDeliveryMinutes * CLOUDFLARE_PRICING.DELIVERY
  } else if (settings.platform === "self-hosted" || settings.platform === "hybrid") {
    // Convert minutes to GB for self-hosted egress
    const estimatedGbPerMinute = 0.01 // Assuming 1080p average
    deliveryCost += liveDeliveryMinutes * estimatedGbPerMinute * SELF_HOSTED_PRICING.EGRESS
  }

  // Other costs

  // Database costs
  if (settings.dataStore === "remote-cockroach") {
    otherCost += 50 // Base cost for Cockroach DB
  }

  // Email costs
  if (settings.outboundEmail) {
    otherCost += Math.min(settings.monthlyEmailVolume / 1000, 1) * 10
  }

  // CDN costs
  if (settings.cdnPlan === "pro") {
    otherCost += 20
  } else if (settings.cdnPlan === "enterprise") {
    otherCost += 200
  }

  // Hardware costs
  if (settings.macMiniNeeded) {
    otherCost += 50 // Amortized cost per month
  }

  if (settings.networkSwitchNeeded) {
    otherCost += 20 // Amortized cost per month
  }

  if (settings.rackHostingLocation === "colo") {
    otherCost += settings.rackCost * 2 // Assuming 2U of rack space
  }

  // Analytics costs
  if (settings.viewerAnalytics === "mux-data") {
    otherCost += 50
  } else if (settings.viewerAnalytics === "cf-analytics") {
    otherCost += 20
  } else if (settings.viewerAnalytics === "self-host-grafana") {
    otherCost += 10
  }

  if (settings.siteAnalytics === "plausible") {
    otherCost += 9
  }

  return {
    encoding: Math.round(encodingCost * 100) / 100,
    storage: Math.round(storageCost * 100) / 100,
    delivery: Math.round(deliveryCost * 100) / 100,
    other: Math.round(otherCost * 100) / 100,
  }
}
