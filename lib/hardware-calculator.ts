import type { SettingsState } from "./types"

export interface HardwareRequirements {
  cpuCores: number
  memoryGB: number
  storageGB: number
  networkMbps: number
  recommendedHardware: string
  estimatedCost: number
  isAvailable: boolean
  maxViewers: number // Added to show max viewer capacity
}

// Constants for hardware requirements calculation
const BASE_REQUIREMENTS = {
  NEXT_SERVER: {
    cpuCores: 2,
    memoryGB: 4,
    storageGB: 50,
    networkMbps: 100,
  },
  ENCODING_PER_CHANNEL: {
    "1080p-tri-ladder": { cpuCores: 4, memoryGB: 4, storageGB: 0, networkMbps: 5 },
    "720p-tri-ladder": { cpuCores: 3, memoryGB: 3, storageGB: 0, networkMbps: 3 },
    "1080p-single": { cpuCores: 2, memoryGB: 2, storageGB: 0, networkMbps: 5 },
    "4k-tri-ladder": { cpuCores: 8, memoryGB: 8, storageGB: 0, networkMbps: 15 },
    "4k-single": { cpuCores: 4, memoryGB: 4, storageGB: 0, networkMbps: 15 },
  },
  STORAGE_PER_HOUR: {
    HD: 2, // GB per hour of HD content
    UHD: 6, // GB per hour of UHD content
  },
  NETWORK_CAPACITY: {
    "1gbe": 1000, // 1 Gbps = 1000 Mbps
    "10gbe": 10000, // 10 Gbps = 10000 Mbps
  },
  // Viewers per channel based on network interface
  MAX_VIEWERS_PER_CHANNEL: {
    "1gbe": {
      "1080p-tri-ladder": 20,
      "720p-tri-ladder": 30,
      "1080p-single": 20,
      "4k-tri-ladder": 6,
      "4k-single": 6,
    },
    "10gbe": {
      "1080p-tri-ladder": 200,
      "720p-tri-ladder": 300,
      "1080p-single": 200,
      "4k-tri-ladder": 60,
      "4k-single": 60,
    },
  },
}

const HARDWARE_OPTIONS = [
  {
    name: "Mac Mini (M2 Pro)",
    cpuCores: 10,
    memoryGB: 16,
    storageGB: 512,
    networkMbps: 1000, // 1GbE
    cost: 1299,
    isAppleSilicon: true,
  },
  {
    name: "Mac Mini (M2 Pro, 32GB)",
    cpuCores: 10,
    memoryGB: 32,
    storageGB: 512,
    networkMbps: 1000, // 1GbE
    cost: 1899,
    isAppleSilicon: true,
  },
  {
    name: "Mac Studio (M2 Max)",
    cpuCores: 12,
    memoryGB: 32,
    storageGB: 1024,
    networkMbps: 10000, // 10GbE
    cost: 2999,
    isAppleSilicon: true,
  },
  {
    name: "Mac Studio (M2 Ultra)",
    cpuCores: 24,
    memoryGB: 64,
    storageGB: 1024,
    networkMbps: 10000, // 10GbE
    cost: 3999,
    isAppleSilicon: true,
  },
  {
    name: "1U Rack Server (Intel)",
    cpuCores: 16,
    memoryGB: 64,
    storageGB: 2048,
    networkMbps: 10000, // 10GbE
    cost: 3500,
    isAppleSilicon: false,
  },
  {
    name: "2U Rack Server (Intel)",
    cpuCores: 32,
    memoryGB: 128,
    storageGB: 4096,
    networkMbps: 10000, // 10GbE
    cost: 5500,
    isAppleSilicon: false,
  },
]

