import { ExternalLink } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export interface Citation {
  id: string
  source: string
  url: string
  description: string
}

export const citations: Citation[] = [
  {
    id: "1",
    source: "Mux Video Pricing – Encoding section",
    url: "https://www.mux.com/pricing/video",
    description: "Mux charges $0.040/minute for 1080p encoding.",
  },
  {
    id: "2",
    source: "Mux Video Pricing – Delivery section",
    url: "https://www.mux.com/pricing/video",
    description: "Mux charges $0.00096/minute for video delivery.",
  },
  {
    id: "3",
    source: "Cloudflare Stream Pricing – Storage section",
    url: "https://developers.cloudflare.com/stream/pricing/",
    description: "Cloudflare Stream charges $5 per 1,000 minutes stored (≈ $0.005/min).",
  },
  {
    id: "4",
    source: "MediaMTX Performance Discussion",
    url: "https://github.com/bluenviron/mediamtx/discussions/4055",
    description: "Benchmarks showing capacity tiers for different network interfaces.",
  },
  {
    id: "5",
    source: "AWS CloudFront Pricing – example egress rates",
    url: "https://aws.amazon.com/cloudfront/pricing/",
    description: "Reference for CDN egress pricing in hybrid deployment models.",
  },
  {
    id: "6",
    source: "Month – 30 day budgeting approximation",
    url: "https://en.wikipedia.org/wiki/Month",
    description: "Standard 30-day approximation used for monthly calculations.",
  },
  {
    id: "7",
    source: "Mux Pricing FAQ – Analytics & Support",
    url: "https://www.mux.com/docs/pricing/video#does-support-include",
    description: "Analytics and support included at no extra cost.",
  },
  {
    id: "8",
    source: "WRCX Internal Estimate",
    url: "#",
    description: "Default viewer estimate based on internal projections.",
  },
  {
    id: "9",
    source: "WRCX Analytics Report",
    url: "#",
    description: "Average watch time based on internal analytics data.",
  },
  {
    id: "10",
    source: "IAB Video Ad Format Guidelines",
    url: "https://www.iab.com/wp-content/uploads/2015/10/IAB-Video-Ad-Format-Standards.pdf",
    description: "Industry standard for ad frequency in video content.",
  },
  {
    id: "11",
    source: "eMarketer Social Ad CPMs Forecast 2024",
    url: "https://www.emarketer.com/content/social-ad-cpms-forecast-2024",
    description: "Industry benchmark for video ad CPM rates.",
  },
  {
    id: "12",
    source: "WRCX Rate Card",
    url: "#",
    description: "Placeholder flat fee – adjust per station rate card.",
  },
]

interface CitationLinkProps {
  id: string
  className?: string
}

export function CitationLink({ id, className }: CitationLinkProps) {
  const citation = citations.find((c) => c.id === id)

  if (!citation) {
    return null
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-xs align-super text-blue-600 dark:text-blue-400 hover:underline ${className}`}
          >
            [{id}]
          </a>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm">
          <div className="space-y-1">
            <p className="font-medium">{citation.source}</p>
            <p className="text-xs">{citation.description}</p>
            {citation.url !== "#" && (
              <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                <ExternalLink className="h-3 w-3 mr-1" />
                <span>View source</span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function FormulaExplanation({ formula, className }: { formula: string; className?: string }) {
  return (
    <div className={`text-xs text-slate-500 dark:text-slate-400 font-mono ${className}`}>
      <code>{formula}</code>
    </div>
  )
}

export function CitationsList({ platform, className }: { platform?: any; className?: string }) {
  return (
    <div className={cn("mt-8 border-t border-slate-200 dark:border-slate-800 pt-6", className)}>
      <h3 className="text-lg font-medium mb-4">Citations & References</h3>
      <div className="space-y-3">
        {citations.map((citation) => (
          <div key={citation.id} className="flex gap-2">
            <div className="font-mono text-sm">[{citation.id}]</div>
            <div>
              <div className="text-sm font-medium">{citation.source}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">{citation.description}</div>
              {citation.url !== "#" && (
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center mt-1"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  <span>View source</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
