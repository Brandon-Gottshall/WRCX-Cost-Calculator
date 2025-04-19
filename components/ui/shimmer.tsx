"use client"

import type React from "react"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ShimmerProps {
  className?: string
  width?: string | number
  height?: string | number
  active?: boolean
  children?: React.ReactNode
}

export function Shimmer({ className, width, height, active = true, children }: ShimmerProps) {
  return (
    <motion.div
      className={cn("relative overflow-hidden", className)}
      style={{ width, height }}
      animate={{
        background: active ? ["rgba(59, 130, 246, 0)", "rgba(59, 130, 246, 0.1)", "rgba(59, 130, 246, 0)"] : "none",
      }}
      transition={{
        duration: 1.5,
        repeat: active ? Number.POSITIVE_INFINITY : 0,
        repeatType: "loop",
      }}
    >
      {children}
      {active && (
        <motion.div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent"
          animate={{ translateX: ["100%", "-100%"] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      )}
    </motion.div>
  )
}
