import type { SettingsState } from "@/types"
import type { Costs } from "@/types"

const MUX_PRICING = {
  ENCODING: {
    "720p": 0.03,
    "1080p": 0.06,
  },
  STORAGE: 0.0025,
  DELIVERY: 0.0015,
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
  return hoursPerDayArchived * 60 * 24 * retentionWindow
}

// Main cost calculation function
export function calculateCosts(settings: SettingsState): Costs {
  let encodingCost = 0
  let storageCost = 0
  let deliveryCost = 0
  let otherCost = 0

  // Live streaming costs - only calculate if streaming is enabled
  if (settings.streamEnabled !== false) {
    const liveMinutesPerMonth = minutesPerMonth(24) * settings.channelCount

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
      encodingCost += 24 * 30 * SELF_HOSTED_PRICING.COMPUTE["t3.medium"] * settings.channelCount
    } else if (settings.platform === "hybrid") {
      // Hybrid is a mix of self-hosted and cloud
      encodingCost += (liveMinutesPerMonth * 0.0035) / 2
      encodingCost += (24 * 30 * SELF_HOSTED_PRICING.COMPUTE["t3.medium"] * settings.channelCount) / 2
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

    // VOD storage costs - only if streaming is enabled and VOD is enabled
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

  // Video CDN costs for self-hosted/hybrid
  if (
    (settings.platform === "self-hosted" || settings.platform === "hybrid") &&
    settings.videoCdnProvider &&
    settings.videoCdnProvider !== "none"
  ) {
    // Calculate video CDN costs based on delivery volume
    const estimatedGbPerViewer = 0.3 // ~0.3GB per hour per viewer at 1080p
    const viewerHours = settings.peakConcurrentViewers * settings.channelCount * 24 * 30
    const estimatedGbPerMonth = viewerHours * estimatedGbPerViewer

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

    deliveryCost += estimatedGbPerMonth * egressRate

    // Add base costs for premium CDN plans
    if (settings.videoCdnPlan === "premium") {
      otherCost += 50 // Premium tier base cost
    } else if (settings.videoCdnPlan === "enterprise") {
      otherCost += 200 // Enterprise tier base cost
    }
  }

  // Hardware costs
  if (settings.platform === "self-hosted" || settings.platform === "hybrid") {
    if (!settings.hardwareAvailable) {
      // Amortize server cost over 36 months
      otherCost += (settings.serverCost * settings.serverCount) / 36
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
