"use client"

import { useTour } from "@/components/tour/tour-provider"
import { TourTooltip } from "@/components/tour/tour-tooltip"

export function DashboardTour() {
  const { activeTour } = useTour()

  if (activeTour !== "dashboard") return null

  return (
    <>
      <TourTooltip
        step={0}
        title="Welcome to Your Dashboard"
        description="This is your personal dashboard where you can track your deposits, rewards, and shopping activities."
        targetId="dashboard-stats"
        position="bottom"
        totalSteps={3}
      />
      <TourTooltip
        step={1}
        title="Track Your Rewards"
        description="Here you can see how much rewards your deposits are generating and when you'll receive your next payout."
        targetId="yield-overview"
        position="left"
        totalSteps={3}
      />
      <TourTooltip
        step={2}
        title="Shop with Your Rewards"
        description="Browse our partner merchants and spend your rewards without touching your deposit."
        targetId="shop-items"
        position="top"
        totalSteps={3}
      />
    </>
  )
}
