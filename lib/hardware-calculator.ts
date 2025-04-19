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

// Update the calculateHardwareRequirements function to provide more accurate recommendations
// based on the number of live channels, VOD library size, and platform type

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
  }

  // Your existing calculation logic...
  // Base requirements
  let cpuCores = 2
  let memoryGB = 4
  let storageGB = 100
  let bandwidthMbps = 500

  // Calculate based on live channels
  if (settings.liveChannels && settings.liveChannels.length > 0) {
    const totalViewers = settings.liveChannels.reduce((sum, channel) => sum + channel.concurrentViewers, 0)
    const totalBitrate = settings.liveChannels.reduce((sum, channel) => sum + channel.bitrateMbps, 0)

    // CPU: 1 core per 500 concurrent viewers, minimum 2
    cpuCores = Math.max(2, Math.ceil(totalViewers / 500))

    // Memory: 2GB base + 1GB per 1000 viewers
    memoryGB = Math.max(4, 2 + Math.ceil(totalViewers / 1000) * 2)

    // Bandwidth: Sum of all channel bitrates * viewers * safety factor
    bandwidthMbps = Math.max(500, Math.ceil(totalBitrate * Math.sqrt(totalViewers) * 1.5))
  }

  // Calculate based on VOD library
  if (settings.vodLibrary && settings.vodLibrary.items > 0) {
    // Storage: 1GB per minute of content at HD quality
    const additionalStorage = settings.vodLibrary.items * settings.vodLibrary.avgDurationMin * 0.1
    storageGB = Math.max(100, Math.ceil(additionalStorage))

    // Add more CPU and memory for VOD transcoding
    cpuCores += Math.ceil(settings.vodLibrary.items / 100)
    memoryGB += Math.ceil(settings.vodLibrary.items / 50)
  }

  // Platform-specific adjustments
  if (settings.platformType === "self-hosted") {
    // Self-hosted needs more resources
    cpuCores = Math.ceil(cpuCores * 1.5)
    memoryGB = Math.ceil(memoryGB * 1.5)
    storageGB = Math.ceil(storageGB * 2)
  } else if (settings.platformType === "hybrid") {
    // Hybrid needs moderate resources
    cpuCores = Math.ceil(cpuCores * 1.2)
    memoryGB = Math.ceil(memoryGB * 1.2)
  }

  // Round to reasonable increments
  cpuCores = Math.ceil(cpuCores / 2) * 2 // Round to even numbers
  memoryGB = Math.ceil(memoryGB / 2) * 2 // Round to even numbers
  storageGB = Math.ceil(storageGB / 50) * 50 // Round to nearest 50GB
  bandwidthMbps = Math.ceil(bandwidthMbps / 100) * 100 // Round to nearest 100Mbps

  const calculatedCpuCores = cpuCores
  const calculatedMemoryGB = memoryGB
  const calculatedStorageGB = storageGB
  const calculatedNetworkMbps = bandwidthMbps
  const calculatedMaxViewers = 50 // Placeholder, needs actual calculation
  const calculatedRecommendedHardware = "Standard Server" // Placeholder, needs actual logic
  const calculatedEstimatedCost = 1299 // Placeholder, needs actual logic

  // Ensure we always return valid values
  return {
    cpuCores: Math.max(1, calculatedCpuCores || defaultRequirements.cpuCores),
    memoryGB: Math.max(1, calculatedMemoryGB || defaultRequirements.memoryGB),
    storageGB: Math.max(10, calculatedStorageGB || defaultRequirements.storageGB),
    networkMbps: Math.max(10, calculatedNetworkMbps || defaultRequirements.networkMbps),
    maxViewers: Math.max(1, calculatedMaxViewers || defaultRequirements.maxViewers),
    recommendedHardware: calculatedRecommendedHardware || defaultRequirements.recommendedHardware,
    estimatedCost: Math.max(0, calculatedEstimatedCost || defaultRequirements.estimatedCost),
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
