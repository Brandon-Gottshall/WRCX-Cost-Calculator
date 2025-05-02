"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

// Dynamic import for RevenueVsCost
export const DynamicRevenueVsCost = dynamic(
  () => import("@/components/revenue-vs-cost").then((mod) => ({ default: mod.RevenueVsCost })),
  {
    loading: () => <Skeleton className="h-64 w-full" />,
    ssr: false,
  },
)

// Dynamic import for AnalyticsTabContent
export const DynamicAnalyticsTabContent = dynamic(
  () => import("@/components/analytics-tab-content").then((mod) => ({ default: mod.AnalyticsTabContent })),
  {
    loading: () => <Skeleton className="h-64 w-full" />,
    ssr: false,
  },
)

// Dynamic import for ReferenceTabContent
export const DynamicReferenceTabContent = dynamic(
  () => import("@/components/reference-tab-content").then((mod) => ({ default: mod.ReferenceTabContent })),
  {
    loading: () => <Skeleton className="h-64 w-full" />,
    ssr: false,
  },
)
