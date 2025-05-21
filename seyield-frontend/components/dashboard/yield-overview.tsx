"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

export function YieldOverview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="border border-pink-100 dark:border-pink-900/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Rewards Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">7% Annual Rate</div>
          <div className="mt-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-muted-foreground">Monthly Rewards</span>
              <span className="text-sm font-medium">14 USDC</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-pink-500 to-violet-500"
                initial={{ width: "0%" }}
                animate={{ width: "60%" }}
                transition={{ duration: 2 }}
              />
            </div>
            <div className="flex justify-between mt-4 text-sm">
              <div>
                <div className="font-medium">168 USDC</div>
                <div className="text-muted-foreground">Annual Rewards</div>
              </div>
              <div className="text-right">
                <div className="font-medium">14 USDC</div>
                <div className="text-muted-foreground">Next Payout</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
