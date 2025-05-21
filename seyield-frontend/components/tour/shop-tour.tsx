"use client"

import { useTour } from "@/components/tour/tour-provider"
import { TourTooltip } from "@/components/tour/tour-tooltip"

export function ShopTour() {
  const { activeTour } = useTour()

  if (activeTour !== "shop") return null

  return (
    <>
      <TourTooltip
        step={0}
        title="Shop with Rewards"
        description="This is where you can spend your rewards on products and services from our partner merchants."
        targetId="shop-header"
        position="bottom"
        totalSteps={3}
      />
      <TourTooltip
        step={1}
        title="Browse Categories"
        description="Filter products by category to find exactly what you're looking for."
        targetId="shop-categories"
        position="bottom"
        totalSteps={3}
      />
      <TourTooltip
        step={2}
        title="Available Products"
        description="Browse through our selection of products and services that you can purchase using your rewards."
        targetId="shop-items"
        position="top"
        totalSteps={3}
      />
    </>
  )
}
