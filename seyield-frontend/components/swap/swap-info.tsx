"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ArrowLeftRight, Info } from "lucide-react"

export function SwapInfo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      id="swap-info"
    >
      <Card className="h-full border border-pink-100 dark:border-pink-900/20">
        <CardHeader>
          <CardTitle>Principal Token Swapping</CardTitle>
          <CardDescription>Understanding how to swap between different principal tokens</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="mb-4">EduZero allows you to swap between different principal tokens:</p>
            <div className="grid grid-cols-1 gap-4">
              <div className="rounded-lg border p-4">
                <div className="font-semibold mb-1 flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4 text-pink-500" />
                  Available Principal Tokens
                </div>
                <ul className="space-y-2 mt-2">
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 font-bold">•</span>
                    <div>
                      <span className="font-medium">pUSDC</span>
                      <p className="text-sm text-muted-foreground">USDC-backed principal token, stable value</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 font-bold">•</span>
                    <div>
                      <span className="font-medium">pUSDT</span>
                      <p className="text-sm text-muted-foreground">USDT-backed principal token, stable value</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 font-bold">•</span>
                    <div>
                      <span className="font-medium">pSEI</span>
                      <p className="text-sm text-muted-foreground">
                        SEI-backed principal token, potential for appreciation
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 font-bold">•</span>
                    <div>
                      <span className="font-medium">pETH</span>
                      <p className="text-sm text-muted-foreground">
                        ETH-backed principal token, potential for appreciation
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 text-blue-800 dark:text-blue-300 text-sm">
            <div className="flex gap-2 items-start">
              <Info className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Why Swap Principal Tokens?</p>
                <p className="mt-1">Swapping between principal tokens allows you to:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Adjust your exposure to different assets</li>
                  <li>• Take advantage of market opportunities</li>
                  <li>• Manage risk by diversifying your principal tokens</li>
                  <li>• Move between stable and volatile assets based on market conditions</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="font-semibold mb-2">Swap Details</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• All principal tokens maintain the same 7% APY reward rate</li>
              <li>• Swaps use oracle price feeds to ensure fair exchange rates</li>
              <li>• A small 0.1% network fee applies to all swaps</li>
              <li>• Slippage tolerance is set to 0.5% to protect your swap</li>
              <li>• Your rewards balance is not affected by principal token swaps</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
