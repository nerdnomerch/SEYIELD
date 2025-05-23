"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Shield, Coins, ShoppingBag, Clock, ArrowUpRight, Zap } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Keep Your Deposit Safe",
    description: "Your deposited money remains untouched. Only the rewards are used for purchases.",
  },
  {
    icon: Coins,
    title: "Fixed 7% APY",
    description: "Enjoy a stable and predictable yield on your deposits, regardless of market conditions.",
  },
  {
    icon: ShoppingBag,
    title: "Shop Without Spending",
    description: "Use your upfront rewards to shop at partner merchants without touching your deposit.",
  },
  {
    icon: Clock,
    title: "No Lock-up Period",
    description: "Withdraw your deposit anytime after the minimum 30-day period.",
  },
  {
    icon: ArrowUpRight,
    title: "SEI Network Powered",
    description: "Built on SEI's fast and efficient blockchain for seamless DeFi transactions.",
  },
  {
    icon: Zap,
    title: "Instant Yield",
    description: "Get your Yield upfront immediately after depositing, with no waiting period.",
  },
]

export function Features() {
  return (
    <section className="py-20 relative">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose SEYIELD?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our DeFi platform offers a revolutionary way to shop using the power of your YIELD
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full border-none bg-gradient-to-br from-background to-muted shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-pink-500/20 to-violet-500/20 flex items-center justify-center mb-2">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
