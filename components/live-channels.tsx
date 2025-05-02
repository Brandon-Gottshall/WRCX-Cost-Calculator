"use client"

import { useState, useCallback, memo } from "react"
import { PlusCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ResponsiveChannelList } from "./responsive-channel-list"
import { VirtualizedChannelList } from "./virtualized-channel-list"
import { useMediaQuery } from "@/hooks/use-media-query"
import { PerformanceProfiler } from "./performance-profiler"
import type { ChannelStatistics, SettingsState } from "@/lib/types"

interface LiveChannelsProps {
  settings: SettingsState
  updateSettings: (settings: Partial<SettingsState>) => void
  validationResults: any[]
  isEdited?: (fieldPath: string) => boolean
}

// Use memo to prevent unnecessary re-renders
const LiveChannels = memo(function LiveChannels({
  settings,
  updateSettings,
  validationResults,
  isEdited,
}: LiveChannelsProps) {
  const [editingChannel, setEditingChannel] = useState<ChannelStatistics | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<Record<string, boolean>>({})
  const isMobile = useMediaQuery("(max-width: 768px)")

  const [newChannel, setNewChannel] = useState<Omit<ChannelStatistics, "id">>({
    name: "",
    viewership: 0,
    averageRetentionMinutes: 0,
    adSpotsPerHour: 0,
    cpmRate: 0,
    fillRate: settings.globalFillRate,
    liveHours: 8,
    vodUniques: 0,
    vodWatchMin: 0,
  })

  // Helper function to toggle advanced settings for a channel
  const toggleAdvancedSettings = useCallback((channelId: string) => {
    setShowAdvancedSettings((prev) => ({
      ...prev,
      [channelId]: !prev[channelId],
    }))
  }, [])

  // Helper function to toggle channel enabled state
  const toggleChannelEnabled = useCallback(
    (id: string, enabled: boolean) => {
      updateSettings({
        channels: settings.channels.map((ch) => (ch.id === id ? { ...ch, enabled } : ch)),
      })
    },
    [settings.channels, updateSettings],
  )

  // Helper function to calculate channel revenue
  const calculateChannelRevenue = useCallback(
    (channel: ChannelStatistics & { enabled?: boolean }) => {
      // Return 0 if channel is explicitly disabled
      if (channel.enabled === false) {
        return 0
      }

      // Daily revenue = viewership * retention (hours) * ad spots per hour * fill rate * CPM / 1000
      const fillRate = channel.fillRate !== undefined ? channel.fillRate / 100 : settings.globalFillRate / 100
      const dailyRevenue =
        (channel.viewership *
          (channel.averageRetentionMinutes / 60) *
          channel.adSpotsPerHour *
          fillRate *
          channel.cpmRate) /
        1000

      // Monthly revenue (30 days)
      return dailyRevenue * 30
    },
    [settings.globalFillRate],
  )

  // Helper function to determine if a field has been edited
  const isFieldValueEdited = useCallback(
    (channelId: string, fieldName: string) => {
      return isEdited ? isEdited(`channels.${channelId}.${fieldName}`) : false
    },
    [isEdited],
  )

  // Helper function to apply styling based on whether a field has been edited
  const getFieldStyle = useCallback(
    (channelId: string, fieldName: string) => {
      return isFieldValueEdited(channelId, fieldName) ? "font-bold" : "font-normal text-slate-500 italic"
    },
    [isFieldValueEdited],
  )

  const handleAddChannel = useCallback(() => {
    const channel: ChannelStatistics = {
      ...newChannel,
      id: `channel-${Date.now()}`,
    }
    updateSettings({ channels: [...(settings.channels || []), channel] })
    setNewChannel({
      name: "",
      viewership: 0,
      averageRetentionMinutes: 0,
      adSpotsPerHour: 0,
      cpmRate: 0,
      fillRate: settings.globalFillRate,
      liveHours: 8,
      vodUniques: 0,
      vodWatchMin: 0,
    })
    setIsAdding(false)
  }, [newChannel, settings.channels, settings.globalFillRate, updateSettings])

  const handleUpdateChannel = useCallback(() => {
    if (!editingChannel) return

    updateSettings({
      channels: settings.channels.map((channel) => (channel.id === editingChannel.id ? editingChannel : channel)),
    })
    setEditingChannel(null)
  }, [editingChannel, settings.channels, updateSettings])

  const handleDeleteChannel = useCallback(
    (id: string) => {
      updateSettings({
        channels: settings.channels.filter((channel) => channel.id !== id),
      })
    },
    [settings.channels, updateSettings],
  )

  return (
    <PerformanceProfiler id="LiveChannels">
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/30 px-3 sm:px-4 py-3">
          <CardTitle>Live Channels</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3 sm:space-y-4">
            {settings.channels && settings.channels.length > 0 ? (
              <>
                {/* Mobile view - card-based list */}
                {isMobile ? (
                  <ResponsiveChannelList
                    channels={settings.channels}
                    onEdit={setEditingChannel}
                    onDelete={handleDeleteChannel}
                    onToggleEnabled={toggleChannelEnabled}
                    onToggleAdvanced={toggleAdvancedSettings}
                    showAdvancedSettings={showAdvancedSettings}
                    calculateChannelRevenue={calculateChannelRevenue}
                    getFieldStyle={getFieldStyle}
                    defaultFillRate={settings.globalFillRate}
                  />
                ) : (
                  /* Desktop view - virtualized table */
                  <div className="hidden md:block h-[400px]">
                    <VirtualizedChannelList
                      channels={settings.channels}
                      onEdit={setEditingChannel}
                      onDelete={handleDeleteChannel}
                      onToggleEnabled={toggleChannelEnabled}
                      calculateChannelRevenue={calculateChannelRevenue}
                      getFieldStyle={getFieldStyle}
                      defaultFillRate={settings.globalFillRate}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6 text-slate-500 dark:text-slate-400">
                No channels added yet. Add a channel to track statistics.
              </div>
            )}

            {isAdding ? (
              <div className="border rounded-md p-3 space-y-3">
                <h3 className="font-medium text-sm">Add New Channel</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="channelName" className="text-xs">
                      Channel Name
                    </Label>
                    <Input
                      id="channelName"
                      value={newChannel.name}
                      onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                      placeholder="Main Channel"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="viewership" className="text-xs">
                      Daily Viewers
                    </Label>
                    <Input
                      id="viewership"
                      type="number"
                      min={0}
                      value={newChannel.viewership}
                      onChange={(e) => setNewChannel({ ...newChannel, viewership: Number(e.target.value) })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="liveHours" className="text-xs">
                      Live Hours / Day
                    </Label>
                    <Input
                      id="liveHours"
                      type="number"
                      min={0}
                      max={24}
                      step={0.5}
                      value={newChannel.liveHours}
                      onChange={(e) => setNewChannel({ ...newChannel, liveHours: Number(e.target.value) })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="encodingPreset" className="text-xs">
                      Encoding Preset
                    </Label>
                    <Select
                      value={newChannel.encodingPreset}
                      onValueChange={(value) => setNewChannel({ ...newChannel, encodingPreset: value })}
                    >
                      <SelectTrigger id="encodingPreset" className="h-8 text-xs">
                        <SelectValue placeholder="Use default" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Use default</SelectItem>
                        <SelectItem value="1080p-tri-ladder">1080p Tri-ladder</SelectItem>
                        <SelectItem value="720p-tri-ladder">720p Tri-ladder</SelectItem>
                        <SelectItem value="1080p-single">1080p Single</SelectItem>
                        <SelectItem value="720p-single">720p Single</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="averageRetentionMinutes" className="text-xs">
                      Avg. Retention (minutes)
                    </Label>
                    <Input
                      id="averageRetentionMinutes"
                      type="number"
                      min={0}
                      value={newChannel.averageRetentionMinutes}
                      onChange={(e) =>
                        setNewChannel({ ...newChannel, averageRetentionMinutes: Number(e.target.value) })
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="adSpotsPerHour" className="text-xs">
                      Ad Spots per Hour
                    </Label>
                    <Input
                      id="adSpotsPerHour"
                      type="number"
                      min={0}
                      value={newChannel.adSpotsPerHour}
                      onChange={(e) => setNewChannel({ ...newChannel, adSpotsPerHour: Number(e.target.value) })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cpmRate" className="text-xs">
                      CPM Rate ($)
                    </Label>
                    <Input
                      id="cpmRate"
                      type="number"
                      min={0}
                      step={0.01}
                      value={newChannel.cpmRate}
                      onChange={(e) => setNewChannel({ ...newChannel, cpmRate: Number(e.target.value) })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="fillRate" className="text-xs">
                      Fill Rate (%)
                    </Label>
                    <Input
                      id="fillRate"
                      type="number"
                      min={0}
                      max={100}
                      value={newChannel.fillRate}
                      onChange={(e) => setNewChannel({ ...newChannel, fillRate: Number(e.target.value) })}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsAdding(false)}
                    size="sm"
                    className="focus:outline-offset-2"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddChannel} size="sm" className="focus:outline-offset-2">
                    Add Channel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={() => setIsAdding(true)}
                size="sm"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Channel</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </PerformanceProfiler>
  )
})

export { LiveChannels }
