"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, ArrowRight, Coins, ShoppingCart, BadgeCheck } from "lucide-react"
import { InteractiveDemo } from "@/components/how-it-works/interactive-demo"
import { TokenomicsSection } from "@/components/how-it-works/tokenomics-section"

const steps = [
  {
    icon: Wallet,
    title: "Deposit Money",
    description: "Deposit your money into the EduZero platform. Your deposit remains safe and untouched.",
    details:
      "When you deposit, your money is split into deposit and rewards. The deposit represents your original money, while rewards represent the future earnings.",
  },
  {
    icon: Coins,
    title: "Generate Rewards",
    description: "Your deposit automatically starts generating rewards at a fixed 7% annual rate.",
    details:
      "The rewards are calculated daily and accumulate in your account. The longer your money remains deposited, the more rewards you generate for shopping.",
  },
  {
    icon: ShoppingCart,
    title: "Shop With Rewards",
    description: "Use the accumulated rewards to shop at partner merchants without spending your deposit.",
    details:
      "Browse our partner merchants and spend your rewards. The merchants receive the equivalent value in money, while you get to keep your products.",
  },
  {
    icon: BadgeCheck,
    title: "Never Pay Back",
    description:
      "Unlike loans, there's nothing to pay back. Your deposit stays intact and continues generating rewards.",
    details:
      "This is not a loan or credit system. You're simply spending the rewards your money generates, so there's no debt to repay.",
  },
]

export function StepByStep() {
  return (
    <div className="space-y-12 mb-16">
      {steps.map((step, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Card className="border border-pink-100 dark:border-pink-900/20">
            <div className="md:grid md:grid-cols-5 md:items-start">
              <div className="md:col-span-1 flex justify-center md:justify-start p-6">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center">
                  <step.icon className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="md:col-span-4 p-6 pt-0 md:pt-6">
                <CardHeader className="p-0 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <CardTitle>{step.title}</CardTitle>
                  </div>
                  <CardDescription className="mt-2">{step.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-muted-foreground">{step.details}</p>
                </CardContent>
              </div>
            </div>
          </Card>

          {index < steps.length - 1 && (
            <div className="flex justify-center my-4">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </motion.div>
      ))}

      <InteractiveDemo />
      <TokenomicsSection />
    </div>
  )
}