export function calculateHardwareRequirements(settings: SettingsState): HardwareRequirements {
  const requirements = {
    cpuCores: 0,
    memoryGB: 0,
    storageGB: 0,
    networkMbps: 0,
    maxViewers: 0,
  }

  // Always include Next.js server requirements
  requirements.cpuCores += BASE_REQUIREMENTS.NEXT_SERVER.cpuCores
  requirements.memoryGB += BASE_REQUIREMENTS.NEXT_SERVER.memoryGB
  requirements.storageGB += BASE_REQUIREMENTS.NEXT_SERVER.storageGB
  requirements.networkMbps += BASE_REQUIREMENTS.NEXT_SERVER.networkMbps

  // Add requirements for self-hosted or hybrid streaming
  if (settings.platform === "self-hosted" || settings.platform === "hybrid") {
    const encodingMultiplier = settings.platform === "hybrid" ? 0.7 : 1 // Hybrid offloads some encoding
    const encodingPresetReqs =
      BASE_REQUIREMENTS.ENCODING_PER_CHANNEL[
        settings.encodingPreset as keyof typeof BASE_REQUIREMENTS.ENCODING_PER_CHANNEL
      ]

    // Determine network interface capacity
    const networkInterface = settings.networkInterface || "1gbe"
    const networkCapacity =
      BASE_REQUIREMENTS.NETWORK_CAPACITY[networkInterface as keyof typeof BASE_REQUIREMENTS.NETWORK_CAPACITY]

    // Get max viewers per channel based on network interface and encoding preset
    const maxViewersPerChannel =
      BASE_REQUIREMENTS.MAX_VIEWERS_PER_CHANNEL[
        networkInterface as keyof typeof BASE_REQUIREMENTS.MAX_VIEWERS_PER_CHANNEL
      ]?.[settings.encodingPreset as keyof (typeof BASE_REQUIREMENTS.MAX_VIEWERS_PER_CHANNEL)["1gbe"]] || 20 // Default to 20 if not found

    if (encodingPresetReqs) {
      requirements.cpuCores += Math.ceil(encodingPresetReqs.cpuCores * settings.channelCount * encodingMultiplier)
      requirements.memoryGB += Math.ceil(encodingPresetReqs.memoryGB * settings.channelCount * encodingMultiplier)

      // Calculate network requirements based on the selected network interface
      const viewersPerChannel = Math.min(settings.peakConcurrentViewers, maxViewersPerChannel)
      requirements.networkMbps += Math.ceil(
        encodingPresetReqs.networkMbps * viewersPerChannel * settings.channelCount * encodingMultiplier,
      )

      // Calculate max viewers based on network capacity
      const totalBandwidthPerViewer = encodingPresetReqs.networkMbps
      const maxViewersTotal = Math.floor(
        (networkCapacity - BASE_REQUIREMENTS.NEXT_SERVER.networkMbps) / totalBandwidthPerViewer,
      )
      requirements.maxViewers = Math.floor(maxViewersTotal / settings.channelCount)
    }

    // Storage for VOD content if enabled
    if (settings.vodEnabled) {
      const isUHD = settings.encodingPreset.includes("4k")
      const storagePerHour = isUHD ? BASE_REQUIREMENTS.STORAGE_PER_HOUR.UHD : BASE_REQUIREMENTS.STORAGE_PER_HOUR.HD
      requirements.storageGB += Math.ceil(
        storagePerHour * settings.hoursPerDayArchived * settings.retentionWindow * settings.channelCount,
      )
    }

    // Add storage for legacy content if enabled
    if (settings.legacyEnabled) {
      const isUHD = settings.encodingPreset.includes("4k")
      const storagePerHour = isUHD ? BASE_REQUIREMENTS.STORAGE_PER_HOUR.UHD : BASE_REQUIREMENTS.STORAGE_PER_HOUR.HD
      requirements.storageGB += Math.ceil(storagePerHour * settings.backCatalogHours)
    }
  }

  // Find the recommended hardware based on requirements
  const recommendedHardware = findRecommendedHardware(requirements, settings)

  return {
    ...requirements,
    recommendedHardware: recommendedHardware.name,
    estimatedCost: recommendedHardware.cost,
    isAvailable:
      settings.serverType ===
      recommendedHardware.name
        .toLowerCase()
        .replace(/\s+$.+$/, "")
        .replace(/\s+/g, "-"),
  }
}

function findRecommendedHardware(
  requirements: Omit<HardwareRequirements, "recommendedHardware" | "estimatedCost" | "isAvailable">,
  settings: SettingsState,
) {
  // Prefer Apple Silicon for transcoding if that's the selected engine
  const preferAppleSilicon = settings.transcodingEngine === "hardware"

  // Filter hardware options that meet the minimum requirements
  const viableOptions = HARDWARE_OPTIONS.filter(
    (option) =>
      option.cpuCores >= requirements.cpuCores &&
      option.memoryGB >= requirements.memoryGB &&
      option.storageGB >= requirements.storageGB &&
      option.networkMbps >= requirements.networkMbps &&
      (preferAppleSilicon ? option.isAppleSilicon : true),
  )

  if (viableOptions.length === 0) {
    // If no options meet all requirements, return the most powerful option
    return HARDWARE_OPTIONS.reduce((prev, current) => {
      const prevScore = prev.cpuCores + prev.memoryGB + prev.storageGB / 100 + prev.networkMbps / 1000
      const currentScore = current.cpuCores + current.memoryGB + current.storageGB / 100 + current.networkMbps / 1000
      return currentScore > prevScore ? current : prev
    })
  }

  // Return the most cost-effective option that meets requirements
  return viableOptions.reduce((prev, current) => (current.cost < prev.cost ? current : prev))
}

export function getHardwareOptions() {
  return HARDWARE_OPTIONS.map((option) => ({
    value: option.name
      .toLowerCase()
      .replace(/\s+$.+$/, "")
      .replace(/\s+/g, "-"),
    label: option.name,
    specs: `${option.cpuCores} cores, ${option.memoryGB}GB RAM, ${option.storageGB}GB storage, ${option.networkMbps >= 10000 ? "10GbE" : "1GbE"} network`,
    cost: option.cost,
  }))
}
