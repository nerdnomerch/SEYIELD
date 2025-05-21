"use client"

import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface BackgroundPatternProps {
  variant?: "default" | "dashboard" | "deposit" | "withdraw" | "swap" | "shop" | "how-it-works" | "faucet"
  className?: string
}

export function BackgroundPattern({ variant = "default", className }: BackgroundPatternProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = theme === "dark"

  const getGradient = () => {
    switch (variant) {
      case "dashboard":
        return isDark
          ? "from-violet-900/10 via-pink-900/5 to-transparent"
          : "from-violet-200/30 via-pink-200/20 to-transparent"
      case "deposit":
        return isDark
          ? "from-pink-900/10 via-blue-900/5 to-transparent"
          : "from-pink-200/30 via-blue-200/20 to-transparent"
      case "withdraw":
        return isDark
          ? "from-blue-900/10 via-pink-900/5 to-transparent"
          : "from-blue-200/30 via-pink-200/20 to-transparent"
      case "swap":
        return isDark
          ? "from-violet-900/10 via-blue-900/5 to-transparent"
          : "from-violet-200/30 via-blue-200/20 to-transparent"
      case "shop":
        return isDark
          ? "from-pink-900/10 via-violet-900/5 to-transparent"
          : "from-pink-200/30 via-violet-200/20 to-transparent"
      case "how-it-works":
        return isDark
          ? "from-blue-900/10 via-violet-900/5 to-transparent"
          : "from-blue-200/30 via-violet-200/20 to-transparent"
      case "faucet":
        return isDark
          ? "from-cyan-900/10 via-violet-900/5 to-transparent"
          : "from-cyan-200/30 via-violet-200/20 to-transparent"
      default:
        return isDark
          ? "from-pink-900/10 via-violet-900/5 to-transparent"
          : "from-pink-200/30 via-violet-200/20 to-transparent"
    }
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-br rounded-full blur-3xl transform -translate-y-1/2 scale-150",
          getGradient(),
          className,
        )}
      />
    </div>
  )
}
