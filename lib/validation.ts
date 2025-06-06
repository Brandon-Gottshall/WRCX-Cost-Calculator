import type { SettingsState } from "@/types"

// Define validation rules for each field
export interface ValidationRule {
  field: keyof SettingsState
  min?: number
  max?: number
  integer?: boolean
  message: string
  severity: "warning" | "error"
  condition?: (settings: SettingsState) => boolean
}

// Define validation rules
export const validationRules: ValidationRule[] = [
  // Stream (Live)
  {
    field: "channelCount",
    min: 1,
    max: 100,
    integer: true,
    message: "Channel count should be between 1 and 100",
    severity: "error",
    condition: (settings) => settings.streamEnabled !== false,
  },
  {
    field: "peakConcurrentViewers",
    min: 0,
    max: 100000,
    integer: true,
    message: "Peak concurrent viewers should be between 0 and 100,000",
    severity: "error",
    condition: (settings) => settings.streamEnabled !== false,
  },
  {
    field: "peakConcurrentViewers",
    min: 1000,
    message: "High viewer counts may require additional infrastructure planning",
    severity: "warning",
    condition: (settings) => settings.streamEnabled !== false && settings.platform === "self-hosted",
  },

  // Live → VOD
  {
    field: "hoursPerDayArchived",
    min: 0,
    max: 24,
    message: "Hours per day archived should be between 0 and 24",
    severity: "error",
    condition: (settings) => settings.vodEnabled && settings.streamEnabled !== false,
  },
  {
    field: "retentionWindow",
    min: 1,
    max: 365 * 5, // 5 years
    integer: true,
    message: "Retention window should be between 1 and 1825 days",
    severity: "error",
    condition: (settings) => settings.vodEnabled && settings.streamEnabled !== false,
  },
  {
    field: "peakConcurrentVodViewers",
    min: 0,
    max: 100000,
    integer: true,
    message: "Peak concurrent VOD viewers should be between 0 and 100,000",
    severity: "error",
    condition: (settings) => settings.vodEnabled && settings.streamEnabled !== false,
  },

  // Legacy VOD
  {
    field: "backCatalogHours",
    min: 0,
    max: 1000000,
    message: "Back-catalog hours should be a positive number",
    severity: "error",
    condition: (settings) => settings.legacyEnabled,
  },
  {
    field: "backCatalogHours",
    min: 10000,
    message: "Large back-catalog may result in significant storage costs",
    severity: "warning",
    condition: (settings) => settings.legacyEnabled,
  },

  // Hardware & Hosting
  {
    field: "serverCount",
    min: 1,
    max: 100,
    integer: true,
    message: "Server count should be between 1 and 100",
    severity: "error",
    condition: (settings) => settings.platform === "self-hosted" || settings.platform === "hybrid",
  },
  {
    field: "serverCost",
    min: 0,
    max: 100000,
    message: "Server cost should be between $0 and $100,000",
    severity: "error",
    condition: (settings) =>
      (settings.platform === "self-hosted" || settings.platform === "hybrid") && !settings.hardwareAvailable,
  },
  {
    field: "serverCost",
    min: 1,
    message: "Hardware costs must be entered for self-hosted or hybrid platforms",
    severity: "error",
    condition: (settings) =>
      (settings.platform === "self-hosted" || settings.platform === "hybrid") &&
      settings.hardwareMode === "own" &&
      !settings.hardwareAvailable,
  },
  {
    field: "monthlyRentalCost",
    min: 1,
    message: "Monthly rental cost must be entered for self-hosted or hybrid platforms",
    severity: "error",
    condition: (settings) =>
      (settings.platform === "self-hosted" || settings.platform === "hybrid") && settings.hardwareMode === "rent",
  },
  {
    field: "internetColoMonthlyCost",
    min: 1,
    message: "Internet/colocation costs must be entered for self-hosted or hybrid platforms",
    severity: "error",
    condition: (settings) => settings.platform === "self-hosted" || settings.platform === "hybrid",
  },
  {
    field: "rackCost",
    min: 0,
    max: 10000,
    message: "Rack cost should be between $0 and $10,000",
    severity: "error",
    condition: (settings) => settings.rackHostingLocation === "colo",
  },

  // Hardware & Hosting Opex
  {
    field: "capEx",
    min: 0,
    max: 10000,
    message: "Cap-ex should be between $0 and $10,000",
    severity: "error",
    condition: (settings) =>
      (settings.platform === "self-hosted" || settings.platform === "hybrid") && settings.hardwareMode === "own",
  },
  {
    field: "amortMonths",
    min: 1,
    max: 120,
    integer: true,
    message: "Amortisation months should be between 1 and 120",
    severity: "error",
    condition: (settings) =>
      (settings.platform === "self-hosted" || settings.platform === "hybrid") && settings.hardwareMode === "own",
  },
  {
    field: "wattage",
    min: 0,
    max: 1000,
    message: "Wattage should be between 0 and 1000",
    severity: "error",
    condition: (settings) => settings.platform === "self-hosted" || settings.platform === "hybrid",
  },
  {
    field: "internetOpexMo",
    min: 0,
    max: 2000,
    message: "Internet monthly cost should be between $0 and $2,000",
    severity: "error",
    condition: (settings) => settings.platform === "self-hosted" || settings.platform === "hybrid",
  },

  // CDN
  {
    field: "cdnEgressRate",
    min: 0,
    max: 1,
    message: "CDN egress rate should be between $0 and $1 per GB",
    severity: "error",
    condition: (settings) => settings.cdnPlan === "amazon-cloudfront" || settings.cdnPlan === "google-cloud-cdn",
  },
  {
    field: "videoCdnEgressRate",
    min: 0,
    max: 1,
    message: "Video CDN egress rate should be between $0 and $1 per GB",
    severity: "error",
    condition: (settings) =>
      (settings.platform === "self-hosted" || settings.platform === "hybrid") &&
      settings.videoCdnProvider &&
      settings.videoCdnProvider !== "none",
  },
  {
    field: "originEgressCost",
    min: 0,
    max: 1,
    message: "Origin egress cost should be between $0 and $1 per GB",
    severity: "error",
    condition: (settings) => settings.platform === "hybrid",
  },

  // Email
  {
    field: "monthlyEmailVolume",
    min: 0,
    max: 10000000,
    integer: true,
    message: "Monthly email volume should be between 0 and 10,000,000",
    severity: "error",
    condition: (settings) => settings.outboundEmail,
  },

  // Bandwidth
  {
    field: "bandwidthCapacity",
    min: 0,
    max: 100000,
    message: "Bandwidth capacity should be between 0 and 100,000 Mbps",
    severity: "error",
    condition: (settings) => settings.platform === "self-hosted" || settings.platform === "hybrid",
  },
  {
    field: "bandwidthCapacity",
    min: 1000,
    message: "Bandwidth may be insufficient for your viewer count",
    severity: "warning",
    condition: (settings) => {
      if (settings.platform !== "self-hosted" && settings.platform !== "hybrid") return false
      const estimatedBandwidth = settings.peakConcurrentViewers * settings.channelCount * 5 // ~5 Mbps per viewer
      return settings.bandwidthCapacity < estimatedBandwidth
    },
  },

  // Channel Statistics Validation
  // These rules will be applied to each channel in the channels array
  // We'll need to handle this separately in the validation function
]

