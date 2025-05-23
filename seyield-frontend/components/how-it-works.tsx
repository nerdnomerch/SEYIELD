"use client"

import { motion } from "framer-motion"
import { Wallet, ArrowRight, Coins, ShoppingCart, BadgeCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const steps = [
  {
    icon: Wallet,
    title: "Deposit Money",
    description: "Deposit your money into the SEYIELD platform. Your deposit remains safe and untouched.",
  },
  {
    icon: Coins,
    title: "Generate Rewards",
    description: "Your deposit automatically starts generating rewards at a fixed 7% annual rate.",
  },
  {
    icon: ShoppingCart,
    title: "Shop With Rewards",
    description: "Use the accumulated rewards to shop at partner merchants without spending your deposit.",
  },
  {
    icon: BadgeCheck,
    title: "Never Pay Back",
    description:
      "Unlike loans, there's nothing to pay back. Your deposit stays intact and continues generating rewards.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-20">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            SEYIELD splits your deposit into principal and rewards or yield, allowing you to shop with just the rewards
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center"
              >
                <div className="relative z-10 h-16 w-16 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center mb-4">
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>

                {index < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-24 left-0 transform translate-x-[calc(100%*2*(${index}+0.5))]">
                    {/* <ArrowRight className="h-5 w-5 text-muted-foreground" /> */}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700"
            >
              <Link href="/deposit">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
