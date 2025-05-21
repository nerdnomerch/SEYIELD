
'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useFaucet } from "@/hooks/useFaucet"
import { ConnectButton } from "@/components/web3/ConnectButton"
import { Coins, Clock, CheckCircle2, AlertCircle, Loader2, ExternalLink } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useAccount } from "wagmi"
import { useState, useEffect } from "react"

export function FaucetUI() {
  const { address } = useAccount()
  const {
    isClaimable,
    timeUntilNextClaim,
    isClaimLoading,
    isClaimComplete,
    claimTokens,
    isConnected,
    claimError,
    claimData
  } = useFaucet()

  const [txHash, setTxHash] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Update transaction hash when claim data changes
  useEffect(() => {
    if (claimData?.hash) {
      setTxHash(claimData.hash)
    }
  }, [claimData])

  // Update error message when claim error changes
  useEffect(() => {
    if (claimError) {
      let message = claimError.message || "Unknown error occurred"
      if (typeof message === 'string' && message.includes('execution reverted:')) {
        message = message.split('execution reverted:')[1].trim()
      }
      setErrorMessage(message)
    } else {
      setErrorMessage('')
    }
  }, [claimError])

  // Check if the error is due to insufficient USDC balance
  const isInsufficientFunds = errorMessage.includes('Insufficient USDC balance')

  // Show a success message when claim is complete
  useEffect(() => {
    if (isClaimComplete) {
      // Add a visual indicator that the claim was successful
      const successElement = document.createElement('div');
      successElement.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black/50';
      successElement.innerHTML = `
        <div class="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-md w-full text-center transform transition-all animate-in fade-in slide-in-from-bottom-5">
          <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold mb-2">Claim Successful!</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">You've received 1,000 USDC in your wallet.</p>
          <button class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">OK</button>
        </div>
      `;

      document.body.appendChild(successElement);

      // Add click event to close the modal
      successElement.addEventListener('click', () => {
        document.body.removeChild(successElement);
      });

      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (document.body.contains(successElement)) {
          document.body.removeChild(successElement);
        }
      }, 5000);
    }
  }, [isClaimComplete]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          Testnet Faucet
        </CardTitle>
        <CardDescription>
          Claim test tokens to use on the SEI Testnet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <p className="text-center text-muted-foreground">
              Connect your wallet to claim test tokens
            </p>
            <ConnectButton />
          </div>
        ) : (
          <>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">You will receive</p>
              <p className="text-xl font-bold">1,000 USDC</p>
            </div>

            {/* Claim cooldown alert */}
            {timeUntilNextClaim ? (
              <Alert variant="default" className="bg-muted/50 border-muted">
                <Clock className="h-4 w-4" />
                <AlertTitle>Claim cooldown</AlertTitle>
                <AlertDescription>
                  You can claim again in {timeUntilNextClaim}
                </AlertDescription>
              </Alert>
            ) : null}

            {/* Claim loading alert */}
            {isClaimLoading && (
              <Alert variant="default" className="bg-blue-500/10 border-blue-500/20">
                <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                <AlertTitle className="text-blue-500">Processing claim</AlertTitle>
                <AlertDescription className="space-y-2">
                  <div className="flex flex-col gap-2">
                    <p>Your claim is being processed on the blockchain. Please wait...</p>

                    <div className="flex flex-col gap-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />
                        </div>
                        <div className="text-sm text-blue-500">Submitting transaction</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />
                        </div>
                        <div className="text-sm text-blue-500">Waiting for confirmation</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <div className="h-3 w-3 text-blue-500/40">3</div>
                        </div>
                        <div className="text-sm text-blue-500/40">Receiving tokens</div>
                      </div>
                    </div>
                  </div>

                  {txHash && (
                    <div className="mt-2 pt-2 border-t border-blue-500/20">
                      <p className="text-xs flex items-center gap-1">
                        Transaction details:
                        <a
                          href={`https://sei.explorers.guru/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline flex items-center gap-1"
                        >
                          {txHash.slice(0, 6)}...{txHash.slice(-4)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Claim success alert */}
            {isClaimComplete && (
              <Alert variant="default" className="bg-green-500/10 border-green-500/20">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertTitle className="text-green-500">Claim successful!</AlertTitle>
                <AlertDescription className="space-y-2">
                  <div className="flex flex-col gap-2">
                    <p>You have successfully claimed 1,000 USDC test tokens.</p>
                    <div className="flex items-center gap-2 text-green-500 text-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Tokens have been sent to your wallet</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-500 text-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>You can now use these tokens in the SEYIELD platform</span>
                    </div>
                  </div>

                  {txHash && (
                    <div className="mt-2 pt-2 border-t border-green-500/20">
                      <p className="text-xs flex items-center gap-1">
                        Transaction details:
                        <a
                          href={`https://sei.explorers.guru/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-500 hover:underline flex items-center gap-1"
                        >
                          {txHash.slice(0, 6)}...{txHash.slice(-4)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Claim error alert */}
            {errorMessage && !isClaimLoading && (
              <Alert variant={isInsufficientFunds ? "default" : "destructive"} className={isInsufficientFunds ? "bg-amber-500/10 border-amber-500/20" : undefined}>
                <AlertCircle className={`h-4 w-4 ${isInsufficientFunds ? "text-amber-500" : ""}`} />
                <AlertTitle className={isInsufficientFunds ? "text-amber-500" : undefined}>
                  {isInsufficientFunds ? "Faucet needs funding" : "Claim failed"}
                </AlertTitle>
                <AlertDescription className="space-y-2">
                  {isInsufficientFunds ? (
                    <div className="flex flex-col gap-2">
                      <p>The faucet is currently out of USDC tokens. Please try again later when it has been refilled.</p>

                      <div className="flex items-start gap-2 text-amber-500 text-sm">
                        <AlertCircle className="h-4 w-4 mt-0.5" />
                        <span>The faucet contract doesn't have enough USDC tokens to fulfill your request.</span>
                      </div>

                      <div className="flex items-start gap-2 text-amber-500 text-sm">
                        <AlertCircle className="h-4 w-4 mt-0.5" />
                        <span>This is not an issue with your wallet or transaction. The faucet simply needs to be refilled by an admin.</span>
                      </div>

                      <p className="text-xs mt-2">Technical error: {errorMessage}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <p>{errorMessage}</p>

                      <div className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 mt-0.5" />
                        <span>There was an error processing your claim. This could be due to network issues or contract restrictions.</span>
                      </div>

                      <div className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 mt-0.5" />
                        <span>Please try again later or contact support if the issue persists.</span>
                      </div>
                    </div>
                  )}

                  {txHash && (
                    <div className={`mt-2 pt-2 border-t ${isInsufficientFunds ? "border-amber-500/20" : "border-destructive/20"}`}>
                      <p className="text-xs flex items-center gap-1">
                        Transaction details:
                        <a
                          href={`https://sei.explorers.guru/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${isInsufficientFunds ? "text-amber-500" : "text-destructive-foreground"} hover:underline flex items-center gap-1`}
                        >
                          {txHash.slice(0, 6)}...{txHash.slice(-4)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Checking eligibility alert */}
            {!isClaimable && !isClaimComplete && !timeUntilNextClaim && !isClaimLoading && !errorMessage && (
              <Alert variant="default" className="bg-yellow-500/10 border-yellow-500/20">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <AlertTitle className="text-yellow-500">Checking eligibility</AlertTitle>
                <AlertDescription>
                  Please wait while we check if you can claim tokens...
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        {isConnected && (
          <Button
            onClick={() => claimTokens()}
            disabled={!isClaimable || isClaimLoading || isClaimComplete}
            className="w-full gap-2 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700"
          >
            <Coins className="h-4 w-4" />
            {isClaimLoading
              ? "Claiming..."
              : isClaimComplete
                ? "Claimed Successfully"
                : !isClaimable && timeUntilNextClaim
                  ? "Claim on Cooldown"
                  : "Claim Test Tokens"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
