"use client"

import type React from "react"

import { Profiler, type ProfilerOnRenderCallback } from "react"

interface PerformanceProfilerProps {
  id: string
  children: React.ReactNode
  onRender?: ProfilerOnRenderCallback
}

export function PerformanceProfiler({ id, children, onRender }: PerformanceProfilerProps) {
  // Default onRender callback that logs performance metrics
  const defaultOnRender: ProfilerOnRenderCallback = (
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
  ) => {
    // Only log in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[Profiler] ${id} (${phase}):`)
      console.log(`  Actual duration: ${actualDuration.toFixed(2)}ms`)
      console.log(`  Base duration: ${baseDuration.toFixed(2)}ms`)
      console.log(`  Start time: ${startTime.toFixed(2)}ms`)
      console.log(`  Commit time: ${commitTime.toFixed(2)}ms`)

      // Alert for potentially slow renders
      if (actualDuration > 16) {
        // 16ms = 60fps threshold
        console.warn(`⚠️ Slow render detected in ${id}: ${actualDuration.toFixed(2)}ms`)
      }
    }
  }

  return (
    <Profiler id={id} onRender={onRender || defaultOnRender}>
      {children}
    </Profiler>
  )
}
