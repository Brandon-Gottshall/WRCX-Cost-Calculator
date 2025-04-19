import type { ChannelStatistics } from "@/lib/types"

export const defaultChannels: ChannelStatistics[] = [
  {
    id: "40.1",
    name: "40.1 Independent",
    viewership: 25, // dailyUniques
    averageRetentionMinutes: 15, // avgWatchMin
    adSpotsPerHour: 6,
    cpmRate: 1.0, // netCpm
    fillRate: 5,
    liveHours: 0,
    vodUniques: 1,
    vodWatchMin: 2,
  },
  {
    id: "40.2",
    name: "40.2 Defy",
    viewership: 40, // dailyUniques
    averageRetentionMinutes: 20, // avgWatchMin
    adSpotsPerHour: 4,
    cpmRate: 1.5, // netCpm
    fillRate: 8,
    liveHours: 0,
    vodUniques: 0,
    vodWatchMin: 0,
  },
  {
    id: "40.3",
    name: "40.3 The365",
    viewership: 40, // dailyUniques
    averageRetentionMinutes: 20, // avgWatchMin
    adSpotsPerHour: 4,
    cpmRate: 1.5, // netCpm
    fillRate: 8,
    liveHours: 0,
    vodUniques: 0,
    vodWatchMin: 0,
  },
  {
    id: "40.4",
    name: "40.4 Music",
    viewership: 15, // dailyUniques
    averageRetentionMinutes: 10, // avgWatchMin
    adSpotsPerHour: 6,
    cpmRate: 0.75, // netCpm
    fillRate: 3,
    liveHours: 0,
    vodUniques: 0,
    vodWatchMin: 0,
  },
  {
    id: "40.5",
    name: "40.5 UrbanTS",
    viewership: 30, // dailyUniques
    averageRetentionMinutes: 18, // avgWatchMin
    adSpotsPerHour: 5,
    cpmRate: 1.25, // netCpm
    fillRate: 6,
    liveHours: 0,
    vodUniques: 0,
    vodWatchMin: 0,
  },
  {
    id: "40.6",
    name: "40.6 Simul",
    viewership: 5, // dailyUniques
    averageRetentionMinutes: 15, // avgWatchMin
    adSpotsPerHour: 0,
    cpmRate: 0.0, // netCpm
    fillRate: 0,
    liveHours: 0,
    vodUniques: 0,
    vodWatchMin: 0,
  },
]
