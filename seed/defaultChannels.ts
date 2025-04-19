import type { ChannelStatistics } from "@/lib/types"

export const defaultChannels: ChannelStatistics[] = [
  {
    id: "40.1",
    name: "40.1 Independent",
    viewership: 1000, // dailyUniques
    averageRetentionMinutes: 15, // avgWatchMin
    adSpotsPerHour: 20,
    cpmRate: 3.0, // netCpm
    fillRate: 35,
    liveHours: 5,
    vodUniques: 100,
    vodWatchMin: 12,
  },
  {
    id: "40.2",
    name: "40.2 Defy",
    viewership: 1500, // dailyUniques
    averageRetentionMinutes: 18, // avgWatchMin
    adSpotsPerHour: 14,
    cpmRate: 5.0, // netCpm
    fillRate: 40,
    liveHours: 2,
    vodUniques: 50,
    vodWatchMin: 10,
  },
  {
    id: "40.3",
    name: "40.3 The365",
    viewership: 1500, // dailyUniques
    averageRetentionMinutes: 18, // avgWatchMin
    adSpotsPerHour: 14,
    cpmRate: 5.0, // netCpm
    fillRate: 40,
    liveHours: 2,
    vodUniques: 50,
    vodWatchMin: 10,
  },
  {
    id: "40.4",
    name: "40.4 Music",
    viewership: 300, // dailyUniques
    averageRetentionMinutes: 8, // avgWatchMin
    adSpotsPerHour: 6,
    cpmRate: 2.0, // netCpm
    fillRate: 15,
    liveHours: 0,
    vodUniques: 0,
    vodWatchMin: 0,
  },
  {
    id: "40.5",
    name: "40.5 UrbanTS",
    viewership: 1000, // dailyUniques
    averageRetentionMinutes: 15, // avgWatchMin
    adSpotsPerHour: 20,
    cpmRate: 4.0, // netCpm
    fillRate: 35,
    liveHours: 3,
    vodUniques: 50,
    vodWatchMin: 10,
  },
  {
    id: "40.6",
    name: "40.6 Simul",
    viewership: 300, // dailyUniques
    averageRetentionMinutes: 15, // avgWatchMin
    adSpotsPerHour: 20,
    cpmRate: 3.0, // netCpm
    fillRate: 35,
    liveHours: 0,
    vodUniques: 0,
    vodWatchMin: 0,
  },
]
