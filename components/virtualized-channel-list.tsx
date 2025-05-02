"use client"

import { useEffect } from "react"

import type React from "react"

import { useCallback, useRef, useState } from "react"
import { FixedSizeList as List } from "react-window"
import AutoSizer from "react-virtualized-auto-sizer"
import { Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { formatCurrency } from "@/lib/utils"
import type { ChannelStatistics } from "@/lib/types"

interface VirtualizedChannelListProps {
  channels: ChannelStatistics[]
  onEdit: (channel: ChannelStatistics) => void
  onDelete: (id: string) => void
  onToggleEnabled: (id: string, enabled: boolean) => void
  calculateChannelRevenue: (channel: ChannelStatistics & { enabled?: boolean }) => number
  getFieldStyle: (channelId: string, fieldName: string) => string
  defaultFillRate: number
}

export function VirtualizedChannelList({
  channels,
  onEdit,
  onDelete,
  onToggleEnabled,
  calculateChannelRevenue,
  getFieldStyle,
  defaultFillRate,
}: VirtualizedChannelListProps) {
  // Use a ref to store expanded state for each channel
  const expandedChannelsRef = useRef<Record<string, boolean>>({})

  // Memoize row renderer for better performance
  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const channel = channels[index]
      const isExpanded = expandedChannelsRef.current[channel.id] || false

      return (
        <div
          style={style}
          className={`flex items-center px-4 py-2 ${index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800/50"} ${channel.enabled === false ? "opacity-60" : ""}`}
        >
          <div className="flex items-center w-10">
            <Switch
              checked={channel.enabled !== false}
              onCheckedChange={(checked) => onToggleEnabled(channel.id, checked)}
              className="scale-75 focus:outline focus:outline-offset-2"
              aria-label={`Toggle ${channel.name} channel`}
            />
          </div>
          <div className={`flex-1 ${getFieldStyle(channel.id, "name")}`}>{channel.name}</div>
          <div className={`w-24 text-right ${getFieldStyle(channel.id, "viewership")}`}>
            {channel.viewership.toLocaleString()}
          </div>
          <div className={`w-24 text-right ${getFieldStyle(channel.id, "liveHours")}`}>{channel.liveHours}/day</div>
          <div className="w-24 text-right font-mono">{formatCurrency(calculateChannelRevenue(channel))}</div>
          <div className="w-24 flex justify-end gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                expandedChannelsRef.current[channel.id] = !isExpanded
                // Force re-render
                document.dispatchEvent(new Event("force-rerender"))
              }}
              className="h-7 w-7 p-0 focus:outline-offset-2"
            >
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              <span className="sr-only">{isExpanded ? "Less" : "More"}</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(channel)}
              className="h-7 w-7 p-0 focus:outline-offset-2"
            >
              <Edit className="h-3 w-3" />
              <span className="sr-only">Edit channel</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(channel.id)}
              className="h-7 w-7 p-0 focus:outline-offset-2"
            >
              <Trash2 className="h-3 w-3" />
              <span className="sr-only">Delete channel</span>
            </Button>
          </div>

          {isExpanded && (
            <div className="absolute left-0 right-0 top-full bg-gray-50 dark:bg-gray-800/50 p-2 border-t border-gray-200 dark:border-gray-700 z-10">
              <div className="grid grid-cols-3 gap-2 text-xs">
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
            </div>
          )}
        </div>
      )
    },
    [channels, onEdit, onDelete, onToggleEnabled, calculateChannelRevenue, getFieldStyle, defaultFillRate],
  )

  // Force re-render when expanded state changes
  const [, setForceUpdate] = useState({})
  useEffect(() => {
    const handleForceRerender = () => setForceUpdate({})
    document.addEventListener("force-rerender", handleForceRerender)
    return () => document.removeEventListener("force-rerender", handleForceRerender)
  }, [])

  return (
    <div className="h-[400px] w-full">
      <div className="flex items-center px-4 py-2 bg-gray-50 dark:bg-gray-800 sticky top-0 font-medium text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        <div className="w-10">On</div>
        <div className="flex-1">Channel</div>
        <div className="w-24 text-right">Viewers</div>
        <div className="w-24 text-right">Live Hours</div>
        <div className="w-24 text-right">Revenue</div>
        <div className="w-24 text-right">Actions</div>
      </div>

      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height - 36} // Subtract header height
            itemCount={channels.length}
            itemSize={40}
            width={width}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  )
}
