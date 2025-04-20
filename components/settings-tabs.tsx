"use client"

import type React from "react"

import { motion } from "framer-motion"
import type { Tab, SettingsState } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SettingsTabsProps {
  activeTab: Tab
  onChange: (tab: Tab) => void
  settings: SettingsState
}

export function SettingsTabs({ activeTab, onChange, settings }: SettingsTabsProps) {
  const isSelfHosted = settings.platform === "self-hosted" || settings.platform === "hybrid"

  const tabs: { id: Tab; label: string; disabled?: boolean }[] = [
    { id: "live", label: "Live" },
    { id: "legacy-vod", label: "Legacy VOD" },
    { id: "storage", label: "Storage & DB" },
    { id: "email", label: "Email" },
    { id: "cdn", label: "CDN", disabled: settings.platform === "mux" && !settings.liveDvrEnabled },
    // Removed the hardware tab from here
    { id: "analytics", label: "Analytics" },
    { id: "reference", label: "Reference" },
    // Remove the self-hosted tab
    // { id: "self-hosted", label: "Self-Hosted Config", disabled: !isSelfHosted },
  ]

  // For mobile view
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as Tab)
  }

  // Handle keyboard navigation for tabs
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, tabId: Tab) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onChange(tabId)
    }
  }

  return (
    <div className="relative">
      {/* Mobile dropdown */}
      <div className="md:hidden">
        <select
          value={activeTab}
          onChange={handleSelectChange}
          className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 focus:outline focus:outline-offset-2"
          aria-label="Select tab"
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id} disabled={tab.disabled}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop tabs */}
      <div className="hidden md:block relative">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-100 to-blue-100 dark:from-slate-900 dark:to-blue-900/30 rounded-lg blur-sm opacity-50 -z-10" />

        <nav
          className="flex overflow-x-auto scrollbar-hide space-x-1 rounded-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1 border border-slate-200 dark:border-slate-800"
          role="tablist"
          aria-label="Settings tabs"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              disabled={tab.disabled}
              className={cn(
                "relative px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap",
                "focus:outline focus:outline-offset-2",
                tab.disabled && "opacity-50 cursor-not-allowed",
                activeTab === tab.id
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200",
              )}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`${tab.id}-panel`}
              id={`${tab.id}-tab`}
              tabIndex={activeTab === tab.id ? 0 : -1}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                  layoutId="activeTabIndicator"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
