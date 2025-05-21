"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { useToast } from "../ui/use-toast"
import { useAccount } from "wagmi"
import { useTokenBalance } from "@/hooks/useTokenBalance"
import { useDeposit } from "@/hooks/useDeposit"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, Loader2, Info as InfoIcon } from "lucide-react"
import { formatUnits } from "viem"
import { contractAddresses } from "@/app/config/contract-addresses"

export function DepositForm() {
  const [amount, setAmount] = useState("")
  const [asset, setAsset] = useState("usdc")
  // We don't need toast here as it's handled in the useDeposit hook
  const { isConnected } = useAccount()
  const { symbol, isLoading: isBalanceLoading } = useTokenBalance(asset as 'sei' | 'usdc')

  // Use our custom deposit hook
  const {
    isApproved,
    isApproveLoading,
    isDepositLoading,
    isApproveComplete,
    isDepositComplete,
    usdcBalance,
    pSyldBalance,
    ySyldBalance,
    handleApprove,
    handleDeposit,
    handleOneClickDeposit,
    forceRefreshBalances,
  } = useDeposit()

  // Format balances for display
  const formattedUsdcBalance = usdcBalance ? formatUnits(usdcBalance, 6) : "0"
  const formattedPSyldBalance = pSyldBalance ? formatUnits(pSyldBalance, 6) : "0"
  const formattedYSyldBalance = ySyldBalance ? formatUnits(ySyldBalance, 6) : "0"

  // Reset amount when deposit is complete
  useEffect(() => {
    if (isDepositComplete) {
      setAmount("")
    }
  }, [isDepositComplete])

  // We've moved the automatic deposit logic to the useDeposit hook
  // This ensures it happens in one place and avoids potential race conditions

  // Add countdown timer for transition from approval to deposit
  const [transitionCountdown, setTransitionCountdown] = useState(3);

  useEffect(() => {
    // Start countdown when approval is complete but deposit hasn't started
    if (isApproveComplete && !isDepositLoading && !isDepositComplete) {
      setTransitionCountdown(3);
      const interval = setInterval(() => {
        setTransitionCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isApproveComplete, isDepositLoading, isDepositComplete]);

  // Show a more prominent success notification
  const { toast } = useToast()

  useEffect(() => {
    if (isDepositComplete) {
      toast({
        title: "Deposit Successful! 🎉",
        description: "Your deposit has been processed and you've received pSYLD and ySYLD tokens.",
        variant: "default",
        duration: 10000,
      })
    }
  }, [isDepositComplete, toast])

  // Only allow USDC deposits for now
  useEffect(() => {
    if (asset !== "usdc") {
      setAsset("usdc")
    }
  }, [asset])

  // Common condition for disabling buttons
  const isInputInvalid =
    !isConnected ||
    !amount ||
    Number(amount) <= 0 ||
    isApproveLoading ||
    isDepositLoading

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      id="deposit-form"
    >
      <Card className="border border-pink-100 dark:border-pink-900/20">
        <CardHeader>
          <CardTitle>Deposit Assets</CardTitle>
          <CardDescription>Deposit your assets to start generating rewards for shopping</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
            <p className="text-xs text-muted-foreground">Currently only USDC deposits are supported</p>
          </div>

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
              <div className="text-xs text-muted-foreground mt-1 text-center">
                <p>If balances don't update after a transaction, click Refresh</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="amount">Amount</Label>
              {isConnected && (
                <div className="text-sm text-muted-foreground">
                  Balance: {isBalanceLoading ? "Loading..." : `${formattedUsdcBalance || "0"} ${symbol}`}
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
            {isConnected && formattedUsdcBalance && (
              <div className="flex justify-end">
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs text-primary"
                  onClick={() => setAmount(formattedUsdcBalance)}
                  disabled={isApproveLoading || isDepositLoading}
                >
                  Max
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2 rounded-lg bg-muted p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Annual Rewards (7%)</span>
              <span className="font-medium">
                {amount ? (Number.parseFloat(amount) * 0.07).toFixed(2) : "0.00"} {asset.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monthly Rewards</span>
              <span className="font-medium">
                {amount ? ((Number.parseFloat(amount) * 0.07) / 12).toFixed(2) : "0.00"} {asset.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Deposit Amount</span>
              <span className="font-medium">
                {amount || "0.00"} {asset.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-border">
              <span className="text-muted-foreground">You Receive</span>
              <div className="text-right">
                <div className="font-medium">{amount || "0.00"} pSYLD</div>
                <div className="font-medium text-green-600 dark:text-green-500">
                  +{amount ? (Number.parseFloat(amount) * 0.07).toFixed(2) : "0.00"} ySYLD
                </div>
              </div>
            </div>
          </div>

          {/* Status alerts */}
          {isApproveLoading && (
            <Alert variant="default" className="bg-blue-500/10 border-blue-500/20">
              <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
              <AlertTitle className="text-blue-500">Transaction 1/2: Approving USDC</AlertTitle>
              <AlertDescription>
                <p>Please confirm the approval transaction in your wallet if prompted.</p>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-2">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">1</span>
                    </div>
                    <p className="text-xs">
                      Approving USDC token
                      <span className="text-muted-foreground ml-1">
                        ({contractAddresses.usdc.substring(0, 6)}...{contractAddresses.usdc.substring(38)})
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-2">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">2</span>
                    </div>
                    <p className="text-xs">
                      To be spent by Vault contract
                      <span className="text-muted-foreground ml-1">
                        ({contractAddresses.fundsVault.substring(0, 6)}...{contractAddresses.fundsVault.substring(38)})
                      </span>
                    </p>
                  </div>
                </div>

                <p className="text-xs mt-3 text-muted-foreground">
                  This is a one-time approval that allows the vault to use your USDC for deposits.
                  After this approval completes, the deposit transaction will start automatically.
                </p>

                <div className="mt-3 p-2 rounded-md bg-blue-500/5 border border-blue-500/10">
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Transaction Progress:</p>
                  <p className="text-xs mt-1">
                    ⏳ Transaction 1/2 (Approval) - In Progress<br />
                    ⌛ Transaction 2/2 (Deposit) - Waiting for approval to complete
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Transition alert - shows when approval is complete but deposit hasn't started yet */}
          {isApproveComplete && !isDepositLoading && !isDepositComplete && (
            <Alert variant="default" className="bg-amber-500/10 border-amber-500/20">
              <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
              <AlertTitle className="text-amber-500">Approval Successful ✓ | Preparing Deposit...</AlertTitle>
              <AlertDescription>
                <p>Your USDC approval transaction has been confirmed on the blockchain!</p>
                <p className="text-xs mt-2 font-medium">Next Step: Deposit Transaction</p>
                <p className="text-xs mt-1">
                  Please wait a moment. Deposit will start automatically in <span className="font-bold">{transitionCountdown}</span> seconds.
                </p>
                <div className="w-full bg-amber-100 dark:bg-amber-950/30 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${((3 - transitionCountdown) / 3) * 100}%` }}
                  />
                </div>
                <p className="text-xs mt-2 text-muted-foreground">
                  Transaction 1/2 (Approval) ✓ Complete<br />
                  Transaction 2/2 (Deposit) ⏳ Starting soon...
                </p>
              </AlertDescription>
            </Alert>
          )}

          {isDepositLoading && (
            <Alert variant="default" className="bg-blue-500/10 border-blue-500/20">
              <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
              <AlertTitle className="text-blue-500">Processing Deposit Transaction</AlertTitle>
              <AlertDescription>
                <p>Your deposit transaction is being processed. Please confirm it in your wallet if prompted.</p>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-2">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">1</span>
                    </div>
                    <p className="text-xs">
                      Depositing {amount} USDC to Vault contract
                      <span className="text-muted-foreground ml-1">
                        ({contractAddresses.fundsVault.substring(0, 6)}...{contractAddresses.fundsVault.substring(38)})
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-2">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">2</span>
                    </div>
                    <p className="text-xs">
                      Minting {amount} pSYLD tokens
                      <span className="text-muted-foreground ml-1">
                        ({contractAddresses.principalToken.substring(0, 6)}...{contractAddresses.principalToken.substring(38)})
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-2">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">3</span>
                    </div>
                    <p className="text-xs">
                      Minting {Number(amount) * 0.07} ySYLD tokens
                      <span className="text-muted-foreground ml-1">
                        ({contractAddresses.yieldToken.substring(0, 6)}...{contractAddresses.yieldToken.substring(38)})
                      </span>
                    </p>
                  </div>
                </div>

                <p className="text-xs mt-3 text-muted-foreground">
                  Please wait while the transaction is being confirmed on the blockchain. This may take a few moments.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Error alert for common issues */}
          {!isApproveLoading && !isDepositLoading && !isApproveComplete && !isDepositComplete && amount && (
            <Alert variant="default" className="bg-blue-500/5 border-blue-500/10">
              <InfoIcon className="h-4 w-4 text-blue-500" />
              <AlertTitle className="text-blue-500">Transaction Information</AlertTitle>
              <AlertDescription>
                <p className="text-xs">
                  If you encounter errors during deposit, please try these steps:
                </p>
                <ul className="text-xs list-disc pl-4 mt-1 space-y-1">
                  <li>Make sure you have enough USDC in your wallet</li>
                  <li>Try using a smaller amount for your first deposit</li>
                  <li>If approval succeeds but deposit fails, try the "Force Deposit" button</li>
                  <li>Check that you have enough SEI for gas fees</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {isDepositComplete && (
            <Alert variant="default" className="bg-green-500/10 border-green-500/20">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-500">Deposit Successful! 🎉</AlertTitle>
              <AlertDescription>
                <div className="mt-2 p-3 rounded-md bg-green-500/5 border border-green-500/20">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Transaction Summary:</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center">
                      <p className="text-xs">Deposited USDC:</p>
                      <p className="text-xs font-medium">{amount} USDC</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs">Received pSYLD:</p>
                      <p className="text-xs font-medium">{formattedPSyldBalance} pSYLD</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs">Received ySYLD:</p>
                      <p className="text-xs font-medium">{formattedYSyldBalance} ySYLD</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-2">
                      <span className="text-[10px] font-bold text-green-600 dark:text-green-400">✓</span>
                    </div>
                    <p className="text-xs">
                      USDC transferred to Vault
                      <span className="text-muted-foreground ml-1">
                        ({contractAddresses.fundsVault.substring(0, 6)}...{contractAddresses.fundsVault.substring(38)})
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-2">
                      <span className="text-[10px] font-bold text-green-600 dark:text-green-400">✓</span>
                    </div>
                    <p className="text-xs">
                      pSYLD tokens minted to your wallet
                      <span className="text-muted-foreground ml-1">
                        ({contractAddresses.principalToken.substring(0, 6)}...{contractAddresses.principalToken.substring(38)})
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-2">
                      <span className="text-[10px] font-bold text-green-600 dark:text-green-400">✓</span>
                    </div>
                    <p className="text-xs">
                      ySYLD tokens minted to your wallet
                      <span className="text-muted-foreground ml-1">
                        ({contractAddresses.yieldToken.substring(0, 6)}...{contractAddresses.yieldToken.substring(38)})
                      </span>
                    </p>
                  </div>
                </div>

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

                <p className="text-xs text-center mt-3 text-green-600 dark:text-green-400 font-medium">
                  Thank you for depositing with SEYIELD! 🚀
                </p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {/* One-click deposit button */}
          <Button
            onClick={() => handleOneClickDeposit(amount)}
            disabled={isInputInvalid}
            className="w-full bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700"
          >
            {!isConnected
              ? "Connect Wallet"
              : isApproveLoading
                ? "Approving... (1/2)"
                : isDepositLoading
                  ? "Depositing... (2/2)"
                  : !isApproved
                    ? "Approve & Deposit"
                    : isApproveComplete && !isDepositComplete
                      ? "Deposit Starting..."
                      : "Deposit USDC"}
          </Button>

          {/* Show separate approve and deposit buttons for more control */}
          {isConnected && !isApproveLoading && !isDepositLoading && (
            <div className="flex gap-2 w-full">
              <Button
                onClick={() => handleApprove(amount)}
                disabled={isInputInvalid || isApproved || isApproveComplete}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                Approve Only
              </Button>

              <Button
                onClick={() => handleDeposit(amount)}
                disabled={!isApproved && !isApproveComplete}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                Deposit Only
              </Button>
            </div>
          )}

          {/* Emergency button for when approval is complete but deposit doesn't start automatically */}
          {isConnected && isApproveComplete && !isDepositComplete && !isDepositLoading && (
            <div className="mt-2">
              <Button
                onClick={() => handleDeposit(amount)}
                variant="outline"
                className="w-full text-amber-600 border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                size="sm"
                disabled={transitionCountdown > 0}
              >
                {transitionCountdown > 0
                  ? `Waiting for automatic deposit (${transitionCountdown}s)...`
                  : "Force Deposit (If Automatic Deposit Failed)"}
              </Button>
            </div>
          )}

          {isConnected && (
            <div className="text-xs text-center text-muted-foreground">
              <p>Depositing will mint pSYLD tokens at a 1:1 ratio with your USDC</p>
              <p>You'll also receive ySYLD tokens (7% of deposit) for marketplace purchases</p>
              <p className="mt-1">You can withdraw your deposit at any time</p>

              {/* Status indicators */}
              {!isApproved && !isApproveComplete && (
                <p className="mt-1 text-amber-500">Note: This requires two transactions - first approve, then deposit</p>
              )}

              {isApproveComplete && !isDepositComplete && (
                <p className="mt-1 text-blue-500">Approval complete! Deposit should start automatically...</p>
              )}

              {isApproved && !isApproveComplete && (
                <p className="mt-1 text-green-500">Your allowance is already set! You can deposit directly.</p>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}
