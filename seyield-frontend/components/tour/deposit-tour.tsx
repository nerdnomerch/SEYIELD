"use client"

import { useTour } from "@/components/tour/tour-provider"
import { TourTooltip } from "@/components/tour/tour-tooltip"

export function DepositTour() {
  const { activeTour } = useTour()

  if (activeTour !== "deposit") return null

  return (
    <>
      <TourTooltip
        step={0}
        title="How Deposits Work"
        description="Learn how your deposits generate rewards that you can use for shopping without spending your original money."
        targetId="deposit-info"
        position="right"
        totalSteps={2}
      />
      <TourTooltip
        step={1}
        title="Make Your First Deposit"
        description="Enter the amount you want to deposit and see how much rewards you'll generate over time."
        targetId="deposit-form"
        position="left"
        totalSteps={2}
      />
    </>
  )
}
