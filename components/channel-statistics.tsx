"use client"

import { useState } from "react"
import { PlusCircle, Trash2, Edit, Save, X, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { formatCurrency } from "@/lib/utils"
import type { ChannelStatistics } from "@/lib/types"

interface ChannelStatisticsProps {
  channels: ChannelStatistics[]
  updateChannels: (channels: ChannelStatistics[]) => void
  defaultFillRate?: number
  isEdited?: (fieldPath: string) => boolean
}

export function ChannelStatisticsManager({
  channels,
  updateChannels,
  defaultFillRate = 100,
  isEdited,
}: ChannelStatisticsProps) {
  const [editingChannel, setEditingChannel] = useState<ChannelStatistics | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [newChannel, setNewChannel] = useState<Omit<ChannelStatistics, "id">>({
    name: "",
    viewership: 0,
    averageRetentionMinutes: 0,
    adSpotsPerHour: 0,
    cpmRate: 0,
    fillRate: defaultFillRate,
    liveHours: 8, // Default to 8 hours of live content per day
    vodUniques: 0,
    vodWatchMin: 0,
  })

  const handleAddChannel = () => {
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
    })
    setIsAdding(false)
  }

  const handleUpdateChannel = () => {
    if (!editingChannel) return

    updateChannels(channels.map((channel) => (channel.id === editingChannel.id ? editingChannel : channel)))
    setEditingChannel(null)
  }

  const handleDeleteChannel = (id: string) => {
    updateChannels(channels.filter((channel) => channel.id !== id))
  }

  const calculateChannelRevenue = (channel: ChannelStatistics) => {
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

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/30">
        <div className="flex items-center justify-between">
          <CardTitle>Channel Statistics</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Advanced</span>
            <Switch checked={showAdvanced} onCheckedChange={setShowAdvanced} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {channels.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Channel Name</TableHead>
                    <TableHead className="text-right">Daily Viewers</TableHead>
                    <TableHead className="text-right">Avg. Retention (min)</TableHead>
                    <TableHead className="text-right">Live Hours/Day</TableHead>
                    {showAdvanced && <TableHead className="text-right">Fill Rate (%)</TableHead>}
                    <TableHead className="text-right">Ad Spots/Hour</TableHead>
                    <TableHead className="text-right">CPM Rate</TableHead>
                    <TableHead className="text-right">Daily VOD Viewers</TableHead>
                    <TableHead className="text-right">Avg VOD Watch (min)</TableHead>
                    <TableHead className="text-right">Est. Monthly Revenue</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {channels.map((channel) => (
                    <TableRow key={channel.id}>
                      {editingChannel?.id === channel.id ? (
                        // Editing mode
                        <>
                          <TableCell>
                            <Input
                              value={editingChannel.name}
                              onChange={(e) => setEditingChannel({ ...editingChannel, name: e.target.value })}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              value={editingChannel.viewership}
                              onChange={(e) =>
                                setEditingChannel({ ...editingChannel, viewership: Number(e.target.value) })
                              }
                              className="w-24 text-right ml-auto"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              value={editingChannel.averageRetentionMinutes}
                              onChange={(e) =>
                                setEditingChannel({
                                  ...editingChannel,
                                  averageRetentionMinutes: Number(e.target.value),
                                })
                              }
                              className="w-24 text-right ml-auto"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min={0}
                              max={24}
                              value={editingChannel.liveHours}
                              onChange={(e) =>
                                setEditingChannel({ ...editingChannel, liveHours: Number(e.target.value) })
                              }
                              className="w-24 text-right ml-auto"
                            />
                          </TableCell>
                          {showAdvanced && (
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={
                                  editingChannel.fillRate !== undefined ? editingChannel.fillRate : defaultFillRate
                                }
                                onChange={(e) =>
                                  setEditingChannel({ ...editingChannel, fillRate: Number(e.target.value) })
                                }
                                className="w-24 text-right ml-auto"
                                placeholder={`Default (${defaultFillRate}%)`}
                              />
                            </TableCell>
                          )}
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              value={editingChannel.adSpotsPerHour}
                              onChange={(e) =>
                                setEditingChannel({ ...editingChannel, adSpotsPerHour: Number(e.target.value) })
                              }
                              className="w-24 text-right ml-auto"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              value={editingChannel.cpmRate}
                              onChange={(e) =>
                                setEditingChannel({ ...editingChannel, cpmRate: Number(e.target.value) })
                              }
                              className="w-24 text-right ml-auto"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min={0}
                              value={editingChannel.vodUniques}
                              onChange={(e) =>
                                setEditingChannel({ ...editingChannel, vodUniques: Number(e.target.value) })
                              }
                              className="w-24 text-right ml-auto"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min={0}
                              value={editingChannel.vodWatchMin}
                              onChange={(e) =>
                                setEditingChannel({ ...editingChannel, vodWatchMin: Number(e.target.value) })
                              }
                              className="w-24 text-right ml-auto"
                            />
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(calculateChannelRevenue(editingChannel))}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={handleUpdateChannel}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingChannel(null)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        // View mode
                        <>
                          <TableCell className={getFieldStyle(channel.id, "name")}>{channel.name}</TableCell>
                          <TableCell className={`text-right ${getFieldStyle(channel.id, "viewership")}`}>
                            {channel.viewership.toLocaleString()}
                          </TableCell>
                          <TableCell className={`text-right ${getFieldStyle(channel.id, "averageRetentionMinutes")}`}>
                            {channel.averageRetentionMinutes}
                          </TableCell>
                          <TableCell className={`text-right ${getFieldStyle(channel.id, "liveHours")}`}>
                            {channel.liveHours}
                          </TableCell>
                          {showAdvanced && (
                            <TableCell className={`text-right ${getFieldStyle(channel.id, "fillRate")}`}>
                              {channel.fillRate !== undefined
                                ? `${channel.fillRate}%`
                                : `${defaultFillRate}% (default)`}
                            </TableCell>
                          )}
                          <TableCell className={`text-right ${getFieldStyle(channel.id, "adSpotsPerHour")}`}>
                            {channel.adSpotsPerHour}
                          </TableCell>
                          <TableCell className={`text-right ${getFieldStyle(channel.id, "cpmRate")}`}>
                            ${channel.cpmRate.toFixed(2)}
                          </TableCell>
                          <TableCell className={`text-right ${getFieldStyle(channel.id, "vodUniques")}`}>
                            {channel.vodUniques.toLocaleString()}
                          </TableCell>
                          <TableCell className={`text-right ${getFieldStyle(channel.id, "vodWatchMin")}`}>
                            {channel.vodWatchMin}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(calculateChannelRevenue(channel))}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => setEditingChannel(channel)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteChannel(channel.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No channels added yet. Add a channel to track statistics.
            </div>
          )}

          {isAdding ? (
            <div className="border rounded-md p-4 space-y-4">
              <h3 className="font-medium">Add New Channel</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="channelName">Channel Name</Label>
                  <Input
                    id="channelName"
                    value={newChannel.name}
                    onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                    placeholder="Main Channel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="viewership">Daily Viewers</Label>
                  <Input
                    id="viewership"
                    type="number"
                    value={newChannel.viewership}
                    onChange={(e) => setNewChannel({ ...newChannel, viewership: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retention">Avg. Retention (minutes)</Label>
                  <Input
                    id="retention"
                    type="number"
                    value={newChannel.averageRetentionMinutes}
                    onChange={(e) => setNewChannel({ ...newChannel, averageRetentionMinutes: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="liveHours">Live Hours / Day</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full p-0">
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
                    value={newChannel.liveHours}
                    onChange={(e) => setNewChannel({ ...newChannel, liveHours: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adSpots">Ad Spots per Hour</Label>
                  <Input
                    id="adSpots"
                    type="number"
                    value={newChannel.adSpotsPerHour}
                    onChange={(e) => setNewChannel({ ...newChannel, adSpotsPerHour: Number(e.target.value) })}
                  />
                </div>
                {showAdvanced && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="fillRate">Fill Rate (%)</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full p-0">
                              <Info className="h-3 w-3" />
                              <span className="sr-only">Fill Rate Info</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              % of planned ad slots that are actually sold & delivered (0-100).
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="fillRate"
                      type="number"
                      min={0}
                      max={100}
                      value={newChannel.fillRate !== undefined ? newChannel.fillRate : defaultFillRate}
                      onChange={(e) => setNewChannel({ ...newChannel, fillRate: Number(e.target.value) })}
                      placeholder={`Default (${defaultFillRate}%)`}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="cpmRate">CPM Rate ($)</Label>
                  <Input
                    id="cpmRate"
                    type="number"
                    value={newChannel.cpmRate}
                    onChange={(e) => setNewChannel({ ...newChannel, cpmRate: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="vodUniques">Daily VOD Viewers</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full p-0">
                            <Info className="h-3 w-3" />
                            <span className="sr-only">VOD Viewers Info</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Unique viewers who watch on-demand content each day.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="vodUniques"
                    type="number"
                    min={0}
                    value={newChannel.vodUniques}
                    onChange={(e) => setNewChannel({ ...newChannel, vodUniques: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="vodWatchMin">Avg VOD Watch Time (min)</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full p-0">
                            <Info className="h-3 w-3" />
                            <span className="sr-only">VOD Watch Time Info</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Average minutes each VOD viewer watches per session.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="vodWatchMin"
                    type="number"
                    min={0}
                    value={newChannel.vodWatchMin}
                    onChange={(e) => setNewChannel({ ...newChannel, vodWatchMin: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddChannel}>Add Channel</Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" className="w-full flex items-center gap-2" onClick={() => setIsAdding(true)}>
              <PlusCircle className="h-4 w-4" />
              <span>Add Channel</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
