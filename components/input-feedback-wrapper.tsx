"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Shimmer } from "./ui/shimmer"

interface InputFeedbackWrapperProps {
  children: React.ReactNode
  isCalculating: boolean
}

export function InputFeedbackWrapper({ children, isCalculating }: InputFeedbackWrapperProps) {
  const [showShimmer, setShowShimmer] = useState(false)

  // Immediately show shimmer on input change
  useEffect(() => {
    if (isCalculating) {
      setShowShimmer(true)
    } else {
      // Add a small delay before hiding shimmer to ensure it's visible
      const timer = setTimeout(() => {
        setShowShimmer(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isCalculating])

  return (
    <div className="relative">
      {showShimmer && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <Shimmer className="h-full w-full rounded-md" />
        </div>
      )}
      <div className={showShimmer ? "opacity-50 transition-opacity" : ""}>{children}</div>
    </div>
  )
}
