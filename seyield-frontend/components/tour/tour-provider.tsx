"use client"

import React, { createContext, useContext, useState } from "react"
import { usePathname } from "next/navigation"

type TourContextType = {
  activeTour: string | null
  startTour: (tourId?: string) => void
  endTour: () => void
  nextStep: () => void
  prevStep: () => void
  currentStep: number
  setCurrentStep: (step: number) => void
}

const TourContext = createContext<TourContextType | undefined>(undefined)

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [activeTour, setActiveTour] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const pathname = usePathname()

  // Reset tour when navigating to a different page
  React.useEffect(() => {
    setActiveTour(null)
    setCurrentStep(0)
  }, [pathname])

  const startTour = (tourId?: string) => {
    // If no tourId is provided, determine based on current path
    if (!tourId) {
      if (pathname === "/dashboard") {
        tourId = "dashboard"
      } else if (pathname === "/deposit") {
        tourId = "deposit"
      } else if (pathname === "/withdraw") {
        tourId = "withdraw"
      } else if (pathname === "/swap") {
        tourId = "swap"
      } else if (pathname === "/shop") {
        tourId = "shop"
      }
    }

    setActiveTour(tourId || null)
    setCurrentStep(0)
  }

  const endTour = () => {
    setActiveTour(null)
    setCurrentStep(0)
  }

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }

  return (
    <TourContext.Provider
      value={{
        activeTour,
        startTour,
        endTour,
        nextStep,
        prevStep,
        currentStep,
        setCurrentStep,
      }}
    >
      {children}
    </TourContext.Provider>
  )
}

export function useTour() {
  const context = useContext(TourContext)
  if (context === undefined) {
    throw new Error("useTour must be used within a TourProvider")
  }
  return context
}
