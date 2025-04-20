import type { KeyboardEvent } from "react"

export function useAccordionKeyboard() {
  const handleAccordionKeyDown = (e: KeyboardEvent<HTMLButtonElement>, toggleFn: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      toggleFn()
    }
  }

  return { handleAccordionKeyDown }
}
