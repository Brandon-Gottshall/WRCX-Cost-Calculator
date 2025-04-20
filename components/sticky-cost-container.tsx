"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

interface StickyCostContainerProps {
  children: React.ReactNode
  className?: string
}

export function StickyCostContainer({ children, className }: StickyCostContainerProps) {
  const [isSticky, setIsSticky] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

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
        className,
      )}
    >
      {children}
    </div>
  )
}
