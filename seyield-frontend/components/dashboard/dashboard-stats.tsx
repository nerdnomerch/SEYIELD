"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

export function DashboardStats() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="col-span-2"
    >
      <Card className="border border-pink-100 dark:border-pink-900/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">2,500 USDC</div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Deposit</div>
              <div className="text-xl font-semibold">2,400 USDC</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Available Rewards</div>
              <div className="text-xl font-semibold text-pink-500 dark:text-pink-400">100 USDC</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
