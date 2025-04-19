"use client"

import { motion } from "framer-motion"
import { AlertCircle } from "lucide-react"
import type { Platform, SettingsState } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

interface PlatformPickerProps {
  selectedPlatform: Platform
  onChange: (platform: Platform) => void
  settings: SettingsState
  updateSettings: (settings: Partial<SettingsState>) => void
}

export function PlatformPicker({ selectedPlatform, onChange, settings, updateSettings }: PlatformPickerProps) {
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            onClick={() => onChange("mux")}
            className={cn(
              "p-4 rounded-lg cursor-pointer transition-all",
              "border-2",
              selectedPlatform === "mux"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                : "border-blue-100 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-950/20 hover:border-blue-200 dark:hover:border-blue-800/50",
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
              "border-2",
              selectedPlatform === "cloudflare"
                ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20"
                : "border-purple-100 dark:border-purple-900/30 bg-purple-50 dark:bg-purple-950/20 hover:border-purple-200 dark:hover:border-purple-800/50",
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
              "border-2",
              selectedPlatform === "self-hosted"
                ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
                : "border-amber-100 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-950/20 hover:border-amber-200 dark:hover:border-amber-800/50",
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
              "border-2",
              selectedPlatform === "hybrid"
                ? "border-pink-500 bg-pink-50 dark:bg-pink-950/20"
                : "border-pink-100 dark:border-pink-900/30 bg-pink-50 dark:bg-pink-950/20 hover:border-pink-200 dark:hover:border-pink-800/50",
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

        {(selectedPlatform === "self-hosted" || selectedPlatform === "hybrid") && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700"
          >
            <h3 className="text-md font-semibold mb-4">Self-Hosted Configuration</h3>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serverType">Server Type</Label>
                  <Select
                    value={settings.serverType || "mac-mini"}
                    onValueChange={(value) => updateSettings({ serverType: value })}
                  >
                    <SelectTrigger id="serverType">
                      <SelectValue placeholder="Select server type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mac-mini">Mac Mini (M2 Pro)</SelectItem>
                      <SelectItem value="mac-studio">Mac Studio (M2 Max)</SelectItem>
                      <SelectItem value="linux-server">Linux Server (x86)</SelectItem>
                      <SelectItem value="custom">Custom Hardware</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="networkInterface">Network Interface</Label>
                  <Select
                    value={settings.networkInterface || "1gbe"}
                    onValueChange={(value) => updateSettings({ networkInterface: value })}
                  >
                    <SelectTrigger id="networkInterface">
                      <SelectValue placeholder="Select network interface" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1gbe">1GbE (Standard)</SelectItem>
                      <SelectItem value="10gbe">10GbE (Upgraded)</SelectItem>
                      <SelectItem value="100gbe">100GbE (Enterprise)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="streamingServer">Streaming Server</Label>
                  <Select
                    value={settings.streamingServer || "mediamtx"}
                    onValueChange={(value) => updateSettings({ streamingServer: value })}
                  >
                    <SelectTrigger id="streamingServer">
                      <SelectValue placeholder="Select streaming server" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mediamtx">MediaMTX</SelectItem>
                      <SelectItem value="nginx-rtmp">Nginx-RTMP</SelectItem>
                      <SelectItem value="wowza">Wowza Streaming Engine</SelectItem>
                      <SelectItem value="srt-live">SRT Live Server</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transcodingEngine">Transcoding Engine</Label>
                  <Select
                    value={settings.transcodingEngine || "hardware"}
                    onValueChange={(value) => updateSettings({ transcodingEngine: value })}
                  >
                    <SelectTrigger id="transcodingEngine">
                      <SelectValue placeholder="Select transcoding engine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hardware">Hardware (Apple Media Engine)</SelectItem>
                      <SelectItem value="software">Software (CPU-based)</SelectItem>
                      <SelectItem value="hybrid">Hybrid (Hardware + Software)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="redundancyLevel">Redundancy Level</Label>
                  <Select
                    value={settings.redundancyLevel || "none"}
                    onValueChange={(value) => updateSettings({ redundancyLevel: value })}
                  >
                    <SelectTrigger id="redundancyLevel">
                      <SelectValue placeholder="Select redundancy level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Single Server)</SelectItem>
                      <SelectItem value="cold">Cold Standby</SelectItem>
                      <SelectItem value="warm">Warm Standby</SelectItem>
                      <SelectItem value="hot">Hot Standby (Automated)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bandwidthCapacity">Bandwidth Capacity (Mbps)</Label>
                  <Input
                    id="bandwidthCapacity"
                    type="number"
                    min={0}
                    value={settings.bandwidthCapacity || 1000}
                    onChange={(e) => updateSettings({ bandwidthCapacity: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {selectedPlatform === "hybrid" && (
                <>
                  <Separator className="my-4" />
                  <h4 className="text-sm font-medium mb-3">Hybrid-Specific Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cloudProvider">Cloud Provider</Label>
                      <Select
                        value={settings.cloudProvider || "cloudflare"}
                        onValueChange={(value) => updateSettings({ cloudProvider: value })}
                      >
                        <SelectTrigger id="cloudProvider">
                          <SelectValue placeholder="Select cloud provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cloudflare">Cloudflare Stream</SelectItem>
                          <SelectItem value="mux">Mux</SelectItem>
                          <SelectItem value="aws">AWS MediaConnect + CloudFront</SelectItem>
                          <SelectItem value="gcp">Google Cloud CDN</SelectItem>
                          <SelectItem value="azure">Azure Media Services</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Cloud service for stream distribution
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="originEgressCost">Origin Egress Cost ($/GB)</Label>
                      <Input
                        id="originEgressCost"
                        type="number"
                        min={0}
                        step={0.001}
                        value={settings.originEgressCost || 0.09}
                        onChange={(e) => updateSettings({ originEgressCost: Number.parseFloat(e.target.value) || 0 })}
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Cost to transfer data from your server to cloud
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Label htmlFor="hybridRedundancyMode">Redundancy Mode</Label>
                    <Select
                      value={settings.hybridRedundancyMode || "active-passive"}
                      onValueChange={(value) => updateSettings({ hybridRedundancyMode: value })}
                    >
                      <SelectTrigger id="hybridRedundancyMode">
                        <SelectValue placeholder="Select redundancy mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active-passive">Active-Passive (Cloud Backup)</SelectItem>
                        <SelectItem value="active-active">Active-Active (Load Balanced)</SelectItem>
                        <SelectItem value="local-primary">Local Primary with Cloud Failover</SelectItem>
                        <SelectItem value="cloud-primary">Cloud Primary with Local Failover</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      How local and cloud resources work together
                    </p>
                  </div>
                </>
              )}

              <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/30">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-xs text-amber-700 dark:text-amber-300">
                  Self-hosted streaming requires technical expertise and ongoing maintenance. Ensure you have adequate
                  resources for 24/7 operations.
                </AlertDescription>
              </Alert>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
