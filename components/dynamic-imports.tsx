"use client"

import dynamic from "next/dynamic"

// Simple loading component
const LoadingComponent = () => (
  <div className="h-64 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg"></div>
)

// Dynamically import the revenue vs cost component
export const DynamicRevenueVsCost = dynamic(() => import("./revenue-vs-cost").then((mod) => mod.RevenueVsCost), {
  loading: () => <LoadingComponent />,
  ssr: false,
})

// Dynamically import the analytics tab content
export const DynamicAnalyticsTabContent = dynamic(
  () => import("./analytics-tab-content").then((mod) => mod.AnalyticsTabContent),
  {
    loading: () => <LoadingComponent />,
    ssr: false,
  },
)

// Dynamically import the reference tab content
export const DynamicReferenceTabContent = dynamic(
  () => import("./reference-tab-content").then((mod) => mod.ReferenceTabContent),
  {
    loading: () => <LoadingComponent />,
    ssr: false,
  },
)

// Dynamically import the cost breakdown chart
export const DynamicCostBreakdownChart = dynamic(
  () => import("./cost-breakdown-chart").then((mod) => mod.CostBreakdownChart),
  {
    loading: () => <LoadingComponent />,
    ssr: false,
  },
)
