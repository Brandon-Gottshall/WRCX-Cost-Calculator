"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
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
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Infrastructure Recommendation</h3>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Automatically calculated based on your streaming and VOD requirements
            </p>
          </div>
          <Button variant="ghost" size="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="w-full">
          <div className="grid grid-cols-2 mb-6">
            <button
              onClick={() => setActiveTab("recommended")}
              className={`py-2 text-center ${
                activeTab === "recommended" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              Recommended
            </button>
            <button
              onClick={() => setActiveTab("custom")}
              className={`py-2 text-center ${
                activeTab === "custom" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              Custom
            </button>
          </div>

          {activeTab === "recommended" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CPU */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-slate-600 dark:text-slate-400"
                      >
                        <rect x="4" y="4" width="16" height="16" rx="2"></rect>
                        <rect x="9" y="9" width="6" height="6"></rect>
                        <path d="M15 2v2"></path>
                        <path d="M15 20v2"></path>
                        <path d="M2 15h2"></path>
                        <path d="M20 15h2"></path>
                      </svg>
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-slate-600 dark:text-slate-400"
                      >
                        <path d="M6 19v-3"></path>
                        <path d="M10 19v-3"></path>
                        <path d="M14 19v-3"></path>
                        <path d="M18 19v-3"></path>
                        <path d="M8 11V9"></path>
                        <path d="M16 11V9"></path>
                        <path d="M12 11V9"></path>
                        <path d="M2 15h20"></path>
                        <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z"></path>
                      </svg>
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-slate-600 dark:text-slate-400"
                      >
                        <path d="M21 5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5z"></path>
                        <path d="M7 7h.01"></path>
                      </svg>
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-slate-600 dark:text-slate-400"
                      >
                        <path d="M6 9l6 6 6-6"></path>
                      </svg>
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

              <div className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-slate-600 dark:text-slate-400"
                    >
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span className="font-medium">Advanced Settings</span>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <span>Show Advanced</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="m6 9 6 6 6-6"></path>
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "custom" && (
            <div className="space-y-6">
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-slate-600 dark:text-slate-400"
                      >
                        <rect x="4" y="4" width="16" height="16" rx="2"></rect>
                        <rect x="9" y="9" width="6" height="6"></rect>
                        <path d="M15 2v2"></path>
                        <path d="M15 20v2"></path>
                        <path d="M2 15h2"></path>
                        <path d="M20 15h2"></path>
                      </svg>
                      <span className="font-medium">CPU Cores</span>
                    </div>
                    <span className="font-semibold">{hardwareSettings.cpuCores} cores</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="32"
                    step="2"
                    value={hardwareSettings.cpuCores}
                    onChange={(e) => updateHardwareSettings({ cpuCores: Number.parseInt(e.target.value) })}
                    disabled={!hardwareSettings.overrideMode}
                    className={`w-full ${hardwareSettings.overrideMode ? "" : "opacity-50"}`}
                  />
                </div>

                {/* Memory Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-slate-600 dark:text-slate-400"
                      >
                        <path d="M6 19v-3"></path>
                        <path d="M10 19v-3"></path>
                        <path d="M14 19v-3"></path>
                        <path d="M18 19v-3"></path>
                        <path d="M8 11V9"></path>
                        <path d="M16 11V9"></path>
                        <path d="M12 11V9"></path>
                        <path d="M2 15h20"></path>
                        <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z"></path>
                      </svg>
                      <span className="font-medium">Memory</span>
                    </div>
                    <span className="font-semibold">{hardwareSettings.memoryGB} GB</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="128"
                    step="4"
                    value={hardwareSettings.memoryGB}
                    onChange={(e) => updateHardwareSettings({ memoryGB: Number.parseInt(e.target.value) })}
                    disabled={!hardwareSettings.overrideMode}
                    className={`w-full ${hardwareSettings.overrideMode ? "" : "opacity-50"}`}
                  />
                </div>

                {/* Storage Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-slate-600 dark:text-slate-400"
                      >
                        <path d="M21 5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5z"></path>
                        <path d="M7 7h.01"></path>
                      </svg>
                      <span className="font-medium">Storage</span>
                    </div>
                    <span className="font-semibold">{hardwareSettings.storageGB} GB</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="4000"
                    step="100"
                    value={hardwareSettings.storageGB}
                    onChange={(e) => updateHardwareSettings({ storageGB: Number.parseInt(e.target.value) })}
                    disabled={!hardwareSettings.overrideMode}
                    className={`w-full ${hardwareSettings.overrideMode ? "" : "opacity-50"}`}
                  />
                </div>

                {/* Bandwidth Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-slate-600 dark:text-slate-400"
                      >
                        <path d="M6 9l6 6 6-6"></path>
                      </svg>
                      <span className="font-medium">Network Bandwidth</span>
                    </div>
                    <span className="font-semibold">{hardwareSettings.bandwidthMbps} Mbps</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="2000"
                    step="10"
                    value={hardwareSettings.bandwidthMbps}
                    onChange={(e) => updateHardwareSettings({ bandwidthMbps: Number.parseInt(e.target.value) })}
                    disabled={!hardwareSettings.overrideMode}
                    className={`w-full ${hardwareSettings.overrideMode ? "" : "opacity-50"}`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
