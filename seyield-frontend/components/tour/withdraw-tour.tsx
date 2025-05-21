"use client"

import { useTour } from "@/components/tour/tour-provider"
import { TourTooltip } from "@/components/tour/tour-tooltip"

export function WithdrawTour() {
  const { activeTour } = useTour()

  if (activeTour !== "withdraw") return null

  return (
    <>
      <TourTooltip
        step={0}
        title="Withdrawal Options"
        description="Learn about the different types of withdrawals and any associated conditions."
        targetId="withdraw-info"
        position="right"
        totalSteps={2}
      />
      <TourTooltip
        step={1}
        title="Withdraw Your Assets"
        description="Choose whether to withdraw from your deposit or rewards balance."
        targetId="withdraw-form"
        position="left"
        totalSteps={2}
      />
    </>
  )
}
