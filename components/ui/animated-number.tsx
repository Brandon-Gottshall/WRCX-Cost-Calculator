"use client"

import { useEffect, useState } from "react"
import { motion, useSpring, useTransform } from "framer-motion"
import { formatCurrency } from "@/lib/utils"

interface AnimatedNumberProps {
  value: number
  formatter?: (value: number) => string
  className?: string
}

export function AnimatedNumber({ value, formatter = formatCurrency, className }: AnimatedNumberProps) {
  const [prevValue, setPrevValue] = useState(value)

  // Use spring animation for smooth transitions
  const springValue = useSpring(value, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  // Transform the spring value to the formatted string
  const displayValue = useTransform(springValue, (latest) => formatter(latest))

  // Update the spring target value when the input value changes
  useEffect(() => {
    setPrevValue(value)
    springValue.set(value)
  }, [value, springValue])

  return <motion.span className={className}>{displayValue}</motion.span>
}
