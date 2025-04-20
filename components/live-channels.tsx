"use client"

import React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PlusCircle, Trash2, Edit, Save, X, Info, ChevronDown, ChevronUp } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { SettingsState, ChannelStatistics } from "@/lib/types"

interface ValidationResult {
  field: string
  message: string
}

interface LiveChannelsProps {
  settings: SettingsState
  updateSettings: (settings: Partial<SettingsState>) => void
  validationResults: ValidationResult[]
  isEdited?: (fieldPath: string) => boolean
}

export function LiveChannels({ settings, updateSettings, validationResults, isEdited }: LiveChannelsProps) {
  const [editingChannel, setEditingChannel] = useState<(ChannelStatistics & { enabled?: boolean }) | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [showDvrSettings, setShowDvrSettings] = useState(settings.liveDvrEnabled)
  const defaultFillRate = settings.globalFillRate || 70
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<Record<string, boolean>>({})

  // New channel template
  const [newChannel, setNewChannel] = useState<Omit<ChannelStatistics & { enabled?: boolean }, "id">>({
    name: "",
    viewership: 0,
    averageRetentionMinutes: 0,
    adSpotsPerHour: 0,
    cpmRate: 0,
    fillRate: defaultFillRate,
    liveHours: 8,
    vodUniques: 0,
    vodWatchMin: 0,
    enabled: true,
    encodingPreset: settings.encodingPreset || "1080p-tri-ladder", // Default to global preset
  })

  // Get validation for specific fields
  const getFieldValidation = (field: string): ValidationResult | undefined => {
    return validationResults.find((result) => result.field === field)
  }

  // Ensure local state stays in sync with parent state
  useEffect(() => {
    setShowDvrSettings(settings.liveDvrEnabled)
  }, [settings.liveDvrEnabled])

  // Update channel count when channels array changes
  useEffect(() => {
    const enabledChannelCount = settings.channels.filter((channel) => channel.enabled !== false).length
    if (settings.channelCount !== enabledChannelCount) {
      updateSettings({ channelCount: enabledChannelCount })
    }
  }, [settings.channels, settings.channelCount, updateSettings])

  // Validate new channel
  const validateNewChannel = () => {
    const errors: Record<string, string> = {}

    if (!newChannel.name.trim()) {
      errors.name = "Channel name is required"
    }

    if (newChannel.viewership < 0) {
      errors.viewership = "Viewers must be a non-negative number"
    }

    if (newChannel.averageRetentionMinutes < 0) {
      errors.averageRetentionMinutes = "Retention must be a non-negative number"
    }

    if (newChannel.adSpotsPerHour < 0) {
      errors.adSpotsPerHour = "Ad spots must be a non-negative number"
    }

    if (newChannel.cpmRate < 0) {
      errors.cpmRate = "CPM rate must be a non-negative number"
    }

    if (newChannel.liveHours < 0 || newChannel.liveHours > 24) {
      errors.liveHours = "Live hours must be between 0 and 24"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle adding a new channel
  const handleAddChannel = () => {
    // Validate before adding
    if (!validateNewChannel()) return

    const channel: ChannelStatistics = {
      ...newChannel,
      id: `channel-${Date.now()}`,
    }
    updateSettings({
      channels: [...settings.channels, channel],
    })
    setNewChannel({
      name: "",
      viewership: 0,
      averageRetentionMinutes: 0,
      adSpotsPerHour: 0,
      cpmRate: 0,
      fillRate: defaultFillRate,
      liveHours: 8,
      vodUniques: 0,
      vodWatchMin: 0,
      enabled: true,
      encodingPreset: settings.encodingPreset || "1080p-tri-ladder",
    })
    setIsAdding(false)
    setValidationErrors({})
  }

  // Handle updating an existing channel
  const handleUpdateChannel = () => {
    if (!editingChannel) return

    updateSettings({
      channels: settings.channels.map((channel) => (channel.id === editingChannel.id ? editingChannel : channel)),
    })
    setEditingChannel(null)
  }

  // Handle deleting a channel
  const handleDeleteChannel = (id: string) => {
    updateSettings({
      channels: settings.channels.filter((channel) => channel.id !== id),
    })
  }

  // Calculate channel revenue
  const calculateChannelRevenue = (channel: ChannelStatistics & { enabled?: boolean }) => {
    // Return 0 if channel is explicitly disabled
    if (channel.enabled === false) {
      return 0
    }

    // Daily revenue = viewership * retention (hours) * ad spots per hour * fill rate * CPM / 1000
    const fillRate = channel.fillRate !== undefined ? channel.fillRate / 100 : defaultFillRate / 100
    const dailyRevenue =
      (channel.viewership *
        (channel.averageRetentionMinutes / 60) *
        channel.adSpotsPerHour *
        fillRate *
        channel.cpmRate) /
      1000

    // Monthly revenue (30 days)
    return dailyRevenue * 30
  }

  // Helper function to determine if a field has been edited
  const isFieldValueEdited = (channelId: string, fieldName: string) => {
    return isEdited ? isEdited(`channels.${channelId}.${fieldName}`) : false
  }

  // Helper function to apply styling based on whether a field has been edited
  const getFieldStyle = (channelId: string, fieldName: string) => {
    return isFieldValueEdited(channelId, fieldName) ? "font-bold" : "font-normal text-slate-500 italic"
  }

  // Calculate total peak concurrent viewers across all enabled channels
  const totalPeakConcurrentViewers = settings.channels
    .filter((channel) => channel.enabled !== false)
    .reduce((total, channel) => total + channel.viewership, 0)

  // Update peak concurrent viewers when channels change
  useEffect(() => {
    if (settings.peakConcurrentViewers !== totalPeakConcurrentViewers && totalPeakConcurrentViewers > 0) {
      updateSettings({ peakConcurrentViewers: totalPeakConcurrentViewers })
    }
  }, [totalPeakConcurrentViewers, settings.peakConcurrentViewers, updateSettings])

  const hasValidationErrors = Object.keys(validationErrors).length > 0

  // Toggle advanced settings for a channel
  const toggleAdvancedSettings = (channelId: string) => {
    setShowAdvancedSettings((prev) => ({
      ...prev,
      [channelId]: !prev[channelId],
    }))
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/30 px-3 sm:px-4 py-3">
        <CardTitle>Live Streaming</CardTitle>
        <CardDescription>Configure your live streaming channels and settings</CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 space-y-6">
        {/* Live Streaming Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="streamEnabled" className="min-h-[1.5rem]">
              Live Streaming Enabled
            </Label>
            <p className="text-sm text-slate-500 dark:text-slate-400">Enable live streaming functionality</p>
          </div>
          <Switch
            id="streamEnabled"
            checked={settings.streamEnabled !== false}
            onCheckedChange={(checked) => updateSettings({ streamEnabled: checked })}
            className="focus:outline-offset-2"
          />
        </div>

        {settings.streamEnabled !== false && (
          <>
            <Separator />

            {/* Global Encoding Settings */}
            <div className="p-6 rounded-2xl shadow-sm space-y-4 bg-white dark:bg-slate-900">
              <h3 className="text-lg font-medium">Encoding Settings</h3>
              <div className="flex flex-col space-y-1">
                <Label htmlFor="encodingPreset" className="min-h-[1.5rem]">
                  Default Encoding Preset
                </Label>
                <Select
                  value={settings.encodingPreset}
                  onValueChange={(value) => updateSettings({ encodingPreset: value })}
                >
                  <SelectTrigger id="encodingPreset" className="focus:outline-offset-2">
                    <SelectValue placeholder="Select encoding preset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1080p-tri-ladder">1080p Tri-ladder (5 Mbps × 2.8)</SelectItem>
                    <SelectItem value="720p-tri-ladder">720p Tri-ladder (3 Mbps × 2.8)</SelectItem>
                    <SelectItem value="480p-tri-ladder">480p Tri-ladder (1.5 Mbps × 2.8)</SelectItem>
                    <SelectItem value="1080p-single">1080p Single (5 Mbps × 1)</SelectItem>
                    <SelectItem value="720p-single">720p Single (3 Mbps × 1)</SelectItem>
                    <SelectItem value="480p-single">480p Single (1.5 Mbps × 1)</SelectItem>
                    <SelectItem value="4k-tri-ladder">4K Tri-ladder (15 Mbps × 2.8)</SelectItem>
                    <SelectItem value="4k-single">4K Single (15 Mbps × 1)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Default quality and bitrate configuration (can be overridden per channel)
                </p>
              </div>
            </div>

            {/* Channel Statistics */}
            <div className="p-6 rounded-2xl shadow-sm space-y-4 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Channel Statistics</h3>
                <div className="text-sm text-slate-500">
                  Total Channels:{" "}
                  <span className="font-medium">{settings.channels.filter((c) => c.enabled !== false).length}</span>
                </div>
              </div>

              {settings.channels.length > 0 ? (
                <div className="overflow-x-auto -mx-2 px-2">
                  <table className="w-full border-collapse" aria-label="Channel Statistics">
                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10">
                          On
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Channel
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Viewers
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <Button
                            variant="outline"
                            className="ml-auto flex items-center gap-2"
                            onClick={() => setIsAdding(true)}
                            size="sm"
                            disabled={isAdding}
                            className="focus:outline-offset-2"
                          >
                            <PlusCircle className="h-4 w-4" />
                            <span>Add Channel</span>
                          </Button>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                      {settings.channels.map((channel) => (
                        <React.Fragment key={channel.id}>
                          <tr className={channel.enabled === false ? "opacity-60" : ""}>
                            {editingChannel?.id === channel.id ? (
                              // Editing mode - basic fields
                              <>
                                <td className="px-4 py-2">
                                  <Switch
                                    checked={editingChannel.enabled !== false}
                                    onCheckedChange={(checked) =>
                                      setEditingChannel({ ...editingChannel, enabled: checked })
                                    }
                                    className="scale-75 focus:outline-offset-2"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <Input
                                    value={editingChannel.name}
                                    onChange={(e) => setEditingChannel({ ...editingChannel, name: e.target.value })}
                                    className="w-full text-sm focus:outline-offset-2"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <Input
                                    type="number"
                                    min={0}
                                    step={1}
                                    inputMode="numeric"
                                    pattern="\d*"
                                    value={editingChannel.viewership}
                                    onChange={(e) =>
                                      setEditingChannel({ ...editingChannel, viewership: Number(e.target.value) })
                                    }
                                    className="w-full text-sm text-right focus:outline-offset-2"
                                  />
                                </td>
                                <td className="px-4 py-2 text-right font-mono text-xs">
                                  {formatCurrency(calculateChannelRevenue(editingChannel))}
                                </td>
                                <td className="px-4 py-2">
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => toggleAdvancedSettings(channel.id)}
                                      className="h-7 p-1 focus:outline-offset-2"
                                    >
                                      {showAdvancedSettings[channel.id] ? (
                                        <ChevronUp className="h-3 w-3" />
                                      ) : (
                                        <ChevronDown className="h-3 w-3" />
                                      )}
                                      <span className="sr-only">
                                        {showAdvancedSettings[channel.id] ? "Hide" : "Show"} advanced settings
                                      </span>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={handleUpdateChannel}
                                      className="h-7 w-7 p-0 focus:outline-offset-2"
                                    >
                                      <Save className="h-3 w-3" />
                                      <span className="sr-only">Save channel</span>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setEditingChannel(null)}
                                      className="h-7 w-7 p-0 focus:outline-offset-2"
                                    >
                                      <X className="h-3 w-3" />
                                      <span className="sr-only">Cancel editing</span>
                                    </Button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              // View mode
                              <>
                                <td className="px-4 py-2">
                                  <div className="flex justify-center">
                                    <Switch
                                      checked={channel.enabled !== false}
                                      onCheckedChange={(checked) => {
                                        updateSettings({
                                          channels: settings.channels.map((ch) =>
                                            ch.id === channel.id ? { ...ch, enabled: checked } : ch,
                                          ),
                                        })
                                      }}
                                      className="scale-75 focus:outline-offset-2"
                                      aria-label={`Toggle ${channel.name} channel`}
                                    />
                                  </div>
                                </td>
                                <td className={`px-4 py-2 text-xs sm:text-sm ${getFieldStyle(channel.id, "name")}`}>
                                  {channel.name}
                                </td>
                                <td
                                  className={`px-4 py-2 text-right text-xs sm:text-sm ${getFieldStyle(channel.id, "viewership")}`}
                                >
                                  {channel.viewership.toLocaleString()}
                                </td>
                                <td className="px-4 py-2 text-right font-mono text-xs">
                                  {formatCurrency(calculateChannelRevenue(channel))}
                                </td>
                                <td className="px-4 py-2">
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => toggleAdvancedSettings(channel.id)}
                                      className="h-7 p-1 focus:outline-offset-2"
                                    >
                                      {showAdvancedSettings[channel.id] ? (
                                        <ChevronUp className="h-3 w-3" />
                                      ) : (
                                        <ChevronDown className="h-3 w-3" />
                                      )}
                                      <span className="sr-only">
                                        {showAdvancedSettings[channel.id] ? "Hide" : "Show"} advanced settings
                                      </span>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setEditingChannel(channel)}
                                      className="h-7 w-7 p-0 focus:outline-offset-2"
                                    >
                                      <Edit className="h-3 w-3" />
                                      <span className="sr-only">Edit channel</span>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteChannel(channel.id)}
                                      className="h-7 w-7 p-0 focus:outline-offset-2"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                      <span className="sr-only">Delete channel</span>
                                    </Button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>

                          {/* Advanced settings row - shown when expanded */}
                          {showAdvancedSettings[channel.id] && (
                            <tr className="bg-slate-50 dark:bg-slate-800/50">
                              <td colSpan={5} className="px-4 py-2">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-2">
                                  {editingChannel?.id === channel.id ? (
                                    // Editing mode - advanced fields
                                    <>
                                      <div className="flex flex-col space-y-1">
                                        <Label htmlFor={`encoding-${channel.id}`} className="min-h-[1.5rem] text-xs">
                                          Encoding Preset
                                        </Label>
                                        <Select
                                          value={editingChannel.encodingPreset || settings.encodingPreset}
                                          onValueChange={(value) =>
                                            setEditingChannel({ ...editingChannel, encodingPreset: value })
                                          }
                                        >
                                          <SelectTrigger
                                            id={`encoding-${channel.id}`}
                                            className="focus:outline-offset-2"
                                          >
                                            <SelectValue placeholder="Select encoding preset" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="1080p-tri-ladder">
                                              1080p Tri-ladder (5 Mbps × 2.8)
                                            </SelectItem>
                                            <SelectItem value="720p-tri-ladder">
                                              720p Tri-ladder (3 Mbps × 2.8)
                                            </SelectItem>
                                            <SelectItem value="480p-tri-ladder">
                                              480p Tri-ladder (1.5 Mbps × 2.8)
                                            </SelectItem>
                                            <SelectItem value="1080p-single">1080p Single (5 Mbps × 1)</SelectItem>
                                            <SelectItem value="720p-single">720p Single (3 Mbps × 1)</SelectItem>
                                            <SelectItem value="480p-single">480p Single (1.5 Mbps × 1)</SelectItem>
                                            <SelectItem value="4k-tri-ladder">4K Tri-ladder (15 Mbps × 2.8)</SelectItem>
                                            <SelectItem value="4k-single">4K Single (15 Mbps × 1)</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      <div className="flex flex-col space-y-1">
                                        <Label htmlFor={`retention-${channel.id}`} className="min-h-[1.5rem] text-xs">
                                          Avg. Retention (minutes)
                                        </Label>
                                        <Input
                                          id={`retention-${channel.id}`}
                                          type="number"
                                          min={0}
                                          step={1}
                                          inputMode="numeric"
                                          pattern="\d*"
                                          value={editingChannel.averageRetentionMinutes}
                                          onChange={(e) =>
                                            setEditingChannel({
                                              ...editingChannel,
                                              averageRetentionMinutes: Number(e.target.value),
                                            })
                                          }
                                          className="focus:outline-offset-2"
                                        />
                                      </div>

                                      <div className="flex flex-col space-y-1">
                                        <Label htmlFor={`adspots-${channel.id}`} className="min-h-[1.5rem] text-xs">
                                          Ad Spots per Hour
                                        </Label>
                                        <Input
                                          id={`adspots-${channel.id}`}
                                          type="number"
                                          min={0}
                                          step={1}
                                          inputMode="numeric"
                                          pattern="\d*"
                                          value={editingChannel.adSpotsPerHour}
                                          onChange={(e) =>
                                            setEditingChannel({
                                              ...editingChannel,
                                              adSpotsPerHour: Number(e.target.value),
                                            })
                                          }
                                          className="focus:outline-offset-2"
                                        />
                                      </div>

                                      <div className="flex flex-col space-y-1">
                                        <Label htmlFor={`cpm-${channel.id}`} className="min-h-[1.5rem] text-xs">
                                          CPM Rate ($)
                                        </Label>
                                        <Input
                                          id={`cpm-${channel.id}`}
                                          type="number"
                                          min={0}
                                          step={0.01}
                                          inputMode="decimal"
                                          value={editingChannel.cpmRate}
                                          onChange={(e) =>
                                            setEditingChannel({
                                              ...editingChannel,
                                              cpmRate: Number(e.target.value),
                                            })
                                          }
                                          className="focus:outline-offset-2"
                                        />
                                      </div>

                                      <div className="flex flex-col space-y-1">
                                        <Label htmlFor={`fillrate-${channel.id}`} className="min-h-[1.5rem] text-xs">
                                          Fill Rate (%)
                                        </Label>
                                        <Input
                                          id={`fillrate-${channel.id}`}
                                          type="number"
                                          min={0}
                                          max={100}
                                          step={1}
                                          inputMode="numeric"
                                          pattern="\d*"
                                          value={editingChannel.fillRate || defaultFillRate}
                                          onChange={(e) =>
                                            setEditingChannel({
                                              ...editingChannel,
                                              fillRate: Number(e.target.value),
                                            })
                                          }
                                          className="focus:outline-offset-2"
                                        />
                                      </div>

                                      <div className="flex flex-col space-y-1">
                                        <Label htmlFor={`livehours-${channel.id}`} className="min-h-[1.5rem] text-xs">
                                          Live Hours / Day
                                        </Label>
                                        <Input
                                          id={`livehours-${channel.id}`}
                                          type="number"
                                          min={0}
                                          max={24}
                                          step={1}
                                          inputMode="numeric"
                                          pattern="\d*"
                                          value={editingChannel.liveHours}
                                          onChange={(e) =>
                                            setEditingChannel({
                                              ...editingChannel,
                                              liveHours: Number(e.target.value),
                                            })
                                          }
                                          className="focus:outline-offset-2"
                                        />
                                      </div>
                                    </>
                                  ) : (
                                    // View mode - advanced fields
                                    <>
                                      <div>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">Encoding:</span>{" "}
                                        <span className="text-xs font-medium">
                                          {channel.encodingPreset || settings.encodingPreset || "Default"}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">Retention:</span>{" "}
                                        <span className="text-xs font-medium">
                                          {channel.averageRetentionMinutes} minutes
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">Ad Spots:</span>{" "}
                                        <span className="text-xs font-medium">{channel.adSpotsPerHour}/hour</span>
                                      </div>
                                      <div>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">CPM Rate:</span>{" "}
                                        <span className="text-xs font-medium">${channel.cpmRate.toFixed(2)}</span>
                                      </div>
                                      <div>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">Fill Rate:</span>{" "}
                                        <span className="text-xs font-medium">
                                          {channel.fillRate !== undefined ? channel.fillRate : defaultFillRate}%
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">Live Hours:</span>{" "}
                                        <span className="text-xs font-medium">{channel.liveHours}/day</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 dark:text-slate-400">
                  No channels added yet. Add a channel to track statistics.
                </div>
              )}

              {isAdding && (
                <div className="border rounded-md p-3 space-y-3 mt-4">
                  <h3 className="font-medium text-sm">Add New Channel</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="channelName" className="min-h-[1.5rem] text-xs">
                        Channel Name
                      </Label>
                      <Input
                        id="channelName"
                        value={newChannel.name}
                        onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                        placeholder="Main Channel"
                        className="h-8 text-sm focus:outline-offset-2"
                      />
                      {validationErrors.name && <p className="text-xs text-red-600 mt-1">{validationErrors.name}</p>}
                    </div>

                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="viewership" className="min-h-[1.5rem] text-xs">
                        Peak Concurrent Viewers
                      </Label>
                      <Input
                        id="viewership"
                        type="number"
                        min={0}
                        step={1}
                        inputMode="numeric"
                        pattern="\d*"
                        value={newChannel.viewership}
                        onChange={(e) => setNewChannel({ ...newChannel, viewership: Number(e.target.value) })}
                        className="h-8 text-sm focus:outline-offset-2"
                      />
                      {validationErrors.viewership && (
                        <p className="text-xs text-red-600 mt-1">{validationErrors.viewership}</p>
                      )}
                    </div>

                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="encodingPreset" className="min-h-[1.5rem] text-xs">
                        Encoding Preset
                      </Label>
                      <Select
                        value={newChannel.encodingPreset || settings.encodingPreset}
                        onValueChange={(value) => setNewChannel({ ...newChannel, encodingPreset: value })}
                      >
                        <SelectTrigger id="encodingPreset" className="h-8 text-sm focus:outline-offset-2">
                          <SelectValue placeholder="Select encoding preset" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1080p-tri-ladder">1080p Tri-ladder (5 Mbps × 2.8)</SelectItem>
                          <SelectItem value="720p-tri-ladder">720p Tri-ladder (3 Mbps × 2.8)</SelectItem>
                          <SelectItem value="480p-tri-ladder">480p Tri-ladder (1.5 Mbps × 2.8)</SelectItem>
                          <SelectItem value="1080p-single">1080p Single (5 Mbps × 1)</SelectItem>
                          <SelectItem value="720p-single">720p Single (3 Mbps × 1)</SelectItem>
                          <SelectItem value="480p-single">480p Single (1.5 Mbps × 1)</SelectItem>
                          <SelectItem value="4k-tri-ladder">4K Tri-ladder (15 Mbps × 2.8)</SelectItem>
                          <SelectItem value="4k-single">4K Single (15 Mbps × 1)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="retention" className="min-h-[1.5rem] text-xs">
                        Avg. Retention (minutes)
                      </Label>
                      <Input
                        id="retention"
                        type="number"
                        min={0}
                        step={1}
                        inputMode="numeric"
                        pattern="\d*"
                        value={newChannel.averageRetentionMinutes}
                        onChange={(e) =>
                          setNewChannel({ ...newChannel, averageRetentionMinutes: Number(e.target.value) })
                        }
                        className="h-8 text-sm focus:outline-offset-2"
                      />
                      {validationErrors.averageRetentionMinutes && (
                        <p className="text-xs text-red-600 mt-1">{validationErrors.averageRetentionMinutes}</p>
                      )}
                    </div>

                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="adSpots" className="min-h-[1.5rem] text-xs">
                        Ad Spots per Hour
                      </Label>
                      <Input
                        id="adSpots"
                        type="number"
                        min={0}
                        step={1}
                        inputMode="numeric"
                        pattern="\d*"
                        value={newChannel.adSpotsPerHour}
                        onChange={(e) => setNewChannel({ ...newChannel, adSpotsPerHour: Number(e.target.value) })}
                        className="h-8 text-sm focus:outline-offset-2"
                      />
                      {validationErrors.adSpotsPerHour && (
                        <p className="text-xs text-red-600 mt-1">{validationErrors.adSpotsPerHour}</p>
                      )}
                    </div>

                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="cpmRate" className="min-h-[1.5rem] text-xs">
                        CPM Rate ($)
                      </Label>
                      <Input
                        id="cpmRate"
                        type="number"
                        min={0}
                        step={0.01}
                        inputMode="decimal"
                        value={newChannel.cpmRate}
                        onChange={(e) => setNewChannel({ ...newChannel, cpmRate: Number(e.target.value) })}
                        className="h-8 text-sm focus:outline-offset-2"
                      />
                      {validationErrors.cpmRate && (
                        <p className="text-xs text-red-600 mt-1">{validationErrors.cpmRate}</p>
                      )}
                    </div>

                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="liveHours" className="min-h-[1.5rem] text-xs">
                          Live Hours / Day
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full p-0">
                                <Info className="h-3 w-3" />
                                <span className="sr-only">Live Hours Info</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Number of new live-stream hours you broadcast each 24h period.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Input
                        id="liveHours"
                        type="number"
                        min={0}
                        max={24}
                        step={1}
                        inputMode="numeric"
                        pattern="\d*"
                        value={newChannel.liveHours}
                        onChange={(e) => setNewChannel({ ...newChannel, liveHours: Number(e.target.value) })}
                        className="h-8 text-sm focus:outline-offset-2"
                      />
                      {validationErrors.liveHours && (
                        <p className="text-xs text-red-600 mt-1">{validationErrors.liveHours}</p>
                      )}
                    </div>

                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="channelEnabled" className="min-h-[1.5rem] text-xs">
                        Channel Enabled
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="channelEnabled"
                          checked={newChannel.enabled !== false}
                          onCheckedChange={(checked) => setNewChannel({ ...newChannel, enabled: checked })}
                          className="mr-2 focus:outline-offset-2"
                        />
                        <Label htmlFor="channelEnabled" className="text-xs">
                          {newChannel.enabled !== false ? "On" : "Off"}
                        </Label>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAdding(false)
                        setValidationErrors({})
                      }}
                      size="sm"
                      className="focus:outline-offset-2"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddChannel}
                      size="sm"
                      disabled={hasValidationErrors}
                      className="focus:outline-offset-2"
                    >
                      Add Channel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Live DVR Settings */}
            <div className="p-6 rounded-2xl shadow-sm space-y-4 bg-white dark:bg-slate-900">
              <h3 className="text-lg font-medium">DVR Settings</h3>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="liveDvrEnabled" className="min-h-[1.5rem]">
                    Live DVR Enabled?
                  </Label>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Allow viewers to rewind live streams</p>
                </div>
                <Switch
                  id="liveDvrEnabled"
                  checked={showDvrSettings}
                  onCheckedChange={(checked) => {
                    // Update both local state and parent state
                    setShowDvrSettings(checked)
                    updateSettings({ liveDvrEnabled: checked })
                  }}
                  className="focus:outline-offset-2"
                />
              </div>

              {/* Use AnimatePresence for smooth transitions */}
              <AnimatePresence>
                {showDvrSettings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-4 border-l-2 border-blue-200 dark:border-blue-900 space-y-1">
                      <Label htmlFor="recordingStorageLocation" className="min-h-[1.5rem]">
                        Recording Storage Location
                      </Label>
                      <Select
                        value={settings.recordingStorageLocation}
                        onValueChange={(value) => updateSettings({ recordingStorageLocation: value })}
                      >
                        <SelectTrigger id="recordingStorageLocation" className="focus:outline-offset-2">
                          <SelectValue placeholder="Select storage location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="same-as-vod">Same as VOD provider</SelectItem>
                          <SelectItem value="local-nas">Local-only (NAS)</SelectItem>
                          <SelectItem value="cloud-object">Cloud Object (R2/S3)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Where recordings are stored</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Summary Section */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg mt-4">
              <h3 className="text-sm font-medium mb-2">Channel Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Total Channels:</span>{" "}
                  <span className="font-medium">{settings.channels.filter((c) => c.enabled !== false).length}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Total Peak Viewers:</span>{" "}
                  <span className="font-medium">{totalPeakConcurrentViewers.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Default Encoding:</span>{" "}
                  <span className="font-medium">{settings.encodingPreset}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">DVR:</span>{" "}
                  <span className="font-medium">{settings.liveDvrEnabled ? "Enabled" : "Disabled"}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
