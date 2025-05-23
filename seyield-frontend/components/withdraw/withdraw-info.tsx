"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { AlertCircle, ArrowDownUp } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function WithdrawInfo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      id="withdraw-info"
    >
      <Card className="h-full border border-pink-100 dark:border-pink-900/20">
        <CardHeader>
          <CardTitle>Withdrawal Options</CardTitle>
          <CardDescription>Understanding how withdrawals work on EduZero</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="mb-4">You have two types of assets you can withdraw from EduZero:</p>
            <div className="grid grid-cols-1 gap-4">
              <div className="rounded-lg border p-4">
                <div className="font-semibold mb-1 flex items-center gap-2">
                  <ArrowDownUp className="h-4 w-4 text-pink-500" />
                  Deposit Withdrawal
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Withdraw your original deposited funds. This is subject to a 30-day lock period.
                </p>
                <div className="text-sm font-medium">Available: 2,400 USDC</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="font-semibold mb-1 flex items-center gap-2">
                  <ArrowDownUp className="h-4 w-4 text-violet-500" />
                  Rewards Withdrawal
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Withdraw your accumulated rewards. These can be withdrawn at any time without fees.
                </p>
                <div className="text-sm font-medium">Available: 100 USDC</div>
              </div>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Early Withdrawal Fee</AlertTitle>
            <AlertDescription>
              Withdrawing your deposit before the 30-day lock period will incur a 5% fee. This fee helps maintain
              platform stability.
            </AlertDescription>
          </Alert>

          <div className="rounded-lg bg-muted p-4">
            <div className="font-semibold mb-2">Withdrawal Process</div>
            <p className="text-sm text-muted-foreground">
              Withdrawals are typically processed within 24 hours. Once processed, the funds will be sent to your
              connected wallet. Make sure your wallet is properly connected before initiating a withdrawal.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
