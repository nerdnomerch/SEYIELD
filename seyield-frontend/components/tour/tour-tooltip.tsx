"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useTour } from "@/components/tour/tour-provider"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

interface TourTooltipProps {
  step: number
  title: string
  description: string
  targetId: string
  position?: "top" | "bottom" | "left" | "right"
  totalSteps: number
}

export function TourTooltip({ step, title, description, targetId, position = "bottom", totalSteps }: TourTooltipProps) {
  const { currentStep, nextStep, prevStep, endTour } = useTour()
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const positionTooltip = () => {
      const targetElement = document.getElementById(targetId)
      if (!targetElement) return

      const rect = targetElement.getBoundingClientRect()
      const tooltipWidth = 300
      const tooltipHeight = 150
      const margin = 10

      let top = 0
      let left = 0

      switch (position) {
        case "top":
          top = rect.top - tooltipHeight - margin
          left = rect.left + rect.width / 2 - tooltipWidth / 2
          break
        case "bottom":
          top = rect.bottom + margin
          left = rect.left + rect.width / 2 - tooltipWidth / 2
          break
        case "left":
          top = rect.top + rect.height / 2 - tooltipHeight / 2
          left = rect.left - tooltipWidth - margin
          break
        case "right":
          top = rect.top + rect.height / 2 - tooltipHeight / 2
          left = rect.right + margin
          break
      }

      // Adjust if tooltip goes off screen
      if (left < 0) left = margin
      if (left + tooltipWidth > window.innerWidth) left = window.innerWidth - tooltipWidth - margin
      if (top < 0) top = margin
      if (top + tooltipHeight > window.innerHeight) top = window.innerHeight - tooltipHeight - margin

      setTooltipPosition({ top, left })
    }

    if (currentStep === step) {
      positionTooltip()
      const targetElement = document.getElementById(targetId)
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" })
        // Add highlight effect
        targetElement.classList.add("ring-2", "ring-pink-500", "ring-offset-2", "transition-all", "duration-300")
      }
      setIsVisible(true)
    } else {
      setIsVisible(false)
      const targetElement = document.getElementById(targetId)
      if (targetElement) {
        targetElement.classList.remove("ring-2", "ring-pink-500", "ring-offset-2")
      }
    }

    window.addEventListener("resize", positionTooltip)
    return () => {
      window.removeEventListener("resize", positionTooltip)
      const targetElement = document.getElementById(targetId)
      if (targetElement) {
        targetElement.classList.remove("ring-2", "ring-pink-500", "ring-offset-2")
      }
    }
  }, [currentStep, step, targetId, position])

  if (currentStep !== step) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed z-50"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            width: 300,
          }}
        >
          <Card className="border border-pink-200 dark:border-pink-800 shadow-lg">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={endTour}
              aria-label="Close tour"
            >
              <X className="h-4 w-4" />
            </Button>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm">{description}</p>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-3 pb-3">
              <div className="text-xs text-muted-foreground">
                Step {step + 1} of {totalSteps}
              </div>
              <div className="flex gap-2">
                {step > 0 && (
                  <Button variant="outline" size="sm" onClick={prevStep}>
                    Previous
                  </Button>
                )}
                {step < totalSteps - 1 ? (
                  <Button
                    size="sm"
                    onClick={nextStep}
                    className="bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={endTour}
                    className="bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700"
                  >
                    Finish
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
