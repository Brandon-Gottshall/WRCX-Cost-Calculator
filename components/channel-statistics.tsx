"use client"

import { useState } from "react"
import { PlusCircle, Trash2, Edit, Save, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import type { ChannelStatistics } from "@/lib/types"

interface ChannelStatisticsProps {
  channels: ChannelStatistics[]
  updateChannels: (channels: ChannelStatistics[]) => void
}

export function ChannelStatisticsManager({ channels, updateChannels }: ChannelStatisticsProps) {
  const [editingChannel, setEditingChannel] = useState<ChannelStatistics | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newChannel, setNewChannel] = useState<Omit<ChannelStatistics, "id">>({
    name: "",
    viewership: 0,
    averageRetentionMinutes: 0,
    adSpotsPerHour: 0,
    cpmRate: 0,
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
    // Daily revenue = viewership * retention (hours) * ad spots per hour * CPM / 1000
    const dailyRevenue =
      (channel.viewership * (channel.averageRetentionMinutes / 60) * channel.adSpotsPerHour * channel.cpmRate) / 1000

    // Monthly revenue (30 days)
    return dailyRevenue * 30
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/30">
        <CardTitle>Channel Statistics</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {channels.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel Name</TableHead>
                  <TableHead className="text-right">Daily Viewers</TableHead>
                  <TableHead className="text-right">Avg. Retention (min)</TableHead>
                  <TableHead className="text-right">Ad Spots/Hour</TableHead>
                  <TableHead className="text-right">CPM Rate</TableHead>
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
                              setEditingChannel({ ...editingChannel, averageRetentionMinutes: Number(e.target.value) })
                            }
                            className="w-24 text-right ml-auto"
                          />
                        </TableCell>
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
                            onChange={(e) => setEditingChannel({ ...editingChannel, cpmRate: Number(e.target.value) })}
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
                        <TableCell>{channel.name}</TableCell>
                        <TableCell className="text-right">{channel.viewership.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{channel.averageRetentionMinutes}</TableCell>
                        <TableCell className="text-right">{channel.adSpotsPerHour}</TableCell>
                        <TableCell className="text-right">${channel.cpmRate.toFixed(2)}</TableCell>
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
                  <Label htmlFor="adSpots">Ad Spots per Hour</Label>
                  <Input
                    id="adSpots"
                    type="number"
                    value={newChannel.adSpotsPerHour}
                    onChange={(e) => setNewChannel({ ...newChannel, adSpotsPerHour: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpmRate">CPM Rate ($)</Label>
                  <Input
                    id="cpmRate"
                    type="number"
                    value={newChannel.cpmRate}
                    onChange={(e) => setNewChannel({ ...newChannel, cpmRate: Number(e.target.value) })}
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
