"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useWithdraw } from "@/hooks/useWithdraw"
import { formatUnits } from "viem"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle2, Info as InfoIcon } from "lucide-react"
import { useAccount } from "wagmi"

export function WithdrawForm() {
  const [amount, setAmount] = useState("")
  const [asset, setAsset] = useState("usdc")
  const [withdrawType, setWithdrawType] = useState("deposit")
  const { toast } = useToast()
  const { isConnected } = useAccount()

  // Use our custom withdraw hook
  const {
    isWithdrawLoading,
    isWithdrawComplete,
    userInfo,
    usdcBalance,
    pSyldBalance,
    ySyldBalance,
    handleWithdraw,
    forceRefreshBalances,
  } = useWithdraw()

  // Format balances for display
  const formattedUsdcBalance = usdcBalance ? formatUnits(usdcBalance, 6) : "0"
  const formattedPSyldBalance = pSyldBalance ? formatUnits(pSyldBalance, 6) : "0"
  const formattedYSyldBalance = ySyldBalance ? formatUnits(ySyldBalance, 6) : "0"

  // Reset amount when withdraw is complete
  useEffect(() => {
    if (isWithdrawComplete) {
      setAmount("")
    }
  }, [isWithdrawComplete])

  // Only allow USDC withdrawals for now
  useEffect(() => {
    if (asset !== "usdc") {
      setAsset("usdc")
    }
  }, [asset])

  // Handle withdraw
  const onWithdraw = async () => {
    if (withdrawType === "deposit") {
      await handleWithdraw(amount)
    } else {
      // For now, we don't support withdrawing rewards directly
      toast({
        title: "Not supported yet",
        description: "Withdrawing rewards directly is not supported yet. Please use the marketplace to spend your rewards.",
        variant: "destructive",
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      id="withdraw-form"
    >
      <Card className="border border-pink-100 dark:border-pink-900/20">
        <CardHeader>
          <CardTitle>Withdraw Assets</CardTitle>
          <CardDescription>Access your deposited funds</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isConnected && (
            <div className="rounded-lg border p-3 space-y-2">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium">Your Balances</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={forceRefreshBalances}
                >
                  <Loader2 className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">$</span>
                  </div>
                  <div>
                    <div className="text-muted-foreground">USDC</div>
                    <div className="font-medium">{formattedUsdcBalance}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                    <span className="text-xs font-bold text-pink-600 dark:text-pink-400">P</span>
                  </div>
                  <div>
                    <div className="text-muted-foreground">pSYLD</div>
                    <div className="font-medium">{formattedPSyldBalance}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <span className="text-xs font-bold text-green-600 dark:text-green-400">Y</span>
                  </div>
                  <div>
                    <div className="text-muted-foreground">ySYLD (Rewards)</div>
                    <div className="font-medium">{formattedYSyldBalance}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Withdraw From</Label>
            <RadioGroup value={withdrawType} onValueChange={setWithdrawType} className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="deposit" id="deposit" />
                <Label htmlFor="deposit" className="cursor-pointer">
                  Deposit ({formattedPSyldBalance} pSYLD available)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rewards" id="rewards" disabled />
                <Label htmlFor="rewards" className="cursor-pointer text-muted-foreground">
                  Rewards ({formattedYSyldBalance} ySYLD available) - Coming Soon
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="asset">Select Asset</Label>
            <Select value={asset} onValueChange={setAsset} disabled={true}>
              <SelectTrigger id="asset">
                <SelectValue placeholder="Select Asset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usdc">USDC</SelectItem>
                <SelectItem value="sei" disabled>SEI (Coming Soon)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Currently only USDC withdrawals are supported</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="amount">Amount</Label>
              {isConnected && (
                <div className="text-sm text-muted-foreground">
                  Balance: {withdrawType === "deposit" ? formattedPSyldBalance : formattedYSyldBalance} {withdrawType === "deposit" ? "pSYLD" : "ySYLD"}
                </div>
              )}
            </div>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-16"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                {asset.toUpperCase()}
              </div>
            </div>
            {isConnected && (
              <div className="flex justify-end">
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs text-primary"
                  onClick={() => setAmount(withdrawType === "deposit" ? formattedPSyldBalance : formattedYSyldBalance)}
                  disabled={isWithdrawLoading}
                >
                  Max
                </Button>
              </div>
            )}
          </div>

          {/* Status alerts */}
          {isWithdrawLoading && (
            <Alert variant="default" className="bg-blue-500/10 border-blue-500/20">
              <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
              <AlertTitle className="text-blue-500">Processing Withdrawal</AlertTitle>
              <AlertDescription>
                <p>Your withdrawal transaction is being processed. Please confirm it in your wallet if prompted.</p>
                <p className="text-xs mt-3 text-muted-foreground">
                  Please wait while the transaction is being confirmed on the blockchain. This may take a few moments.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {isWithdrawComplete && (
            <Alert variant="default" className="bg-green-500/10 border-green-500/20">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-500">Withdrawal Successful! 🎉</AlertTitle>
              <AlertDescription>
                <p>Your USDC has been withdrawn successfully.</p>
                <div className="mt-3 flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    If your balances haven't updated, click to refresh:
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs text-green-600 border-green-200"
                    onClick={forceRefreshBalances}
                  >
                    <Loader2 className="h-3 w-3 mr-1" />
                    Refresh Balances
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Error alert for common issues */}
          {!isWithdrawLoading && !isWithdrawComplete && amount && (
            <Alert variant="default" className="bg-blue-500/5 border-blue-500/10">
              <InfoIcon className="h-4 w-4 text-blue-500" />
              <AlertTitle className="text-blue-500">Transaction Information</AlertTitle>
              <AlertDescription>
                <p className="text-xs">
                  If you encounter errors during withdrawal, please try these steps:
                </p>
                <ul className="text-xs list-disc pl-4 mt-1 space-y-1">
                  <li>Make sure you have enough pSYLD in your wallet</li>
                  <li>Try using a smaller amount for your withdrawal</li>
                  <li>Check that you have enough SEI for gas fees</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            onClick={onWithdraw}
            disabled={!isConnected || !amount || Number.parseFloat(amount) <= 0 || isWithdrawLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700"
          >
            {!isConnected
              ? "Connect Wallet"
              : isWithdrawLoading
                ? "Processing..."
                : "Withdraw"}
          </Button>

          {isConnected && (
            <div className="text-xs text-center text-muted-foreground">
              <p>Withdrawing will burn your pSYLD tokens and return your USDC</p>
              <p className="mt-1">ySYLD tokens can only be used for marketplace purchases</p>
            </div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}
