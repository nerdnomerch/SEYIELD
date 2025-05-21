"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Wallet, Coins, ShoppingBag, BadgeCheck, ArrowRight } from "lucide-react"

export function InteractiveDemo() {
  const [step, setStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [depositAmount, setDepositAmount] = useState(1000)
  const [rewardsAmount, setRewardsAmount] = useState(0)
  const [purchasesMade, setPurchasesMade] = useState(0)

  const nextStep = () => {
    if (step < 3) {
      setIsAnimating(true)
      setTimeout(() => {
        setStep(step + 1)
        setIsAnimating(false)

        // Update simulation values
        if (step === 0) {
          // After deposit
          setRewardsAmount(70)
        } else if (step === 1) {
          // After rewards generation
          // No change needed, rewards already set
        } else if (step === 2) {
          // After shopping
          setRewardsAmount(0)
          setPurchasesMade(1)
        }
      }, 1000)
    } else {
      // Reset demo
      setStep(0)
      setDepositAmount(1000)
      setRewardsAmount(0)
      setPurchasesMade(0)
    }
  }

  const steps = [
    {
      title: "Deposit Assets",
      description: "Deposit your assets into the EduZero smart contract",
      icon: Wallet,
      animation: (
        <motion.div
          className="flex items-center justify-center"
          animate={{
            scale: isAnimating ? [1, 0.8, 1.2, 1] : 1,
            y: isAnimating ? [0, -20, 0] : 0,
          }}
          transition={{ duration: 1 }}
        >
          <div className="relative">
            <Wallet className="h-16 w-16 text-pink-500" />
            <motion.div
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold"
              animate={{ scale: isAnimating ? [1, 1.5, 1] : 1 }}
            >
              $
            </motion.div>
          </div>
        </motion.div>
      ),
    },
    {
      title: "Receive Upfront Rewards",
      description: "Get your rewards immediately based on your deposit's APY",
      icon: Coins,
      animation: (
        <motion.div
          className="flex items-center justify-center"
          animate={{
            rotate: isAnimating ? [0, 360] : 0,
          }}
          transition={{ duration: 1 }}
        >
          <div className="relative">
            <Coins className="h-16 w-16 text-violet-500" />
            <motion.div
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs font-bold"
              animate={{
                scale: isAnimating ? [1, 1.5, 1] : 1,
                opacity: isAnimating ? [0, 1] : 1,
              }}
            >
              7%
            </motion.div>
          </div>
        </motion.div>
      ),
    },
    {
      title: "Shop With Rewards",
      description: "Use your rewards to shop without spending your deposit",
      icon: ShoppingBag,
      animation: (
        <motion.div
          className="flex items-center justify-center"
          animate={{
            y: isAnimating ? [0, -10, 0] : 0,
            x: isAnimating ? [0, 10, -10, 0] : 0,
          }}
          transition={{ duration: 1 }}
        >
          <div className="relative">
            <ShoppingBag className="h-16 w-16 text-pink-500" />
            <motion.div
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold"
              animate={{ scale: isAnimating ? [1, 1.5, 1] : 1 }}
            >
              ✓
            </motion.div>
          </div>
        </motion.div>
      ),
    },
    {
      title: "Never Pay Back",
      description: "Your deposit stays intact and continues generating rewards",
      icon: BadgeCheck,
      animation: (
        <motion.div
          className="flex items-center justify-center"
          animate={{
            scale: isAnimating ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 1 }}
        >
          <div className="relative">
            <BadgeCheck className="h-16 w-16 text-green-500" />
            <motion.div
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold"
              animate={{
                scale: isAnimating ? [1, 1.5, 1] : 1,
                opacity: isAnimating ? [0, 1] : 1,
              }}
            >
              ∞
            </motion.div>
          </div>
        </motion.div>
      ),
    },
  ]

  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8">See How It Works</h2>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left side: Animation and controls */}
          <div className="flex flex-col items-center justify-center">
            <Card className="w-full p-8 flex flex-col items-center justify-center min-h-[300px] border border-pink-100 dark:border-pink-900/20">
              <div className="mb-6">{steps[step].animation}</div>
              <h3 className="text-xl font-bold mb-2">{steps[step].title}</h3>
              <p className="text-center text-muted-foreground mb-6">{steps[step].description}</p>
              <Button
                onClick={nextStep}
                className="gap-2 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700"
              >
                {step === 3 ? "Restart Demo" : "Next Step"}
                {step < 3 && <ArrowRight className="h-4 w-4" />}
              </Button>
            </Card>
          </div>

          {/* Right side: Stats */}
          <div>
            <Card className="w-full p-8 border border-pink-100 dark:border-pink-900/20">
              <h3 className="text-xl font-bold mb-6">Simulation Stats</h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Your Deposit (pUSDC)</span>
                    <span className="font-bold">{depositAmount} USDC</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full bg-pink-500"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Available Rewards</span>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={rewardsAmount}
                        className="font-bold"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                      >
                        {rewardsAmount} USDC
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full bg-violet-500"
                      animate={{ width: `${(rewardsAmount / 70) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Purchases Made</span>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={purchasesMade}
                        className="font-bold"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                      >
                        {purchasesMade}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Annual Percentage Yield</span>
                    <span className="font-bold text-green-500">7%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lock Period</span>
                    <span className="font-bold">30 days</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-8 text-center text-muted-foreground">
          <p>
            This is a simplified demonstration. In the actual platform, your deposit generates rewards continuously, and
            you can make multiple purchases as long as you have available rewards.
          </p>
        </div>
      </div>
    </div>
  )
}
