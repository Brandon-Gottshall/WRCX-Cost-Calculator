"use client"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Platform, SettingsState } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface PlatformPickerProps {
  platform: Platform
  onChange: (platform: Platform) => void
  settings: SettingsState
  updateSettings: (settings: Partial<SettingsState>) => void
}

export function PlatformPicker({ platform, onChange, settings, updateSettings }: PlatformPickerProps) {
  // Animation variants for smooth transitions
  const contentVariants = {
    hidden: { opacity: 0, height: 0, overflow: "hidden" },
    visible: { opacity: 1, height: "auto", overflow: "visible" },
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <CardContent className="pt-6 px-4 pb-4">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Deployment Strategy</h2>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onChange("self-hosted")}
                className={`px-4 py-2 rounded-md text-center transition-colors ${
                  platform === "self-hosted"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                }`}
              >
                On-Premises
              </button>
              <button
                onClick={() => onChange("hybrid")}
                className={`px-4 py-2 rounded-md text-center transition-colors ${
                  platform === "hybrid"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                }`}
              >
                Hybrid
              </button>
              <button
                onClick={() => onChange("mux")}
                className={`px-4 py-2 rounded-md text-center transition-colors ${
                  platform === "mux" || platform === "cloudflare"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                }`}
              >
                Cloud-Only
              </button>
            </div>
          </div>

          {/* Conditional rendering based on platform selection */}
          <div className="space-y-6">
            {/* Cloud Provider dropdown - shown for Cloud-Only and Hybrid */}
            <AnimatePresence>
              {(platform === "mux" || platform === "cloudflare" || platform === "hybrid") && (
                <motion.div
                  key="cloud-provider"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={contentVariants}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <Label htmlFor="cloudProvider">Cloud Provider</Label>
                  <Select
                    value={platform === "hybrid" ? settings.cloudProvider || "mux" : platform}
                    onValueChange={(value) => {
                      if (platform === "hybrid") {
                        updateSettings({ cloudProvider: value })
                      } else {
                        onChange(value as Platform)
                      }
                    }}
                  >
                    <SelectTrigger id="cloudProvider">
                      <SelectValue placeholder="Select cloud provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mux">Mux</SelectItem>
                      <SelectItem value="cloudflare">Cloudflare Stream</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Select your preferred cloud streaming provider
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Local-encoding fields - shown for On-Premises and Hybrid */}
            <AnimatePresence>
              {(platform === "self-hosted" || platform === "hybrid") && (
                <motion.div
                  key="local-encoding"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={contentVariants}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="serverCount">Server Count</Label>
                      <Input
                        id="serverCount"
                        type="number"
                        min={1}
                        value={settings.serverCount || 1}
                        onChange={(e) => updateSettings({ serverCount: Number.parseInt(e.target.value) || 1 })}
                      />
                      <p className="text-sm text-slate-500 dark:text-slate-400">Number of encoding servers</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bandwidthCapacity">Available Bandwidth (Mbps)</Label>
                      <Input
                        id="bandwidthCapacity"
                        type="number"
                        min={0}
                        value={settings.bandwidthCapacity || 1000}
                        onChange={(e) => updateSettings({ bandwidthCapacity: Number.parseInt(e.target.value) || 0 })}
                      />
                      <p className="text-sm text-slate-500 dark:text-slate-400">Available outbound bandwidth</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="encodingPreset">Encoding Resolution</Label>
                    <Select
                      value={settings.encodingPreset}
                      onValueChange={(value) => updateSettings({ encodingPreset: value })}
                    >
                      <SelectTrigger id="encodingPreset">
                        <SelectValue placeholder="Select encoding preset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="480p-single">480p Single (1.5 Mbps × 1)</SelectItem>
                        <SelectItem value="480p-tri-ladder">480p Tri-ladder (1.5 Mbps × 2.8)</SelectItem>
                        <SelectItem value="720p-single">720p Single (3 Mbps × 1)</SelectItem>
                        <SelectItem value="720p-tri-ladder">720p Tri-ladder (3 Mbps × 2.8)</SelectItem>
                        <SelectItem value="1080p-single">1080p Single (5 Mbps × 1)</SelectItem>
                        <SelectItem value="1080p-tri-ladder">1080p Tri-ladder (5 Mbps × 2.8)</SelectItem>
                        <SelectItem value="4k-single">4K Single (15 Mbps × 1)</SelectItem>
                        <SelectItem value="4k-tri-ladder">4K Tri-ladder (15 Mbps × 2.8)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Quality and bitrate configuration</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hardware recommendations info */}
          <AnimatePresence>
            {(platform === "self-hosted" || platform === "hybrid") && (
              <motion.div
                key="hardware-info"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={contentVariants}
                transition={{ duration: 0.3 }}
              >
                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/30">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-xs text-blue-700 dark:text-blue-300">
                    Check the hardware recommendations panel for server specifications based on your configuration.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}
