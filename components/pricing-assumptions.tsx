"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { Platform } from "@/lib/types"

// Define pricing assumptions for each platform
const pricingAssumptions = {
  mux: {
    encoding: [
      { label: "1080p Live Encoding (Plus)", value: "$0.040/min" },
      { label: "720p Live Encoding (Plus)", value: "$0.030/min" },
      { label: "Storage", value: "$0.003/min" },
      { label: "Delivery", value: "$0.00096/min (starting)" },
    ],
    analytics: [
      { label: "Mux Data", value: "Free base tier (up to 100k views)" },
      { label: "Premium Analytics", value: "$50/mo (over 100k views)" },
    ],
  },
  cloudflare: {
    encoding: [
      { label: "Encoding", value: "Free" },
      { label: "Storage", value: "$5 / 1000 min ($0.005/min)" },
      { label: "Delivery", value: "$1 / 1000 min ($0.001/min)" },
    ],
    analytics: [
      { label: "CF Web Analytics", value: "Free" },
      { label: "Advanced Analytics", value: "Included with Pro/Business plans" },
    ],
  },
  "self-hosted": {
    infrastructure: [
      { label: "Mac Mini Amortization (3yr)", value: "~$36/month" },
      { label: "Network Switch Amortization", value: "~$1-2/month" },
      { label: "ISP Monthly (No SLA)", value: "$70-$150" },
      { label: "ISP Monthly (with SLA)", value: "$400-$800+" },
    ],
    storage: [
      { label: "Cloudflare R2 Storage", value: "$0.015/GB-month (Note: $0 egress)" },
      { label: "AWS S3 Standard", value: "$0.023/GB-month + egress" },
      { label: "Local NAS (amortized)", value: "~$0.01/GB-month" },
    ],
  },
  hybrid: {
    infrastructure: [
      { label: "Mac Mini Amortization (3yr)", value: "~$36/month" },
      { label: "Cloud Egress", value: "$0.05-0.09/GB" },
      { label: "ISP Monthly (No SLA)", value: "$70-$150" },
    ],
    cloud: [
      { label: "Cloudflare Stream Delivery", value: "$1 / 1000 min ($0.001/min)" },
      { label: "AWS CloudFront", value: "$0.085/GB (first 10TB)" },
      { label: "Bunny.net", value: "$0.01/GB (volume pricing)" },
    ],
  },
}

// Technical parameters that apply to all platforms
const technicalParameters = [
  { label: "Realistic Data Rate (1080p)", value: "~0.0439 GB/min (~6 Mbps)" },
  { label: "M2 Pro Mac Mini Transcoding", value: "Limited by single encode engine" },
  { label: "Network Interface", value: "1GbE bottleneck" },
  { label: "CDN Cache Effectiveness", value: "Critical for self-hosted" },
]

interface PricingAssumptionsProps {
  platform: Platform
  className?: string
}

export function PricingAssumptions({ platform, className }: PricingAssumptionsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader
        className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/30 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle>Pricing Assumptions</CardTitle>
              <CardDescription>View the rates used in calculations</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-6">
          <Tabs defaultValue={platform} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="mux">Mux</TabsTrigger>
              <TabsTrigger value="cloudflare">Cloudflare</TabsTrigger>
              <TabsTrigger value="self-hosted">Self-Hosted</TabsTrigger>
              <TabsTrigger value="hybrid">Hybrid</TabsTrigger>
            </TabsList>

            <TabsContent value="mux" className="space-y-6">
              <PricingTable title="Mux Pricing" items={pricingAssumptions.mux.encoding} />
              <PricingTable title="Analytics" items={pricingAssumptions.mux.analytics} />
            </TabsContent>

            <TabsContent value="cloudflare" className="space-y-6">
              <PricingTable title="Cloudflare Stream Pricing" items={pricingAssumptions.cloudflare.encoding} />
              <PricingTable title="Analytics" items={pricingAssumptions.cloudflare.analytics} />
            </TabsContent>

            <TabsContent value="self-hosted" className="space-y-6">
              <PricingTable title="Infrastructure" items={pricingAssumptions["self-hosted"].infrastructure} />
              <PricingTable title="Storage Options" items={pricingAssumptions["self-hosted"].storage} />
            </TabsContent>

            <TabsContent value="hybrid" className="space-y-6">
              <PricingTable title="Local Infrastructure" items={pricingAssumptions.hybrid.infrastructure} />
              <PricingTable title="Cloud Services" items={pricingAssumptions.hybrid.cloud} />
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          <div>
            <h3 className="text-lg font-semibold mb-4">Technical Parameters</h3>
            <div className="space-y-4">
              {technicalParameters.map((param, index) => (
                <div key={index} className="flex flex-col space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{param.label}</span>
                    <span className="text-sm font-mono">{param.value}</span>
                  </div>
                  {index < technicalParameters.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 text-xs text-slate-500 dark:text-slate-400">
            <p>Source: Analysis of Live Streaming Infrastructure Options for WRCX-TV40 (Late 2024)</p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

interface PricingTableProps {
  title: string
  items: { label: string; value: string; tooltip?: string }[]
}

function PricingTable({ title, items }: PricingTableProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex flex-col space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-sm font-medium">{item.label}</span>
                {item.tooltip && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 ml-1 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{item.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <span className="text-sm font-mono">{item.value}</span>
            </div>
            {index < items.length - 1 && <Separator className="my-2" />}
          </div>
        ))}
      </div>
    </div>
  )
}
