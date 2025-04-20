"use client"

import type React from "react"

import { cn } from "@/lib/utils"

interface ShimmerProps {
  active?: boolean
  children: React.ReactNode
  className?: string
}

export function Shimmer({ active = false, children, className }: ShimmerProps) {
  if (!active) return <div className={className}>{children}</div>

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer-animation" />
      <div className="opacity-50">{children}</div>
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .shimmer-animation {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  )
}
