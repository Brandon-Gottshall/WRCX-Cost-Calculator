"use client"

import { motion } from "framer-motion"
import type { Platform } from "@/lib/types"
import { cn } from "@/lib/utils"

interface PlatformPickerProps {
  selectedPlatform: Platform
  onChange: (platform: Platform) => void
}

export function PlatformPicker({ selectedPlatform, onChange }: PlatformPickerProps) {
  const platforms: { id: Platform; label: string }[] = [
    { id: "mux", label: "Mux" },
    { id: "cloudflare", label: "Cloudflare Stream" },
    { id: "self-hosted", label: "Self-Hosted" },
    { id: "hybrid", label: "Hybrid" },
  ]

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 rounded-xl blur-xl opacity-50 -z-10" />

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-lg font-semibold mb-4">Choose Your Platform</h2>

        <div className="flex flex-wrap gap-3">
          {platforms.map((platform) => (
            <motion.button
              key={platform.id}
              onClick={() => onChange(platform.id)}
              className={cn(
                "relative px-4 py-2 rounded-full text-sm font-medium transition-all",
                "border border-slate-200 dark:border-slate-800",
                selectedPlatform === platform.id
                  ? "bg-blue-600 text-white border-transparent"
                  : "bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800",
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-pressed={selectedPlatform === platform.id}
            >
              {platform.label}
              {selectedPlatform === platform.id && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-blue-600 -z-10"
                  layoutId="platformHighlight"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
