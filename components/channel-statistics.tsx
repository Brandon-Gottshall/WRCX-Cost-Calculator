"use client"

import { useState } from "react"
import { PlusCircle, Trash2, Edit, Save, X, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { formatCurrency } from "@/lib/utils"
import { EnhancedValidatedInput } from "./enhanced-validated-input"
import { SectionCard } from "./section-card"
import type { ChannelStatistics } from "@/lib/types"

interface ChannelStatisticsProps {
  channels: ChannelStatistics[]
  updateChannels: (channels: ChannelStatistics[]) => void
  defaultFillRate?: number
  isEdited?: (fieldPath: string) => boolean
}

// Add this helper type to handle the enabled property
type ExtendedChannelStatistics = ChannelStatistics & {
  enabled?: boolean
}

export function ChannelStatisticsManager({
  channels,
  updateChannels,
  defaultFillRate = 100,
  isEdited,
}: ChannelStatisticsProps) {
  const [editingChannel, setEditingChannel] = useState<ExtendedChannelStatistics | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newChannel, setNewChannel] = useState<Omit<ExtendedChannelStatistics, "id">>({
    name: "",
    viewership: 0,
    averageRetentionMinutes: 0,
    adSpotsPerHour: 0,
    cpmRate: 0,
    fillRate: defaultFillRate,
    liveHours: 8, // Default to 8 hours of live content per day
    vodUniques: 0,
    vodWatchMin: 0,
    enabled: true, // Default to enabled
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const handleAddChannel = () => {
    // Validate before adding
    if (!validateNewChannel()) return

    const channel: ChannelStatistics = {
      ...newChannel,
      id: `channel-${Date.now()}`,
    }
    updateChannels([...channels, channel])
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
    })
    setIsAdding(false)
    setValidationErrors({})
  }

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

  const handleUpdateChannel = () => {
    if (!editingChannel) return

    updateChannels(channels.map((channel) => (channel.id === editingChannel.id ? editingChannel : channel)))
    setEditingChannel(null)
  }

  const handleDeleteChannel = (id: string) => {
    updateChannels(channels.filter((channel) => channel.id !== id))
  }

  const calculateChannelRevenue = (channel: ExtendedChannelStatistics) => {
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

  const hasValidationErrors = Object.keys(validationErrors).length > 0

  return (
    <SectionCard title="Channel Statistics">
      <div className="space-y-3 sm:space-y-4">
        {channels.length > 0 ? (
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
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Add Channel</span>
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {channels.map((channel) => (
                  <tr key={channel.id} className={channel.enabled === false ? "opacity-60" : ""}>
                    {editingChannel?.id === channel.id ? (
                      // Editing mode
                      <>
                        <td className="px-4 py-2">
                          <Switch
                            checked={editingChannel.enabled !== false}
                            onCheckedChange={(checked) => setEditingChannel({ ...editingChannel, enabled: checked })}
                            className="scale-75"
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
                                const updatedChannels = channels.map((ch) =>
                                  ch.id === channel.id ? { ...ch, enabled: checked } : ch,
                                )
                                updateChannels(updatedChannels)
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
          <div className="border rounded-md p-3 space-y-3">
            <h3 className="font-medium text-sm">Add New Channel</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <EnhancedValidatedInput
                id="channelName"
                label="Channel Name"
                value={newChannel.name}
                onChange={(value) => setNewChannel({ ...newChannel, name: value })}
                placeholder="Main Channel"
                className="h-8 text-sm"
                error={validationErrors.name}
                required
              />

              <EnhancedValidatedInput
                id="viewership"
                label="Daily Viewers"
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                pattern="\d*"
                value={newChannel.viewership}
                onChange={(value) => setNewChannel({ ...newChannel, viewership: Number(value) })}
                className="h-8 text-sm"
                error={validationErrors.viewership}
              />

              <EnhancedValidatedInput
                id="retention"
                label="Avg. Retention (minutes)"
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                pattern="\d*"
                value={newChannel.averageRetentionMinutes}
                onChange={(value) => setNewChannel({ ...newChannel, averageRetentionMinutes: Number(value) })}
                className="h-8 text-sm"
                error={validationErrors.averageRetentionMinutes}
              />

              <EnhancedValidatedInput
                id="adSpots"
                label="Ad Spots per Hour"
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                pattern="\d*"
                value={newChannel.adSpotsPerHour}
                onChange={(value) => setNewChannel({ ...newChannel, adSpotsPerHour: Number(value) })}
                className="h-8 text-sm"
                error={validationErrors.adSpotsPerHour}
              />

              <EnhancedValidatedInput
                id="cpmRate"
                label="CPM Rate ($)"
                type="number"
                min={0}
                step={0.01}
                inputMode="decimal"
                value={newChannel.cpmRate}
                onChange={(value) => setNewChannel({ ...newChannel, cpmRate: Number(value) })}
                className="h-8 text-sm"
                error={validationErrors.cpmRate}
              />

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
              <Button variant="outline" onClick={() => setIsAdding(false)} size="sm" className="focus:outline-offset-2">
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
    </SectionCard>
  )
}

export default ChannelStatisticsManager
