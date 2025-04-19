"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Cpu, HardDrive, Network, MemoryStick, Settings, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useInfrastructure } from "@/lib/store-init"

export function InfrastructureRecommendation() {
  const { hardwareSettings, updateHardwareSettings } = useInfrastructure()
  const [activeTab, setActiveTab] = useState("recommended")

  // Helper function to determine color based on utilization
  const getUtilizationColor = (percentage: number) => {
    if (percentage < 50) return "bg-emerald-500"
    if (percentage < 75) return "bg-amber-500"
    return "bg-rose-500"
  }

  // Calculate utilization percentages
  const cpuUtilization = (hardwareSettings.cpuCores / 16) * 100
  const memoryUtilization = (hardwareSettings.memoryGB / 64) * 100
  const storageUtilization = (hardwareSettings.storageGB / 2000) * 100
  const bandwidthUtilization = (hardwareSettings.bandwidthMbps / 1000) * 100

  return (
    <Card className="overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-md">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold">Infrastructure Recommendation</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
              Automatically calculated based on your streaming and VOD requirements
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  These recommendations are calculated based on your live channels, concurrent viewers, and VOD library
                  size.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="recommended" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CPU */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <span className="font-medium">CPU</span>
                  </div>
                  <span className="font-semibold">{hardwareSettings.cpuCores} cores</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getUtilizationColor(cpuUtilization)} transition-all`}
                    style={{ width: `${Math.min(cpuUtilization, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {cpuUtilization < 50
                    ? "Sufficient for current workload"
                    : cpuUtilization < 75
                      ? "Moderate utilization"
                      : "High utilization - consider upgrading"}
                </p>
              </div>

              {/* Memory */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <MemoryStick className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <span className="font-medium">Memory</span>
                  </div>
                  <span className="font-semibold">{hardwareSettings.memoryGB} GB</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getUtilizationColor(memoryUtilization)} transition-all`}
                    style={{ width: `${Math.min(memoryUtilization, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {memoryUtilization < 50
                    ? "Sufficient for current workload"
                    : memoryUtilization < 75
                      ? "Moderate utilization"
                      : "High utilization - consider upgrading"}
                </p>
              </div>

              {/* Storage */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <span className="font-medium">Storage</span>
                  </div>
                  <span className="font-semibold">{hardwareSettings.storageGB} GB</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getUtilizationColor(storageUtilization)} transition-all`}
                    style={{ width: `${Math.min(storageUtilization, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {storageUtilization < 50
                    ? "Sufficient for current workload"
                    : storageUtilization < 75
                      ? "Moderate utilization"
                      : "High utilization - consider upgrading"}
                </p>
              </div>

              {/* Network */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <span className="font-medium">Network</span>
                  </div>
                  <span className="font-semibold">{hardwareSettings.bandwidthMbps} Mbps</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getUtilizationColor(bandwidthUtilization)} transition-all`}
                    style={{ width: `${Math.min(bandwidthUtilization, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {bandwidthUtilization < 50
                    ? "Sufficient for current workload"
                    : bandwidthUtilization < 75
                      ? "Moderate utilization"
                      : "High utilization - consider upgrading"}
                </p>
              </div>
            </div>

            <Collapsible>
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="font-medium">Advanced Settings</span>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <span>Show Advanced</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="pt-4 space-y-4">
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Instance Type</label>
                    <Select defaultValue="standard">
                      <SelectTrigger>
                        <SelectValue placeholder="Select instance type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic (2 vCPU, 4GB RAM)</SelectItem>
                        <SelectItem value="standard">Standard (4 vCPU, 8GB RAM)</SelectItem>
                        <SelectItem value="performance">Performance (8 vCPU, 16GB RAM)</SelectItem>
                        <SelectItem value="premium">Premium (16 vCPU, 32GB RAM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Region</label>
                    <Select defaultValue="us-east">
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us-east">US East (N. Virginia)</SelectItem>
                        <SelectItem value="us-west">US West (Oregon)</SelectItem>
                        <SelectItem value="eu-central">EU (Frankfurt)</SelectItem>
                        <SelectItem value="ap-southeast">Asia Pacific (Singapore)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Redundancy Factor</label>
                    <Select defaultValue="none">
                      <SelectTrigger>
                        <SelectValue placeholder="Select redundancy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Single Instance)</SelectItem>
                        <SelectItem value="basic">Basic (Failover Instance)</SelectItem>
                        <SelectItem value="high">High Availability (Multi-AZ)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Storage Type</label>
                    <Select defaultValue="ssd">
                      <SelectTrigger>
                        <SelectValue placeholder="Select storage type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard (HDD)</SelectItem>
                        <SelectItem value="ssd">SSD</SelectItem>
                        <SelectItem value="premium-ssd">Premium SSD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-sm font-medium">Auto-scaling Policy</label>
                  <Select defaultValue="balanced">
                    <SelectTrigger>
                      <SelectValue placeholder="Select auto-scaling policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Fixed Resources)</SelectItem>
                      <SelectItem value="conservative">Conservative (Scale at 80% utilization)</SelectItem>
                      <SelectItem value="balanced">Balanced (Scale at 70% utilization)</SelectItem>
                      <SelectItem value="aggressive">Aggressive (Scale at 60% utilization)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium">Override Recommendations</span>
              <div className="flex items-center gap-2">
                <Switch
                  checked={hardwareSettings.overrideMode}
                  onCheckedChange={(checked) => updateHardwareSettings({ overrideMode: checked })}
                />
                <span className="text-sm">Manual Mode</span>
              </div>
            </div>

            <div className="space-y-6">
              {/* CPU Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <span className="font-medium">CPU Cores</span>
                  </div>
                  <span className="font-semibold">{hardwareSettings.cpuCores} cores</span>
                </div>
                <Slider
                  disabled={!hardwareSettings.overrideMode}
                  value={[hardwareSettings.cpuCores]}
                  min={2}
                  max={32}
                  step={2}
                  onValueChange={(value) => updateHardwareSettings({ cpuCores: value[0] })}
                  className={hardwareSettings.overrideMode ? "" : "opacity-50"}
                />
              </div>

              {/* Memory Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <MemoryStick className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <span className="font-medium">Memory</span>
                  </div>
                  <span className="font-semibold">{hardwareSettings.memoryGB} GB</span>
                </div>
                <Slider
                  disabled={!hardwareSettings.overrideMode}
                  value={[hardwareSettings.memoryGB]}
                  min={4}
                  max={128}
                  step={4}
                  onValueChange={(value) => updateHardwareSettings({ memoryGB: value[0] })}
                  className={hardwareSettings.overrideMode ? "" : "opacity-50"}
                />
              </div>

              {/* Storage Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <span className="font-medium">Storage</span>
                  </div>
                  <span className="font-semibold">{hardwareSettings.storageGB} GB</span>
                </div>
                <Slider
                  disabled={!hardwareSettings.overrideMode}
                  value={[hardwareSettings.storageGB]}
                  min={100}
                  max={4000}
                  step={100}
                  onValueChange={(value) => updateHardwareSettings({ storageGB: value[0] })}
                  className={hardwareSettings.overrideMode ? "" : "opacity-50"}
                />
              </div>

              {/* Bandwidth Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <span className="font-medium">Network Bandwidth</span>
                  </div>
                  <span className="font-semibold">{hardwareSettings.bandwidthMbps} Mbps</span>
                </div>
                <Slider
                  disabled={!hardwareSettings.overrideMode}
                  value={[hardwareSettings.bandwidthMbps]}
                  min={10}
                  max={2000}
                  step={10}
                  onValueChange={(value) => updateHardwareSettings({ bandwidthMbps: value[0] })}
                  className={hardwareSettings.overrideMode ? "" : "opacity-50"}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
