"use client"
import { Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ChannelStatistics } from "@/lib/types"

interface ResponsiveChannelListProps {
  channels: ChannelStatistics[]
  onEdit: (channel: ChannelStatistics) => void
  onDelete: (id: string) => void
  onToggleEnabled: (id: string, enabled: boolean) => void
  onToggleAdvanced: (id: string) => void
  showAdvancedSettings: Record<string, boolean>
  calculateChannelRevenue: (channel: ChannelStatistics & { enabled?: boolean }) => number
  getFieldStyle: (channelId: string, fieldName: string) => string
  defaultFillRate: number
}

export function ResponsiveChannelList({
  channels,
  onEdit,
  onDelete,
  onToggleEnabled,
  onToggleAdvanced,
  showAdvancedSettings,
  calculateChannelRevenue,
  getFieldStyle,
  defaultFillRate,
}: ResponsiveChannelListProps) {
  return (
    <ul className="space-y-4 md:hidden">
      {channels.map((channel) => (
        <li key={channel.id}>
          <Card className={channel.enabled === false ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={channel.enabled !== false}
                    onCheckedChange={(checked) => onToggleEnabled(channel.id, checked)}
                    className="scale-75 focus:outline focus:outline-offset-2"
                    aria-label={`Toggle ${channel.name} channel`}
                  />
                  <h3 className={`font-medium ${getFieldStyle(channel.id, "name")}`}>{channel.name}</h3>
                </div>
                <Badge variant="outline" className="ml-auto mr-2">
                  {channel.viewership.toLocaleString()} viewers
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Revenue:</span>{" "}
                  <span className="font-mono">{formatCurrency(calculateChannelRevenue(channel))}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Live Hours:</span>{" "}
                  <span>{channel.liveHours}/day</span>
                </div>
              </div>

              {showAdvancedSettings[channel.id] && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Encoding:</span>{" "}
                    <span className="font-medium">{channel.encodingPreset || "Default"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Retention:</span>{" "}
                    <span className="font-medium">{channel.averageRetentionMinutes} min</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Ad Spots:</span>{" "}
                    <span className="font-medium">{channel.adSpotsPerHour}/hour</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">CPM Rate:</span>{" "}
                    <span className="font-medium">${channel.cpmRate.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Fill Rate:</span>{" "}
                    <span className="font-medium">
                      {channel.fillRate !== undefined ? channel.fillRate : defaultFillRate}%
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-1 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onToggleAdvanced(channel.id)}
                  className="h-9 p-3 focus:outline focus:outline-offset-2"
                  aria-expanded={showAdvancedSettings[channel.id] ? "true" : "false"}
                  aria-controls={`advanced-settings-mobile-${channel.id}`}
                >
                  {showAdvancedSettings[channel.id] ? (
                    <ChevronUp className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  )}
                  <span>{showAdvancedSettings[channel.id] ? "Less" : "More"}</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(channel)}
                  className="h-9 p-3 focus:outline focus:outline-offset-2"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  <span>Edit</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(channel.id)}
                  className="h-9 p-3 focus:outline focus:outline-offset-2"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  <span>Delete</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  )
}
