"use client"

import { motion, useSpring, useTransform } from "framer-motion"
import { useEffect } from "react"

interface AnimatedNumberProps {
  value: number
  formatter?: (value: number) => string
  className?: string
  duration?: number
}

export function AnimatedNumber({
  value,
  formatter = (val) => val.toLocaleString(),
  className = "",
  duration = 0.5,
}: AnimatedNumberProps) {
  // Use a spring animation for smooth transitions
  const springValue = useSpring(value, {
    stiffness: 100,
    damping: 30,
    duration: duration * 1000,
  })

  // Transform the spring value to apply formatting
  const displayValue = useTransform(springValue, (val) => formatter(val))

  // Update the spring target when value changes
  useEffect(() => {
    springValue.set(value)
  }, [value, springValue])

  return <motion.span className={className}>{displayValue}</motion.span>
}
