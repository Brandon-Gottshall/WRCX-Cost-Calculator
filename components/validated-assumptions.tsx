"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { InfoIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Add className prop to ValidatedAssumptions component
export default function ValidatedAssumptions({
  settings,
  validationResults,
  className,
}: {
  settings: any //SettingsState;  // Replace SettingsState with any to avoid type errors for now
  validationResults: any[] //ValidationResult[]; // Replace ValidationResult with any to avoid type errors for now
  className?: string
}) {
  // ...

  // Update the return statement to use the className prop
  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/30">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
            <InfoIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle>Validated Assumptions Overview</CardTitle>
            <CardDescription>Late 2024 Pricing & Technical Parameters</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="managed" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="managed">Managed Services</TabsTrigger>
            <TabsTrigger value="self-hosted">Self-Hosted</TabsTrigger>
            <TabsTrigger value="technical">Technical Parameters</TabsTrigger>
          </TabsList>

          <TabsContent value="managed" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PricingCard
                title="Mux"
                items={[
                  { label: "1080p Live Encoding (Plus)", value: "$0.040/min" },
                  { label: "Storage", value: "$0.003/min" },
                  { label: "Delivery", value: "$0.00096/min (starting)" },
                  { label: "Mux Data", value: "Free base tier (up to 100k views)" },
                ]}
              />

              <PricingCard
                title="Cloudflare Stream"
                items={[
                  { label: "Encoding", value: "Free" },
                  { label: "Storage", value: "$5 / 1000 min ($0.005/min)" },
                  { label: "Delivery", value: "$1 / 1000 min ($0.001/min)" },
                  { label: "CF Web Analytics", value: "Free" },
                ]}
              />
            </div>
          </TabsContent>

          <TabsContent value="self-hosted" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PricingCard
                title="Storage & CDN"
                items={[
                  { label: "Cloudflare R2 Storage", value: "$0.015/GB-month (Note: $0 egress)" },
                  { label: "Cloudflare CDN Pro", value: "$20-25/mo" },
                  { label: "CockroachDB Serverless", value: "$0 base + usage fees" },
                  { label: "AWS SES", value: "3k free/mo (1yr), then $0.10 per 1k emails" },
                ]}
              />

              <PricingCard
                title="Infrastructure"
                items={[
                  { label: "ISP Monthly (No SLA)", value: "$70-$150" },
                  { label: "ISP Monthly (with SLA)", value: "$400-$800+" },
                  { label: "Mac Mini Amortization (3yr)", value: "~$36/month" },
                  { label: "Network Switch Amortization", value: "~$1-2/month" },
                ]}
              />
            </div>
          </TabsContent>

          <TabsContent value="technical" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Card className="border border-slate-200 dark:border-slate-800">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Technical Parameters</h3>
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Realistic Data Rate (1080p)</span>
                        <span className="text-sm font-mono">~0.0439 GB/min (~6 Mbps)</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Typical bitrate for good quality 1080p30 H.264 streaming
                      </p>
                      <Separator className="my-2" />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">M2 Pro Mac Mini Transcoding</span>
                        <span className="text-sm font-mono">Limited by single encode engine</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        7 simultaneous 1080p30 streams may approach hardware limits
                      </p>
                      <Separator className="my-2" />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Network Interface</span>
                        <span className="text-sm font-mono">1GbE bottleneck</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Standard Mac Mini 1GbE interface limits direct viewer scaling
                      </p>
                      <Separator className="my-2" />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">CDN Cache Effectiveness</span>
                        <span className="text-sm font-mono">Critical for self-hosted</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        High cache hit rates required to overcome network limitations
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-xs text-slate-500 dark:text-slate-400">
          <p>Source: Analysis of Live Streaming Infrastructure Options for WRCX-TV40 (Late 2024)</p>
        </div>
      </CardContent>
    </Card>
  )
}

interface PricingCardProps {
  title: string
  items: { label: string; value: string }[]
}

function PricingCard({ title, items }: PricingCardProps) {
  return (
    <Card className="border border-slate-200 dark:border-slate-800">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex flex-col space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-sm font-mono">{item.value}</span>
              </div>
              {index < items.length - 1 && <Separator className="my-2" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
