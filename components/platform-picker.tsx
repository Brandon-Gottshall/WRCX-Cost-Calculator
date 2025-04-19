"use client"

import { motion } from "framer-motion"
import { ArrowRight, Server, Cloud, Network } from "lucide-react"
import { useEffect, useState } from "react"
import type { Platform, SettingsState } from "@/lib/types"
import { cn } from "@/lib/utils"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface PlatformPickerProps {
  platform: Platform
  onChange: (platform: Platform) => void
  settings?: SettingsState
  updateSettings?: (settings: Partial<SettingsState>) => void
}

export function PlatformPicker({ platform, onChange, settings, updateSettings }: PlatformPickerProps) {
  // Derive initial state from props
  const getDeploymentStrategyFromPlatform = (p: Platform) => {
    if (p === "self-hosted") return "on-premises"
    if (p === "hybrid") return "hybrid"
    return "cloud-only"
  }

  const getCloudProviderFromPlatform = (p: Platform) => {
    return p === "cloudflare" ? "cloudflare" : "mux"
  }

  // Track deployment strategy separately from platform
  const [deploymentStrategy, setDeploymentStrategy] = useState<"on-premises" | "hybrid" | "cloud-only">(
    getDeploymentStrategyFromPlatform(platform),
  )

  // For cloud-only, track which cloud provider is selected
  const [cloudProvider, setCloudProvider] = useState<"mux" | "cloudflare">(getCloudProviderFromPlatform(platform))

  // Skip initial render effect
  const [isInitialized, setIsInitialized] = useState(false)

  // Sync local state with props only on initial render and prop changes
  useEffect(() => {
    // Skip the first render to avoid immediate loops
    if (!isInitialized) {
      setIsInitialized(true)
      return
    }

    const newDeploymentStrategy = getDeploymentStrategyFromPlatform(platform)

    // Only update if different to avoid loops
    if (newDeploymentStrategy !== deploymentStrategy) {
      setDeploymentStrategy(newDeploymentStrategy)
    }

    // Only update cloud provider if we're in cloud-only mode
    if (newDeploymentStrategy === "cloud-only") {
      const newCloudProvider = getCloudProviderFromPlatform(platform)
      if (newCloudProvider !== cloudProvider) {
        setCloudProvider(newCloudProvider)
      }
    }
  }, [platform]) // Only depend on platform changes

  // Direct handlers for user interactions - avoid useEffect for these
  const handleDeploymentStrategyChange = (value: string) => {
    const strategy = value as "on-premises" | "hybrid" | "cloud-only"
    setDeploymentStrategy(strategy)

    // Update platform based on strategy - direct call, no useEffect needed
    if (strategy === "on-premises") {
      onChange("self-hosted")
    } else if (strategy === "hybrid") {
      onChange("hybrid")
    } else {
      // For cloud-only, use the current cloudProvider
      onChange(cloudProvider)
    }
  }

  // Handle cloud provider change - direct call, no useEffect needed
  const handleCloudProviderChange = (provider: "mux" | "cloudflare") => {
    setCloudProvider(provider)

    // Only update platform if we're in cloud-only mode
    if (deploymentStrategy === "cloud-only") {
      onChange(provider)
    }
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 rounded-xl blur-xl opacity-50 -z-10" />

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-lg font-semibold mb-4">Choose Your Deployment Strategy</h2>

        <RadioGroup
          value={deploymentStrategy}
          onValueChange={handleDeploymentStrategyChange}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <Label
            htmlFor="on-premises"
            className={cn(
              "flex flex-col p-4 rounded-lg cursor-pointer border transition-all",
              deploymentStrategy === "on-premises"
                ? "border-2 border-amber-500 bg-amber-100 dark:bg-amber-900/30"
                : "border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/10 hover:border-amber-200 dark:hover:border-amber-800/50",
            )}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="on-premises" id="on-premises" className="sr-only" />
              <Server className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <span className="font-medium text-amber-700 dark:text-amber-400">On-Premises</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              Complete control with self-hosted infrastructure. Requires hardware investment and network capacity
              planning.
            </p>
          </Label>

          <Label
            htmlFor="hybrid"
            className={cn(
              "flex flex-col p-4 rounded-lg cursor-pointer border transition-all",
              deploymentStrategy === "hybrid"
                ? "border-2 border-pink-500 bg-pink-100 dark:bg-pink-900/30"
                : "border-pink-100 dark:border-pink-900/30 bg-pink-50/50 dark:bg-pink-950/10 hover:border-pink-200 dark:hover:border-pink-800/50",
            )}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hybrid" id="hybrid" className="sr-only" />
              <Network className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              <span className="font-medium text-pink-700 dark:text-pink-400">Hybrid</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              On-premises ingest and encoding with cloud delivery. Balances control and scalability.
            </p>
          </Label>

          <Label
            htmlFor="cloud-only"
            className={cn(
              "flex flex-col p-4 rounded-lg cursor-pointer border transition-all",
              deploymentStrategy === "cloud-only"
                ? "border-2 border-blue-500 bg-blue-100 dark:bg-blue-900/30"
                : "border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/10 hover:border-blue-200 dark:hover:border-blue-800/50",
            )}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cloud-only" id="cloud-only" className="sr-only" />
              <Cloud className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-blue-700 dark:text-blue-400">Cloud-Only</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              Fully managed service with automatic scaling. No hardware to maintain, pay for what you use.
            </p>
          </Label>
        </RadioGroup>

        {/* Conditionally show cloud provider selection */}
        {deploymentStrategy === "cloud-only" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700"
          >
            <h3 className="text-sm font-medium mb-3">Select Cloud Provider</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                onClick={() => handleCloudProviderChange("mux")}
                className={cn(
                  "p-4 rounded-lg cursor-pointer transition-all",
                  cloudProvider === "mux"
                    ? "border-2 border-blue-500 bg-blue-100 dark:bg-blue-900/30"
                    : "border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/10 hover:border-blue-200 dark:hover:border-blue-800/50",
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3 className="text-sm font-medium text-blue-700 dark:text-blue-400">Mux</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Fully managed service with automatic ABR encoding, global CDN, and analytics. Usage-based pricing at
                  $0.040/min for 1080p encoding.
                </p>
              </motion.div>

              <motion.div
                onClick={() => handleCloudProviderChange("cloudflare")}
                className={cn(
                  "p-4 rounded-lg cursor-pointer transition-all",
                  cloudProvider === "cloudflare"
                    ? "border-2 border-purple-500 bg-purple-100 dark:bg-purple-900/30"
                    : "border border-purple-100 dark:border-purple-900/30 bg-purple-50/50 dark:bg-purple-950/10 hover:border-purple-200 dark:hover:border-purple-800/50",
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3 className="text-sm font-medium text-purple-700 dark:text-purple-400">Cloudflare Stream</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Managed service with free encoding, global CDN, and $0.005/min storage. Ideal for cost-effective
                  delivery at scale.
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Infrastructure guidance based on deployment strategy */}
        {(deploymentStrategy === "on-premises" || deploymentStrategy === "hybrid") && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700"
          >
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-800 rounded-full">
                  <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {deploymentStrategy === "hybrid"
                      ? "Hybrid Configuration Available"
                      : "Hardware Configuration Available"}
                  </h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Your infrastructure requirements are calculated automatically based on your viewership and quality
                    settings. Check the "Infrastructure Recommendations" panel{" "}
                    {window.innerWidth >= 1024 ? "in the right sidebar" : "below"}.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
