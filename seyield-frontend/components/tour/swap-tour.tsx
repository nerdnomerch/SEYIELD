"use client"

import { useTour } from "@/components/tour/tour-provider"
import { TourTooltip } from "@/components/tour/tour-tooltip"

export function SwapTour() {
  const { activeTour } = useTour()

  if (activeTour !== "swap") return null

  return (
    <>
      <TourTooltip
        step={0}
        title="Asset Conversion"
        description="Learn how to convert between your deposit and rewards to manage your funds more effectively."
        targetId="swap-info"
        position="right"
        totalSteps={2}
      />
      <TourTooltip
        step={1}
        title="Convert Your Assets"
        description="Choose which asset to convert and enter the amount. Conversions are processed instantly with no fees."
        targetId="swap-form"
        position="left"
        totalSteps={2}
      />
    </>
  )
}
