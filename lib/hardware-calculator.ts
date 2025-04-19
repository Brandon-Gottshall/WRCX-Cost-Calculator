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

// Find the calculateHardwareRequirements function and enhance it with more accurate calculations

export function calculateHardwareRequirements(settings: any) {
  // Default values to prevent undefined
  const defaultRequirements = {
    cpuCores: 4,
    memoryGB: 8,
    storageGB: 500,
    networkMbps: 100,
    maxViewers: 50,
    recommendedHardware: "Standard Server",
    estimatedCost: 1299,
    isAvailable: true,
  }

  // Base requirements
  const initialCpuCores = 2
  let memoryGB = 4
  let storageGB = 100
  let bandwidthMbps = 500

  // Calculate based on channels and viewers
  const channelCount = settings.channelCount || 1
  const peakViewers = settings.peakConcurrentViewers || 100
  const bitratePerViewer = settings.avgBitrateOverride || 3 // Mbps

  // Calculate CPU requirements based on encoding preset and channel count
  let cpuCores = 2 // Base requirement
  if (settings.streamEnabled) {
    const encodingPresetMultiplier =
      settings.encodingPreset === "4k-tri-ladder"
        ? 4
        : settings.encodingPreset === "4k-single"
          ? 2.5
          : settings.encodingPreset === "1080p-tri-ladder"
            ? 2
            : settings.encodingPreset === "720p-tri-ladder"
              ? 1.5
              : settings.encodingPreset === "480p-tri-ladder"
                ? 1.2
                : settings.encodingPreset === "1080p-single"
                  ? 1.2
                  : settings.encodingPreset === "720p-single"
                    ? 1
                    : settings.encodingPreset === "480p-single"
                      ? 0.8
                      : 1.5

    cpuCores += (settings.channelCount || 1) * encodingPresetMultiplier
  }

  // Memory: Base + 2GB per channel + 1GB per 200 concurrent viewers
  memoryGB = 4 + channelCount * 2 + Math.ceil(peakViewers / 200)

  // Storage: Base + VOD storage based on retention
  if (settings.vodEnabled) {
    const hoursPerDay = settings.hoursPerDayArchived || 8
    const retentionDays = settings.retentionWindow || 30
    const storagePerHour = 2 // GB per hour of HD content

    const vodStorageGB = hoursPerDay * retentionDays * storagePerHour
    storageGB = 100 + vodStorageGB
  }

  // Network: Based on concurrent viewers and bitrate
  bandwidthMbps = peakViewers * bitratePerViewer

  // Add safety margin
  cpuCores = Math.ceil(cpuCores * 1.2) // 20% overhead
  memoryGB = Math.ceil(memoryGB * 1.2) // 20% overhead
  bandwidthMbps = Math.ceil(bandwidthMbps * 1.2) // 20% overhead

  // Round to reasonable increments
  cpuCores = Math.ceil(cpuCores / 2) * 2 // Round to even numbers
  memoryGB = Math.ceil(memoryGB / 4) * 4 // Round to multiples of 4
  storageGB = Math.ceil(storageGB / 50) * 50 // Round to nearest 50GB
  bandwidthMbps = Math.ceil(bandwidthMbps / 100) * 100 // Round to nearest 100Mbps

  // Determine recommended hardware based on requirements
  let recommendedHardware = "Mac Mini (M2 Pro)"
  let estimatedCost = 1299

  if (cpuCores > 12 || memoryGB > 32) {
    recommendedHardware = "Mac Studio (M2 Ultra)"
    estimatedCost = 3999
  } else if (cpuCores > 8 || memoryGB > 16) {
    recommendedHardware = "Mac Studio (M2 Max)"
    estimatedCost = 2999
  } else if (cpuCores > 4 || memoryGB > 8) {
    recommendedHardware = "Mac Mini (M2 Pro, 32GB)"
    estimatedCost = 1899
  }

  // Calculate max viewers based on network interface
  const maxViewers = Math.floor((settings.networkInterface === "10gbe" ? 10000 : 1000) / bitratePerViewer)

  // Ensure we always return valid values
  return {
    cpuCores: Math.max(1, cpuCores || defaultRequirements.cpuCores),
    memoryGB: Math.max(1, memoryGB || defaultRequirements.memoryGB),
    storageGB: Math.max(10, storageGB || defaultRequirements.storageGB),
    networkMbps: Math.max(10, bandwidthMbps || defaultRequirements.networkMbps),
    maxViewers: Math.max(1, maxViewers || defaultRequirements.maxViewers),
    recommendedHardware: recommendedHardware || defaultRequirements.recommendedHardware,
    estimatedCost: Math.max(0, estimatedCost || defaultRequirements.estimatedCost),
    isAvailable: true,
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
