"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

const benefits = [
  "Your deposit remains safe and untouched",
  "Fixed 7% annual rewards regardless of market conditions",
  "Start shopping with rewards now",
  "No repayments or debt - it's not a loan",
  "Withdraw your deposit anytime after 90 days",
]

export function DepositInfo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      id="deposit-info"
    >
      <Card className="h-full border border-pink-100 dark:border-pink-900/20">
        <CardHeader>
          <CardTitle>How Deposits Work</CardTitle>
          <CardDescription>Understanding the SEYIELD deposit mechanism</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="mb-4">When you deposit money into SEYIELD, it is split into two parts:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <div className="font-semibold mb-1">pSYLD</div>
                <p className="text-sm text-muted-foreground">
                  Represents your original deposit. This remains untouched and can be withdrawn after the lock period.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="font-semibold mb-1">ySYLD as Rewards Balance</div>
                <p className="text-sm text-muted-foreground">
                  Represents the rewards your deposit generates. This is what you use for shopping.
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="font-semibold mb-2">Benefits</div>
            <ul className="space-y-2">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-pink-500 shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <div className="font-semibold mb-2">Important Note</div>
            <p className="text-sm text-muted-foreground">
              Your deposit is locked for a minimum of 90 days. Early withdrawals are subject to a 5% fee. Rewards are
              generated directly and can be used for shopping immediately.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