// Validation result interface
export interface ValidationResult {
  field: keyof SettingsState
  message: string
  severity: "warning" | "error"
  channelId?: string // For channel-specific validations
}

// Validate settings against rules
export function validateSettings(settings: SettingsState): ValidationResult[] {
  const results: ValidationResult[] = []

  // Standard field validation
  for (const rule of validationRules) {
    // Skip rule if condition is not met
    if (rule.condition && !rule.condition(settings)) continue

    const value = settings[rule.field] as number

    // Skip if value is undefined or null
    if (value === undefined || value === null) continue

    let isValid = true

    // Check min constraint
    if (rule.min !== undefined && value < rule.min) {
      isValid = false
    }

    // Check max constraint
    if (rule.max !== undefined && value > rule.max) {
      isValid = false
    }

    // Check integer constraint
    if (rule.integer && !Number.isInteger(value)) {
      isValid = false
    }

    // Add validation result if not valid
    if (!isValid) {
      results.push({
        field: rule.field,
        message: rule.message,
        severity: rule.severity,
      })
    }
  }

  // Channel-specific validations
  if (settings.channels) {
    for (const channel of settings.channels) {
      // Validate liveHours
      if (channel.liveHours < 0 || channel.liveHours > 24) {
        results.push({
          field: "channels" as keyof SettingsState,
          message: `Channel "${channel.name}": Live hours should be between 0 and 24`,
          severity: "error",
          channelId: channel.id,
        })
      }

      // Validate fillRate
      if (channel.fillRate !== undefined && (channel.fillRate < 0 || channel.fillRate > 100)) {
        results.push({
          field: "channels" as keyof SettingsState,
          message: `Channel "${channel.name}": Fill rate should be between 0 and 100%`,
          severity: "error",
          channelId: channel.id,
        })
      }

      // Validate vodUniques
      if (channel.vodUniques < 0) {
        results.push({
          field: "channels" as keyof SettingsState,
          message: `Channel "${channel.name}": VOD viewers should be a positive number`,
          severity: "error",
          channelId: channel.id,
        })
      }

      // Validate vodWatchMin
      if (channel.vodWatchMin < 0) {
        results.push({
          field: "channels" as keyof SettingsState,
          message: `Channel "${channel.name}": VOD watch time should be a positive number`,
          severity: "error",
          channelId: channel.id,
        })
      }
    }
  }

  return results
}

// Get validation result for a specific field
export function getFieldValidation(
  field: keyof SettingsState,
  validationResults: ValidationResult[],
  channelId?: string,
): ValidationResult | undefined {
  if (channelId) {
    return validationResults.find((result) => result.field === field && result.channelId === channelId)
  }
  return validationResults.find((result) => result.field === field)
}

// Check if settings have any errors (not just warnings)
export function hasValidationErrors(validationResults: ValidationResult[]): boolean {
  return validationResults.some((result) => result.severity === "error")
}
