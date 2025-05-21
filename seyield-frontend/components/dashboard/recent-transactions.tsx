"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ArrowDownUp, ShoppingBag, Wallet, ArrowLeftRight } from "lucide-react"

const transactions = [
  {
    id: 1,
    type: "deposit",
    icon: Wallet,
    description: "Deposit",
    amount: "+1,000 USDC",
    date: "Apr 18, 2023",
    status: "completed",
  },
  {
    id: 2,
    type: "purchase",
    icon: ShoppingBag,
    description: "Amazon Purchase",
    amount: "-25 USDC",
    date: "Apr 15, 2023",
    status: "completed",
  },
  {
    id: 3,
    type: "reward",
    icon: ArrowDownUp,
    description: "Rewards Payout",
    amount: "+14 USDC",
    date: "Apr 1, 2023",
    status: "completed",
  },
  {
    id: 4,
    type: "convert",
    icon: ArrowLeftRight,
    description: "Convert Deposit to Rewards",
    amount: "+20 USDC",
    date: "Mar 28, 2023",
    status: "completed",
  },
]

export function RecentTransactions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="h-full border border-pink-100 dark:border-pink-900/20">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center gap-4">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    transaction.type === "deposit"
                      ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                      : transaction.type === "purchase"
                        ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                        : transaction.type === "convert"
                          ? "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
                          : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  }`}
                >
                  <transaction.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{transaction.description}</div>
                  <div className="text-sm text-muted-foreground">{transaction.date}</div>
                </div>
                <div
                  className={`font-medium ${
                    transaction.amount.startsWith("+")
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {transaction.amount}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
