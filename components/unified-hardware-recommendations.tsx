"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  RotateCcw,
  Server,
  Cpu,
  HardDrive,
  Network,
  AlertTriangle,
  CheckCircle2,
  Cloud,
  Info,
  Calculator,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { calculateHardwareRequirements, getHardwareOptions } from "@/lib/hardware-calculator"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import type { SettingsState } from "@/lib/types"

interface UnifiedHardwareRecommendationsProps {
  settings: SettingsState
  updateSettings: (settings: Partial<SettingsState>) => void
}

export function UnifiedHardwareRecommendations({ settings, updateSettings }: UnifiedHardwareRecommendationsProps) {
  // Calculate hardware requirements based on current settings
  const hardwareRequirements = calculateHardwareRequirements(settings)
  const hardwareOptions = getHardwareOptions()
  const isHybrid = settings.platform === "hybrid"
  const isRelevantPlatform = settings.platform === "self-hosted" || settings.platform === "hybrid"

  // Local state for UI controls
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [showCalculationDetails, setShowCalculationDetails] = useState(false)
  const [showCloudOptions, setShowCloudOptions] = useState(isHybrid)
  const [editMode, setEditMode] = useState<Record<string, boolean>>({
    serverType: false,
    cpuCores: false,
    memoryGB: false,
    networkInterface: false,
    bandwidthCapacity: false,
    transcodingEngine: false,
    cloudProvider: false,
    originEgressCost: false,
    hybridRedundancyMode: false,
  })

  // Track if any recommendations have been overridden
  const [overridden, setOverridden] = useState<Record<string, boolean>>({
    serverType: false,
    cpuCores: false,
    memoryGB: false,
    networkInterface: false,
    bandwidthCapacity: false,
    transcodingEngine: false,
    cloudProvider: false,
    originEgressCost: false,
    hybridRedundancyMode: false,
  })

  // Use refs to track previous values and prevent unnecessary updates
  const prevCapEx = useRef(settings.capEx)
  const prevAmortMonths = useRef(settings.amortMonths)
  const prevWattage = useRef(settings.wattage)
  const prevPowerRate = useRef(settings.powerRate)
  const prevServerOpexMo = useRef(settings.serverOpexMo)
  const prevElectricityOpexMo = useRef(settings.electricityOpexMo)
  const isUpdating = useRef(false)

  // Calculate total monthly hardware cost
  const totalMonthlyCost =
    (settings.hardwareMode === "own" ? settings.serverOpexMo || 0 : settings.monthlyRentalCost || 0) +
    (settings.electricityOpexMo || 0) +
    (settings.internetOpexMo || 0) +
    (settings.networkSwitchNeeded ? 2 : 0)

  // Toggle edit mode for a specific field
  const toggleEditMode = (field: string) => {
    setEditMode((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  // Mark a field as overridden when user manually changes it
  const markAsOverridden = (field: string) => {
    setOverridden((prev) => ({
      ...prev,
      [field]: true,
    }))
  }

  // Reset a field to recommended value
  const resetToRecommended = (field: string) => {
    const updates: Partial<SettingsState> = {}

    if (field === "serverType") {
      updates.serverType =
        hardwareRequirements.recommendedHardware
          ?.toLowerCase()
          .replace(/\s+$.+$/, "")
          .replace(/\s+/g, "-") || "mac-mini"
      updates.serverCost = hardwareRequirements.estimatedCost
    } else if (field === "cpuCores") {
      // Reset CPU cores to recommended value
      updates.cpuCores = hardwareRequirements.cpuCores
    } else if (field === "memoryGB") {
      // Reset memory to recommended value
      updates.memoryGB = hardwareRequirements.memoryGB
    } else if (field === "networkInterface") {
      updates.networkInterface = hardwareRequirements.networkMbps >= 2000 ? "10gbe" : "1gbe"
    } else if (field === "bandwidthCapacity") {
      updates.bandwidthCapacity = hardwareRequirements.networkMbps
    } else if (field === "transcodingEngine") {
      updates.transcodingEngine = "hardware"
    } else if (field === "cloudProvider") {
      updates.cloudProvider = "cloudflare"
    } else if (field === "originEgressCost") {
      updates.originEgressCost = 0.09
    } else if (field === "hybridRedundancyMode") {
      updates.hybridRedundancyMode = "active-passive"
    }

    updateSettings(updates)

    setOverridden((prev) => ({
      ...prev,
      [field]: false,
    }))

    setEditMode((prev) => ({
      ...prev,
      [field]: false,
    }))
  }

  // Calculate max viewers based on bandwidth capacity
  const calculateMaxViewers = () => {
    // Estimate based on 3 Mbps per viewer for 1080p
    const bitratePerViewer = settings.avgBitrateOverride || 3 // Mbps
    return Math.floor((settings.bandwidthCapacity || 1000) / bitratePerViewer)
  }

  // Determine if current bandwidth is sufficient
  const isBandwidthSufficient = () => {
    const bitratePerViewer = settings.avgBitrateOverride || 3 // Mbps
    const requiredBandwidth = settings.peakConcurrentViewers * bitratePerViewer
    return (settings.bandwidthCapacity || 1000) >= requiredBandwidth
  }

  // Get network interface recommendation based on bandwidth requirements
  const getNetworkInterfaceRecommendation = () => {
    const requiredBandwidth = settings.peakConcurrentViewers * (settings.avgBitrateOverride || 3)
    if (requiredBandwidth > 8000) {
      return "40GbE or multiple 10GbE"
    } else if (requiredBandwidth > 800) {
      return "10GbE"
    } else {
      return "1GbE"
    }
  }

  // Update cost calculations when settings change
  useEffect(() => {
    // Prevent infinite update loops by checking if we're already updating
    if (isUpdating.current) return

    // Check if values have actually changed to avoid unnecessary updates
    if (
      settings.capEx !== prevCapEx.current ||
      settings.amortMonths !== prevAmortMonths.current ||
      settings.wattage !== prevWattage.current ||
      settings.powerRate !== prevPowerRate.current
    ) {
      isUpdating.current = true

      const updates: Partial<SettingsState> = {}

      // Calculate server opex (amortized cost)
      if (settings.capEx && settings.amortMonths) {
        const serverOpexMo = settings.capEx / settings.amortMonths

        // Only update if it's different to avoid infinite loop
        if (Math.abs(serverOpexMo - (settings.serverOpexMo || 0)) > 0.01) {
          updates.serverOpexMo = serverOpexMo
        }
      }

      // Calculate electricity cost
      if (settings.wattage && settings.powerRate) {
        const electricityOpexMo = (settings.wattage * 24 * 30 * settings.powerRate) / 1000

        // Only update if it's different
        if (Math.abs(electricityOpexMo - (settings.electricityOpexMo || 0)) > 0.01) {
          updates.electricityOpexMo = electricityOpexMo
        }
      }

      // Only call updateSettings if we have changes to make
      if (Object.keys(updates).length > 0) {
        updateSettings(updates)
      }

      // Update refs with current values
      prevCapEx.current = settings.capEx
      prevAmortMonths.current = settings.amortMonths
      prevWattage.current = settings.wattage
      prevPowerRate.current = settings.powerRate
      prevServerOpexMo.current = settings.serverOpexMo
      prevElectricityOpexMo.current = settings.electricityOpexMo

      // Reset the updating flag after a short delay
      setTimeout(() => {
        isUpdating.current = false
      }, 0)
    }
  }, [
    settings.capEx,
    settings.amortMonths,
    settings.wattage,
    settings.powerRate,
    settings.serverOpexMo,
    settings.electricityOpexMo,
    updateSettings,
  ])

  // Show cloud options by default when hybrid is selected
  useEffect(() => {
    if (isHybrid) {
      setShowCloudOptions(true)
    }
  }, [isHybrid])

  return (
    <Card
      className={cn(
        "border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 order-first lg:order-none mb-6 lg:mb-0",
        isRelevantPlatform ? "ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400" : "",
      )}
    >
      <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-900 dark:to-purple-900/30 flex flex-row items-center justify-between">
        <div>
          <CardTitle>Infrastructure Recommendations</CardTitle>
          <CardDescription>
            {isHybrid ? "Hardware and cloud provider settings" : "Hardware recommendations"}
          </CardDescription>
        </div>
        <div className="rounded-full p-2 bg-purple-100 dark:bg-purple-900/50">
          <Server className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Primary recommendations */}
        <div className="space-y-3">
          {/* Server recommendation */}
          <div className="p-3 border rounded-lg">
            <div className="flex items-start gap-2">
              <Server className="h-4 w-4 text-blue-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium">Recommended Server</h4>
                {!editMode.serverType ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono">
                      {hardwareOptions.find(
                        (option) =>
                          option.value ===
                          (overridden.serverType
                            ? settings.serverType
                            : hardwareRequirements.recommendedHardware
                                ?.toLowerCase()
                                .replace(/\s+$.+$/, "")
                                .replace(/\s+/g, "-") || "mac-mini"),
                      )?.label || hardwareRequirements.recommendedHardware}
                    </span>
                    {overridden.serverType && (
                      <span className="text-xs text-amber-600 dark:text-amber-400">(Custom)</span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 ml-auto"
                      onClick={() => toggleEditMode("serverType")}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 mt-1">
                    <Select
                      value={settings.serverType}
                      onValueChange={(value) => {
                        updateSettings({ serverType: value })
                        markAsOverridden("serverType")
                      }}
                    >
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Select server type" />
                      </SelectTrigger>
                      <SelectContent>
                        {hardwareOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => toggleEditMode("serverType")}
                      >
                        Done
                      </Button>
                      {overridden.serverType && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => resetToRecommended("serverType")}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Est. cost: {formatCurrency(settings.serverCost || hardwareRequirements.estimatedCost)}
                </p>
              </div>
            </div>
          </div>

          {/* Network recommendation */}
          <div className="p-3 border rounded-lg">
            <div className="flex items-start gap-2">
              <Network className="h-4 w-4 text-green-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium">Network</h4>

                {/* Network Interface */}
                <div className="mt-1">
                  <Label className="text-xs text-slate-500">Interface</Label>
                  {!editMode.networkInterface ? (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono">
                        {settings.networkInterface === "10gbe" ? "10 Gigabit Ethernet" : "1 Gigabit Ethernet"}
                      </span>
                      {overridden.networkInterface && (
                        <span className="text-xs text-amber-600 dark:text-amber-400">(Custom)</span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 ml-auto"
                        onClick={() => toggleEditMode("networkInterface")}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 mt-1">
                      <Select
                        value={settings.networkInterface || "1gbe"}
                        onValueChange={(value) => {
                          updateSettings({ networkInterface: value })
                          markAsOverridden("networkInterface")
                        }}
                      >
                        <SelectTrigger className="w-full h-8 text-xs">
                          <SelectValue placeholder="Select network interface" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1gbe">1 Gigabit Ethernet</SelectItem>
                          <SelectItem value="10gbe">10 Gigabit Ethernet</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => toggleEditMode("networkInterface")}
                        >
                          Done
                        </Button>
                        {overridden.networkInterface && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => resetToRecommended("networkInterface")}
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Reset
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bandwidth sufficiency indicator */}
                <div className="mt-1">
                  {isBandwidthSufficient() ? (
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Supports {calculateMaxViewers()} viewers
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-amber-500" />
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Max: {calculateMaxViewers()}/{settings.peakConcurrentViewers} viewers
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Transcoding recommendation */}
          <div className="p-3 border rounded-lg">
            <div className="flex items-start gap-2">
              <Cpu className="h-4 w-4 text-purple-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium">Transcoding</h4>

                {!editMode.transcodingEngine ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono">
                      {settings.transcodingEngine === "hardware"
                        ? "Hardware Accelerated"
                        : settings.transcodingEngine === "software"
                          ? "Software (CPU)"
                          : "Hybrid"}
                    </span>
                    {overridden.transcodingEngine && (
                      <span className="text-xs text-amber-600 dark:text-amber-400">(Custom)</span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 ml-auto"
                      onClick={() => toggleEditMode("transcodingEngine")}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 mt-1">
                    <Select
                      value={settings.transcodingEngine || "hardware"}
                      onValueChange={(value) => {
                        updateSettings({ transcodingEngine: value })
                        markAsOverridden("transcodingEngine")
                      }}
                    >
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Select transcoding engine" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hardware">Hardware Accelerated</SelectItem>
                        <SelectItem value="software">Software (CPU)</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => toggleEditMode("transcodingEngine")}
                      >
                        Done
                      </Button>
                      {overridden.transcodingEngine && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => resetToRecommended("transcodingEngine")}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Requirements summary */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">System Requirements</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setShowCalculationDetails(!showCalculationDetails)}
                  >
                    <Calculator className="h-4 w-4 text-slate-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">View calculation details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* CPU Cores */}
            <div className="flex flex-col gap-1 p-2 rounded-md bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Cpu className="h-3 w-3 text-slate-500" />
                  <span className="font-medium">CPU Cores</span>
                </div>
                {!editMode.cpuCores ? (
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => toggleEditMode("cpuCores")}>
                    <Edit2 className="h-3 w-3 text-slate-400" />
                  </Button>
                ) : null}
              </div>

              {!editMode.cpuCores ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-mono font-bold">
                    {settings.cpuCores || hardwareRequirements.cpuCores}
                  </span>
                  <span className="text-slate-500">cores</span>
                  {overridden.cpuCores && <span className="ml-auto text-amber-500 text-[10px]">(Custom)</span>}
                </div>
              ) : (
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min={1}
                      value={settings.cpuCores || hardwareRequirements.cpuCores}
                      onChange={(e) => {
                        updateSettings({ cpuCores: Number(e.target.value) || hardwareRequirements.cpuCores })
                        markAsOverridden("cpuCores")
                      }}
                      className="h-6 text-xs"
                    />
                    <span className="text-slate-500 text-[10px]">cores</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-5 text-[10px] px-1 py-0"
                      onClick={() => toggleEditMode("cpuCores")}
                    >
                      Done
                    </Button>
                    {overridden.cpuCores && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 text-[10px] px-1 py-0"
                        onClick={() => resetToRecommended("cpuCores")}
                      >
                        <RotateCcw className="h-2 w-2 mr-1" />
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Memory */}
            <div className="flex flex-col gap-1 p-2 rounded-md bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Server className="h-3 w-3 text-slate-500" />
                  <span className="font-medium">Memory</span>
                </div>
                {!editMode.memoryGB ? (
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => toggleEditMode("memoryGB")}>
                    <Edit2 className="h-3 w-3 text-slate-400" />
                  </Button>
                ) : null}
              </div>

              {!editMode.memoryGB ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-mono font-bold">
                    {settings.memoryGB || hardwareRequirements.memoryGB}
                  </span>
                  <span className="text-slate-500">GB</span>
                  {overridden.memoryGB && <span className="ml-auto text-amber-500 text-[10px]">(Custom)</span>}
                </div>
              ) : (
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min={1}
                      value={settings.memoryGB || hardwareRequirements.memoryGB}
                      onChange={(e) => {
                        updateSettings({ memoryGB: Number(e.target.value) || hardwareRequirements.memoryGB })
                        markAsOverridden("memoryGB")
                      }}
                      className="h-6 text-xs"
                    />
                    <span className="text-slate-500 text-[10px]">GB</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-5 text-[10px] px-1 py-0"
                      onClick={() => toggleEditMode("memoryGB")}
                    >
                      Done
                    </Button>
                    {overridden.memoryGB && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 text-[10px] px-1 py-0"
                        onClick={() => resetToRecommended("memoryGB")}
                      >
                        <RotateCcw className="h-2 w-2 mr-1" />
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Storage */}
            <div className="flex flex-col gap-1 p-2 rounded-md bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1">
                <HardDrive className="h-3 w-3 text-slate-500" />
                <span className="font-medium">Storage</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-mono font-bold">{hardwareRequirements.storageGB}</span>
                <span className="text-slate-500">GB</span>
              </div>
            </div>

            {/* Network */}
            <div className="flex flex-col gap-1 p-2 rounded-md bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Network className="h-3 w-3 text-slate-500" />
                  <span className="font-medium">Network</span>
                </div>
                {!editMode.bandwidthCapacity ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={() => toggleEditMode("bandwidthCapacity")}
                  >
                    <Edit2 className="h-3 w-3 text-slate-400" />
                  </Button>
                ) : null}
              </div>

              {!editMode.bandwidthCapacity ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-mono font-bold">
                    {settings.bandwidthCapacity || hardwareRequirements.networkMbps}
                  </span>
                  <span className="text-slate-500">Mbps</span>
                  <span className="ml-1 text-xs text-blue-500">→ {getNetworkInterfaceRecommendation()}</span>
                  {overridden.bandwidthCapacity && <span className="ml-auto text-amber-500 text-[10px]">(Custom)</span>}
                </div>
              ) : (
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min={100}
                      value={settings.bandwidthCapacity || hardwareRequirements.networkMbps}
                      onChange={(e) => {
                        updateSettings({
                          bandwidthCapacity: Number(e.target.value) || hardwareRequirements.networkMbps,
                        })
                        markAsOverridden("bandwidthCapacity")
                      }}
                      className="h-6 text-xs"
                    />
                    <span className="text-slate-500 text-[10px]">Mbps</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-5 text-[10px] px-1 py-0"
                      onClick={() => toggleEditMode("bandwidthCapacity")}
                    >
                      Done
                    </Button>
                    {overridden.bandwidthCapacity && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 text-[10px] px-1 py-0"
                        onClick={() => resetToRecommended("bandwidthCapacity")}
                      >
                        <RotateCcw className="h-2 w-2 mr-1" />
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Calculation details */}
          <AnimatePresence>
            {showCalculationDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <p className="font-medium">How we calculated these requirements:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>
                      <span className="font-medium">CPU:</span> Base 2 cores + 1 core per channel + 1 core per 100
                      concurrent viewers
                    </li>
                    <li>
                      <span className="font-medium">Memory:</span> Base 4GB + 2GB per channel + 1GB per 200 concurrent
                      viewers
                    </li>
                    <li>
                      <span className="font-medium">Storage:</span> Base 100GB + VOD retention (
                      {settings.retentionWindow} days × {settings.hoursPerDayArchived} hours/day)
                    </li>
                    <li>
                      <span className="font-medium">Network:</span> {settings.peakConcurrentViewers} viewers ×{" "}
                      {settings.avgBitrateOverride || 3} Mbps per viewer
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Hybrid-specific cloud provider settings */}
        {isHybrid && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium flex items-center gap-1.5">
                <Cloud className="h-4 w-4 text-blue-500" />
                <span>Cloud Provider Configuration</span>
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowCloudOptions(!showCloudOptions)}
              >
                {showCloudOptions ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </Button>
            </div>

            {showCloudOptions && (
              <div className="space-y-4">
                {/* Cloud provider selection */}
                <div className="space-y-2">
                  <Label htmlFor="cloudProvider" className="text-xs text-slate-500">
                    Provider
                  </Label>
                  {!editMode.cloudProvider ? (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono">
                        {settings.cloudProvider === "cloudflare"
                          ? "Cloudflare Stream"
                          : settings.cloudProvider === "mux"
                            ? "Mux"
                            : settings.cloudProvider === "aws"
                              ? "AWS MediaConnect + CloudFront"
                              : settings.cloudProvider === "gcp"
                                ? "Google Cloud CDN"
                                : "Azure Media Services"}
                      </span>
                      {overridden.cloudProvider && (
                        <span className="text-xs text-amber-600 dark:text-amber-400">(Custom)</span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 ml-auto"
                        onClick={() => toggleEditMode("cloudProvider")}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 mt-1">
                      <Select
                        value={settings.cloudProvider || "cloudflare"}
                        onValueChange={(value) => {
                          updateSettings({ cloudProvider: value })
                          markAsOverridden("cloudProvider")
                        }}
                      >
                        <SelectTrigger className="w-full h-8 text-xs">
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
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => toggleEditMode("cloudProvider")}
                        >
                          Done
                        </Button>
                        {overridden.cloudProvider && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => resetToRecommended("cloudProvider")}
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Reset
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400">Cloud service for stream distribution</p>
                </div>

                {/* Origin egress cost */}
                <div className="space-y-2">
                  <Label htmlFor="originEgressCost" className="text-xs text-slate-500">
                    Origin Egress Cost ($/GB)
                  </Label>
                  {!editMode.originEgressCost ? (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono">${settings.originEgressCost || 0.09}</span>
                      {overridden.originEgressCost && (
                        <span className="text-xs text-amber-600 dark:text-amber-400">(Custom)</span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 ml-auto"
                        onClick={() => toggleEditMode("originEgressCost")}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 mt-1">
                      <Input
                        id="originEgressCost"
                        type="number"
                        min={0}
                        step={0.001}
                        value={settings.originEgressCost || 0.09}
                        onChange={(e) => {
                          updateSettings({ originEgressCost: Number.parseFloat(e.target.value) || 0 })
                          markAsOverridden("originEgressCost")
                        }}
                        className="h-8 text-xs"
                      />
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => toggleEditMode("originEgressCost")}
                        >
                          Done
                        </Button>
                        {overridden.originEgressCost && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => resetToRecommended("originEgressCost")}
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Reset
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Cost to transfer data from your server to cloud
                  </p>
                </div>

                {/* Redundancy mode */}
                <div className="space-y-2">
                  <Label htmlFor="hybridRedundancyMode" className="text-xs text-slate-500">
                    Redundancy Mode
                  </Label>
                  {!editMode.hybridRedundancyMode ? (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono">
                        {settings.hybridRedundancyMode === "active-passive"
                          ? "Active-Passive (Cloud Backup)"
                          : settings.hybridRedundancyMode === "active-active"
                            ? "Active-Active (Load Balanced)"
                            : settings.hybridRedundancyMode === "local-primary"
                              ? "Local Primary with Cloud Failover"
                              : "Cloud Primary with Local Failover"}
                      </span>
                      {overridden.hybridRedundancyMode && (
                        <span className="text-xs text-amber-600 dark:text-amber-400">(Custom)</span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 ml-auto"
                        onClick={() => toggleEditMode("hybridRedundancyMode")}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 mt-1">
                      <Select
                        value={settings.hybridRedundancyMode || "active-passive"}
                        onValueChange={(value) => {
                          updateSettings({ hybridRedundancyMode: value })
                          markAsOverridden("hybridRedundancyMode")
                        }}
                      >
                        <SelectTrigger className="w-full h-8 text-xs">
                          <SelectValue placeholder="Select redundancy mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active-passive">Active-Passive (Cloud Backup)</SelectItem>
                          <SelectItem value="active-active">Active-Active (Load Balanced)</SelectItem>
                          <SelectItem value="local-primary">Local Primary with Cloud Failover</SelectItem>
                          <SelectItem value="cloud-primary">Cloud Primary with Local Failover</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => toggleEditMode("hybridRedundancyMode")}
                        >
                          Done
                        </Button>
                        {overridden.hybridRedundancyMode && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => resetToRecommended("hybridRedundancyMode")}
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Reset
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    How local and cloud resources work together
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Advanced options toggle */}
        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 h-7 text-xs"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          >
            {showAdvancedOptions ? (
              <>
                <ChevronUp className="h-3 w-3" />
                <span>Hide Advanced Options</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                <span>Show Advanced Options</span>
              </>
            )}
          </Button>

          {showAdvancedOptions && (
            <div className="mt-3 space-y-3 border-t border-slate-200 dark:border-slate-700 pt-3">
              {/* Hardware acquisition mode */}
              <div className="space-y-1">
                <Label className="text-xs">Hardware Acquisition</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={settings.hardwareMode === "own" ? "default" : "outline"}
                    className="w-full h-7 text-xs"
                    onClick={() => updateSettings({ hardwareMode: "own" })}
                  >
                    Own
                  </Button>
                  <Button
                    type="button"
                    variant={settings.hardwareMode === "rent" ? "default" : "outline"}
                    className="w-full h-7 text-xs"
                    onClick={() => updateSettings({ hardwareMode: "rent" })}
                  >
                    Rent
                  </Button>
                </div>
              </div>

              <Separator className="my-2" />

              {/* Hardware cost details */}
              {settings.hardwareMode === "own" ? (
                <>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <Label htmlFor="capEx" className="text-xs">
                        Hardware Cost ($)
                      </Label>
                      <span className="text-xs font-mono">${settings.capEx || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Slider
                        id="capEx"
                        min={0}
                        max={5000}
                        step={100}
                        value={[settings.capEx || 1299]}
                        onValueChange={(value) => updateSettings({ capEx: value[0] })}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        min={0}
                        value={settings.capEx || 1299}
                        onChange={(e) => updateSettings({ capEx: Number(e.target.value) || 0 })}
                        className="w-20 h-7 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <Label htmlFor="amortMonths" className="text-xs">
                        Amortization (months)
                      </Label>
                      <span className="text-xs font-mono">{settings.amortMonths || 36}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Slider
                        id="amortMonths"
                        min={12}
                        max={60}
                        step={6}
                        value={[settings.amortMonths || 36]}
                        onValueChange={(value) => updateSettings({ amortMonths: value[0] })}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        min={1}
                        value={settings.amortMonths || 36}
                        onChange={(e) => updateSettings({ amortMonths: Number(e.target.value) || 36 })}
                        className="w-20 h-7 text-xs"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label htmlFor="monthlyRentalCost" className="text-xs">
                      Monthly Rental ($)
                    </Label>
                    <span className="text-xs font-mono">${settings.monthlyRentalCost || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Slider
                      id="monthlyRentalCost"
                      min={0}
                      max={500}
                      step={10}
                      value={[settings.monthlyRentalCost || 100]}
                      onValueChange={(value) => updateSettings({ monthlyRentalCost: value[0] })}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min={0}
                      value={settings.monthlyRentalCost || 100}
                      onChange={(e) => updateSettings({ monthlyRentalCost: Number(e.target.value) || 0 })}
                      className="w-20 h-7 text-xs"
                    />
                  </div>
                </div>
              )}

              <Separator className="my-2" />

              {/* Network switch */}
              <div className="flex items-center justify-between">
                <Label htmlFor="networkSwitchNeeded" className="text-xs">
                  Network Switch
                </Label>
                <Switch
                  id="networkSwitchNeeded"
                  checked={settings.networkSwitchNeeded}
                  onCheckedChange={(checked) => updateSettings({ networkSwitchNeeded: checked })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Monthly cost summary */}
        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Monthly Cost</h3>
            <div className="text-sm font-bold">{formatCurrency(totalMonthlyCost)}</div>
          </div>
        </div>

        {/* Warning for insufficient bandwidth */}
        {!isBandwidthSufficient() && (
          <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/30 p-2">
            <div className="flex items-start gap-1">
              <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400 mt-0.5" />
              <AlertDescription className="text-xs text-amber-700 dark:text-amber-300">
                Insufficient bandwidth for {settings.peakConcurrentViewers} viewers. Consider upgrading your network
                interface or reducing quality settings.
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Bitrate override control */}
        <div className="mt-2 p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="avgBitrateOverride" className="text-xs">
              Average Bitrate per Viewer (Mbps)
            </Label>
            <span className="text-xs font-mono">{settings.avgBitrateOverride || 3} Mbps</span>
          </div>
          <div className="flex items-center gap-2">
            <Slider
              id="avgBitrateOverride"
              min={1}
              max={10}
              step={0.5}
              value={[settings.avgBitrateOverride || 3]}
              onValueChange={(value) => updateSettings({ avgBitrateOverride: value[0] })}
              className="flex-1"
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Info className="h-3 w-3 text-slate-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    Adjust this value based on your streaming quality. Typical values: SD (1-2 Mbps), HD (3-5 Mbps), 4K
                    (8-15 Mbps).
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
