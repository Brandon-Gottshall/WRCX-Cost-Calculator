"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UnifiedHardwareRecommendations } from "@/components/unified-hardware-recommendations"
import type { SettingsState } from "@/lib/types"

interface StickyCostContainerProps {
  children: React.ReactNode
  className?: string
  settings?: SettingsState
  updateSettings?: (settings: Partial<SettingsState>) => void
  showHardwareRecommendations?: boolean
}

export function StickyCostContainer({
  children,
  className,
  settings,
  updateSettings,
  showHardwareRecommendations = false,
}: StickyCostContainerProps) {
  const [isSticky, setIsSticky] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const isSmall = useMediaQuery("(max-width: 640px)")

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsSticky(scrollPosition > 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-in-out",
        isSticky
          ? isMobile
            ? "fixed bottom-0 left-0 right-0 z-50 p-4 pb-24 bg-background/95 backdrop-blur-sm shadow-lg border-t max-h-[70vh] overflow-y-auto"
            : "fixed top-4 right-4 z-50 max-w-md shadow-lg border rounded-lg bg-background/95 backdrop-blur-sm max-h-[90vh] overflow-y-auto"
          : "relative",
        isSmall && isSticky && isCollapsed ? "max-h-16 overflow-hidden" : "",
        className,
      )}
    >
      {/* Mobile Collapse Toggle */}
      {isSmall && isSticky && (
        <div className="absolute top-0 right-0 p-2 z-10">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full bg-white/80 dark:bg-slate-800/80 shadow-sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {/* Show hardware recommendations when sticky and settings are available */}
      {isSticky && showHardwareRecommendations && settings && updateSettings && (
        <div className="mb-4">
          <UnifiedHardwareRecommendations settings={settings} updateSettings={updateSettings} />
        </div>
      )}

      {children}
    </div>
  )
}
