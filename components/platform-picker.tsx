"use client"

import { motion } from "framer-motion"
import { AlertCircle, ArrowRight } from "lucide-react"
import { useEffect } from "react"
import type { Platform, SettingsState } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PlatformPickerProps {
  platform: Platform
  onChange: (platform: Platform) => void
  settings?: SettingsState
  updateSettings?: (settings: Partial<SettingsState>) => void
}

export function PlatformPicker({ platform, onChange, settings, updateSettings }: PlatformPickerProps) {
  // Debug: Log the platform value when it changes
  useEffect(() => {
    console.log("Selected platform:", platform)
  }, [platform])

  const platforms: { id: Platform; label: string }[] = [
    { id: "mux", label: "Mux" },
    { id: "cloudflare", label: "Cloudflare Stream" },
    { id: "self-hosted", label: "Self-Hosted" },
    { id: "hybrid", label: "Hybrid" },
  ]

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 rounded-xl blur-xl opacity-50 -z-10" />

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-lg font-semibold mb-4">Choose Your Platform</h2>
        {/* Debug: Display the current platform value */}
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Current selection: <span className="font-bold">{platform || "none"}</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            onClick={() => onChange("mux")}
            className={cn(
              "p-4 rounded-lg cursor-pointer transition-all",
              platform === "mux"
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
            onClick={() => onChange("cloudflare")}
            className={cn(
              "p-4 rounded-lg cursor-pointer transition-all",
              platform === "cloudflare"
                ? "border-2 border-purple-500 bg-purple-100 dark:bg-purple-900/30"
                : "border border-purple-100 dark:border-purple-900/30 bg-purple-50/50 dark:bg-purple-950/10 hover:border-purple-200 dark:hover:border-purple-800/50",
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <h3 className="text-sm font-medium text-purple-700 dark:text-purple-400">Cloudflare Stream</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Managed service with free encoding, global CDN, and $0.005/min storage. Ideal for cost-effective delivery
              at scale.
            </p>
          </motion.div>

          <motion.div
            onClick={() => onChange("self-hosted")}
            className={cn(
              "p-4 rounded-lg cursor-pointer transition-all",
              platform === "self-hosted"
                ? "border-2 border-amber-500 bg-amber-100 dark:bg-amber-900/30"
                : "border border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/10 hover:border-amber-200 dark:hover:border-amber-800/50",
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <h3 className="text-sm font-medium text-amber-700 dark:text-amber-400">Self-Hosted</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Complete control using MediaMTX on Mac Mini. Standard 1GbE interface limits direct streaming to ~15-20
              concurrent viewers without a CDN.
            </p>
            <div className="mt-2 text-xs border-t border-amber-200 dark:border-amber-900/30 pt-2">
              <span className="font-medium">Network options:</span>
              <ul className="list-disc pl-4 mt-1 space-y-1">
                <li>
                  <span className="font-medium">10GbE:</span> Supports ~150-200 viewers, requires compatible NIC
                  (~$200-400) and switch infrastructure.
                </li>
                <li>
                  <span className="font-medium">100GbE:</span> Supports 1500+ viewers, but requires expensive QSFP+
                  transceivers, compatible switches, and specialized server hardware (significant cost increase).
                </li>
                <li>
                  <span className="font-medium">CDN:</span> Most cost-effective solution for scaling, offloads bandwidth
                  requirements from origin server.
                </li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            onClick={() => onChange("hybrid")}
            className={cn(
              "p-4 rounded-lg cursor-pointer transition-all",
              platform === "hybrid"
                ? "border-2 border-pink-500 bg-pink-100 dark:bg-pink-900/30"
                : "border border-pink-100 dark:border-pink-900/30 bg-pink-50/50 dark:bg-pink-950/10 hover:border-pink-200 dark:hover:border-pink-800/50",
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <h3 className="text-sm font-medium text-pink-700 dark:text-pink-400">Hybrid</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Combines self-hosted ingest/encoding with cloud delivery. Balances control and scalability with moderate
              complexity.
            </p>
            <div className="mt-2 text-xs border-t border-pink-200 dark:border-pink-900/30 pt-2">
              <span className="font-medium">Hybrid architecture:</span>
              <ul className="list-disc pl-4 mt-1 space-y-1">
                <li>
                  <span className="font-medium">Local control:</span> Maintain on-premises ingest and initial encoding
                  for low-latency and quality control.
                </li>
                <li>
                  <span className="font-medium">Cloud delivery:</span> Push encoded streams to CDN for global
                  distribution without bandwidth limitations.
                </li>
                <li>
                  <span className="font-medium">Cost efficiency:</span> Reduces egress costs compared to pure
                  self-hosted while maintaining control over critical components.
                </li>
                <li>
                  <span className="font-medium">Redundancy:</span> Cloud provider serves as backup if local
                  infrastructure experiences issues.
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        {(platform === "self-hosted" || platform === "hybrid") && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700"
          >
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-800 rounded-full">
                  <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {platform === "hybrid" ? "Hybrid Configuration Available" : "Hardware Configuration Available"}
                  </h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {platform === "hybrid"
                      ? "Your hybrid infrastructure settings, including both local hardware and cloud provider options, are available in the panel on the right side of the screen."
                      : "Your hardware settings and recommendations are available in the panel on the right side of the screen."}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 lg:hidden">
              <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/30">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-xs text-amber-700 dark:text-amber-300">
                  On mobile devices, scroll down to find the infrastructure configuration panel below.
                </AlertDescription>
              </Alert>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
