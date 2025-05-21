"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { ArrowDownUp } from "lucide-react"
import { useAccount } from "wagmi"

const TOKENS = {
  pUSDC: { name: "pUSDC", price: 1.0, balance: 2400 },
  pUSDT: { name: "pUSDT", price: 1.0, balance: 500 },
  pSEI: { name: "pSEI", price: 0.25, balance: 1000 },
  pETH: { name: "pETH", price: 3000, balance: 0.8 },
}

export function SwapForm() {
  const [fromAmount, setFromAmount] = useState("")
  const [fromToken, setFromToken] = useState("pUSDC")
  const [toToken, setToToken] = useState("pSEI")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { address, isConnected } = useAccount()

  const handleSwap = () => {
    if (fromToken === toToken) {
      toast({
        title: "Invalid swap",
        description: "You cannot swap to the same token type.",
        variant: "destructive",
      })
      return
    }

    if (!address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to swap tokens.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Swap successful!",
        description: `You've swapped ${fromAmount} ${fromToken} to ${calculateToAmount()} ${toToken}.`,
      })
      setFromAmount("")
    }, 2000)
  }

  const handleSwapDirection = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
  }

  const calculateToAmount = () => {
    if (!fromAmount || !fromToken || !toToken) return "0.00"

    const fromValue = Number.parseFloat(fromAmount) * TOKENS[fromToken as keyof typeof TOKENS].price
    const toValue = fromValue / TOKENS[toToken as keyof typeof TOKENS].price

    return toValue.toFixed(toToken === "pETH" ? 6 : 2)
  }

  const getMaxBalance = () => {
    return TOKENS[fromToken as keyof typeof TOKENS]?.balance || 0
  }

  const handleSetMax = () => {
    setFromAmount(getMaxBalance().toString())
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      id="swap-form"
    >
      <Card className="border border-pink-100 dark:border-pink-900/20">
        <CardHeader>
          <CardTitle>Swap Principal Tokens</CardTitle>
          <CardDescription>
            Swap between different principal token types while maintaining your rewards rate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="fromToken">From</Label>
              <button type="button" onClick={handleSetMax} className="text-xs text-primary hover:underline">
                Max: {getMaxBalance()} {fromToken}
              </button>
            </div>
            <div className="flex gap-2">
              <Select value={fromToken} onValueChange={setFromToken}>
                <SelectTrigger id="fromToken" className="w-[140px]">
                  <SelectValue placeholder="Select Token" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pUSDC">pUSDC</SelectItem>
                  <SelectItem value="pUSDT">pUSDT</SelectItem>
                  <SelectItem value="pSEI">pSEI</SelectItem>
                  <SelectItem value="pETH">pETH</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Input
                  id="fromAmount"
                  type="number"
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button type="button" variant="outline" size="icon" className="rounded-full" onClick={handleSwapDirection}>
              <ArrowDownUp className="h-4 w-4" />
              <span className="sr-only">Swap direction</span>
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="toToken">To (Estimated)</Label>
            <div className="flex gap-2">
              <Select value={toToken} onValueChange={setToToken}>
                <SelectTrigger id="toToken" className="w-[140px]">
                  <SelectValue placeholder="Select Token" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pUSDC">pUSDC</SelectItem>
                  <SelectItem value="pUSDT">pUSDT</SelectItem>
                  <SelectItem value="pSEI">pSEI</SelectItem>
                  <SelectItem value="pETH">pETH</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Input
                  id="toAmount"
                  type="text"
                  placeholder="0.00"
                  value={calculateToAmount()}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Exchange Rate</span>
              <span className="font-medium">
                1 {fromToken} ={" "}
                {(
                  TOKENS[fromToken as keyof typeof TOKENS].price / TOKENS[toToken as keyof typeof TOKENS].price
                ).toFixed(toToken === "pETH" ? 6 : 4)}{" "}
                {toToken}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-muted-foreground">Network Fee</span>
              <span className="font-medium">0.1%</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-muted-foreground">Slippage Tolerance</span>
              <span className="font-medium">0.5%</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSwap}
            disabled={
              !fromAmount || Number.parseFloat(fromAmount) <= 0 || isLoading || fromToken === toToken || !address
            }
            className="w-full bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700"
          >
            {!address ? "Connect Wallet to Swap" : isLoading ? "Processing..." : "Swap"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
