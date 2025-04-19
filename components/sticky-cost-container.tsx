"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface StickyCostContainerProps {
  children: React.ReactNode
  className?: string
}

export function StickyCostContainer({ children, className }: StickyCostContainerProps) {
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsSticky(scrollY > 100) // Start sticking after scrolling 100px
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className={cn("space-y-6 relative", className)}>
      <AnimatePresence>
        {isSticky && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10 shadow-md py-2"
          >
            <div className="container mx-auto max-w-7xl px-4">
              <div className="text-lg font-bold">Cost Summary</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={cn("space-y-6", isSticky ? "pt-16" : "")}>{children}</div>
    </div>
  )
}
