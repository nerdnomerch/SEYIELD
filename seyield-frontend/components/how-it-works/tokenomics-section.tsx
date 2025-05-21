"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TokenomicsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="py-16"
    >
      <h2 className="text-3xl font-bold text-center mb-8">DeFi Tokenomics</h2>
      <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
        Understanding the token mechanics behind EduZero's Buy Now, Pay Never model
      </p>

      <Tabs defaultValue="tokens" className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tokens">Token Types</TabsTrigger>
          <TabsTrigger value="mechanism">Reward Mechanism</TabsTrigger>
          <TabsTrigger value="liquidity">Liquidity Pools</TabsTrigger>
        </TabsList>

        <TabsContent value="tokens" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Principal & Reward Tokens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-lg border p-4 bg-gradient-to-br from-pink-50 to-transparent dark:from-pink-950/20 dark:to-transparent">
                  <h3 className="font-bold text-lg mb-2">Principal Tokens (pTokens)</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-pink-500 font-bold">•</span>
                      <span>Represent your deposited assets (pUSDC, pUSDT, pSEI, pETH)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-500 font-bold">•</span>
                      <span>Remain locked in smart contracts for minimum 30 days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-500 font-bold">•</span>
                      <span>Can be swapped between different asset types</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-500 font-bold">•</span>
                      <span>Generate rewards at 7% APY</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border p-4 bg-gradient-to-br from-violet-50 to-transparent dark:from-violet-950/20 dark:to-transparent">
                  <h3 className="font-bold text-lg mb-2">Reward Tokens</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-violet-500 font-bold">•</span>
                      <span>Provided upfront based on expected yield</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-500 font-bold">•</span>
                      <span>Used for purchases in the marketplace</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-500 font-bold">•</span>
                      <span>Can be withdrawn to your wallet</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-violet-500 font-bold">•</span>
                      <span>Denominated in the same asset as your principal</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="rounded-lg border p-4 mt-4">
                <h3 className="font-bold text-lg mb-2">Token Flow Example</h3>
                <p>When you deposit 1,000 USDC:</p>
                <ul className="space-y-1 mt-2">
                  <li>• You receive 1,000 pUSDC (principal token)</li>
                  <li>• You immediately receive 70 USDC in rewards (7% APY)</li>
                  <li>• You can spend the 70 USDC on marketplace items</li>
                  <li>• Your 1,000 pUSDC remains intact in the protocol</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mechanism" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Reward Generation Mechanism</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-bold text-lg mb-2">How Rewards Are Generated</h3>
                <p className="mb-4">EduZero uses multiple DeFi strategies to generate the promised 7% APY:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 font-bold">1.</span>
                    <span>
                      <strong>Liquidity Provision:</strong> Your deposited assets are used to provide liquidity in DEXs,
                      earning trading fees
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 font-bold">2.</span>
                    <span>
                      <strong>Lending:</strong> A portion is allocated to lending protocols to earn interest
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 font-bold">3.</span>
                    <span>
                      <strong>Yield Farming:</strong> Strategic yield farming in established protocols
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-500 font-bold">4.</span>
                    <span>
                      <strong>Staking:</strong> Staking in proof-of-stake networks for additional rewards
                    </span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border p-4 bg-gradient-to-br from-violet-50 to-transparent dark:from-violet-950/20 dark:to-transparent">
                <h3 className="font-bold text-lg mb-2">Upfront Rewards Model</h3>
                <p className="mb-2">
                  Unlike traditional DeFi where rewards accrue over time, EduZero provides rewards upfront:
                </p>
                <ul className="space-y-1">
                  <li>• Protocol calculates expected annual yield (7% of deposit)</li>
                  <li>• This amount is immediately credited to your rewards balance</li>
                  <li>• Protocol earns back this advance through the DeFi strategies</li>
                  <li>• Risk management reserves ensure protocol solvency</li>
                </ul>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-bold text-lg mb-2">Risk Mitigation</h3>
                <p>
                  The protocol maintains a reserve fund of 20% of all deposits to ensure upfront rewards can always be
                  paid, even if DeFi yields temporarily drop below the promised 7% APY.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="liquidity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Liquidity & Trading</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-bold text-lg mb-2">Principal Token Liquidity</h3>
                <p className="mb-4">Principal tokens (pTokens) can be traded on decentralized exchanges:</p>
                <ul className="space-y-1">
                  <li>• pUSDC/USDC trading pair</li>
                  <li>• pUSDT/USDT trading pair</li>
                  <li>• pSEI/SEI trading pair</li>
                  <li>• pETH/ETH trading pair</li>
                </ul>
                <p className="mt-4">
                  Trading allows users to exit positions before the 30-day lock period, though typically at a small
                  discount to face value.
                </p>
              </div>

              <div className="rounded-lg border p-4 bg-gradient-to-br from-pink-50 to-transparent dark:from-pink-950/20 dark:to-transparent">
                <h3 className="font-bold text-lg mb-2">Swapping Between Principal Tokens</h3>
                <p className="mb-2">Users can swap between different principal tokens:</p>
                <ul className="space-y-1">
                  <li>• Convert pUSDC to pSEI if you believe SEI will outperform USDC</li>
                  <li>• Swap pETH to pUSDT to reduce volatility</li>
                  <li>• All swaps maintain the same reward rate (7% APY)</li>
                  <li>• Swaps use oracle price feeds to ensure fair exchange rates</li>
                </ul>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-bold text-lg mb-2">Protocol-Owned Liquidity</h3>
                <p>
                  A portion of protocol fees is used to build protocol-owned liquidity, ensuring pTokens always have
                  sufficient trading liquidity and helping maintain price stability close to the underlying asset value.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
