"use client"

import { useState } from "react"
import { PlusCircle, Save, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"
import { ResponsiveChannelList } from "./responsive-channel-list"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { ChannelStatistics, SettingsState } from "@/lib/types"

interface LiveChannelsProps {
  settings: SettingsState
  updateSettings: (settings: Partial<SettingsState>) => void
  validationResults: any[]
  isEdited?: (fieldPath: string) => boolean
}

export function LiveChannels({ settings, updateSettings, validationResults, isEdited }: LiveChannelsProps) {
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
  const toggleAdvancedSettings = (channelId: string) => {
    setShowAdvancedSettings((prev) => ({
      ...prev,
      [channelId]: !prev[channelId],
    }))
  }

  // Helper function to toggle channel enabled state
  const toggleChannelEnabled = (id: string, enabled: boolean) => {
    const updatedChannels = settings.channels.map((ch) => (ch.id === id ? { ...ch, enabled } : ch))
    updateSettings({ channels: updatedChannels })
  }

  // Helper function to calculate channel revenue
  const calculateChannelRevenue = (channel: ChannelStatistics & { enabled?: boolean }) => {
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
  }

  // Helper function to determine if a field has been edited
  const isFieldValueEdited = (channelId: string, fieldName: string) => {
    return isEdited ? isEdited(`channels.${channelId}.${fieldName}`) : false
  }

  // Helper function to apply styling based on whether a field has been edited
  const getFieldStyle = (channelId: string, fieldName: string) => {
    return isFieldValueEdited(channelId, fieldName) ? "font-bold" : "font-normal text-slate-500 italic"
  }

  const handleAddChannel = () => {
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
  }

  const handleUpdateChannel = () => {
    if (!editingChannel) return

    updateSettings({
      channels: settings.channels.map((channel) => (channel.id === editingChannel.id ? editingChannel : channel)),
    })
    setEditingChannel(null)
  }

  const handleDeleteChannel = (id: string) => {
    updateSettings({ channels: settings.channels.filter((channel) => channel.id !== id) })
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/30 px-3 sm:px-4 py-3">
        <CardTitle>Live Channels</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-3 sm:space-y-4">
          {settings.channels && settings.channels.length > 0 ? (
            <>
              {/* Mobile view - card-based list */}
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

              {/* Desktop view - table */}
              <div className="hidden md:block overflow-x-auto -mx-2 px-2">
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
                        Live Hours
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {settings.channels.map((channel) => (
                      <tr key={channel.id} className={channel.enabled === false ? "opacity-60" : ""}>
                        {editingChannel?.id === channel.id ? (
                          // Editing mode
                          <>
                            <td className="px-4 py-2">
                              <Switch
                                checked={editingChannel.enabled !== false}
                                onCheckedChange={(checked) =>
                                  setEditingChannel({ ...editingChannel, enabled: checked })
                                }
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
                            <td className="px-4 py-2">
                              <Input
                                type="number"
                                min={0}
                                max={24}
                                step={0.5}
                                value={editingChannel.liveHours}
                                onChange={(e) =>
                                  setEditingChannel({ ...editingChannel, liveHours: Number(e.target.value) })
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
                                  onCheckedChange={(checked) => toggleChannelEnabled(channel.id, checked)}
                                  className="scale-75 focus:outline-offset-2"
                                  aria-label={`Toggle ${channel.name} channel`}
                                />
                              </div>
                            </td>
                            <td className={`px-4 py-2 text-xs sm:text-sm ${getFieldStyle(channel.id, "name")}`}>
                              {channel.name}
                            </td>
                            <td
                              className={`px-4 py-2 text-right text-xs sm:text-sm ${getFieldStyle(
                                channel.id,
                                "viewership",
                              )}`}
                            >
                              {channel.viewership.toLocaleString()}
                            </td>
                            <td
                              className={`px-4 py-2 text-right text-xs sm:text-sm ${getFieldStyle(
                                channel.id,
                                "liveHours",
                              )}`}
                            >
                              {channel.liveHours}/day
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
                                  <span className="sr-only">Edit channel</span>
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
                                    className="h-3 w-3"
                                  >
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                                    <path d="m15 5 4 4"></path>
                                  </svg>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteChannel(channel.id)}
                                  className="h-7 w-7 p-0 focus:outline-offset-2"
                                >
                                  <span className="sr-only">Delete channel</span>
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
                                    className="h-3 w-3"
                                  >
                                    <path d="M3 6h18"></path>
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                    <line x1="10" x2="10" y1="11" y2="17"></line>
                                    <line x1="14" x2="14" y1="11" y2="17"></line>
                                  </svg>
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
                    onChange={(e) => setNewChannel({ ...newChannel, averageRetentionMinutes: Number(e.target.value) })}
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
  )
}
