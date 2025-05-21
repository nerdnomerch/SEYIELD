'use client'

import { useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { useFaucet } from '@/hooks/useFaucet'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export function FaucetNotification() {
  const { toast } = useToast()
  const {
    isClaimLoading,
    isClaimComplete,
    claimError,
    claimData
  } = useFaucet()

  // Show toast when claim starts
  useEffect(() => {
    if (isClaimLoading && claimData?.hash) {
      toast({
        title: "Claim in progress",
        description: "Your claim is being processed on the blockchain. This may take a few moments...",
        action: claimData.hash ? (
          <ToastAction
            altText="View transaction"
            onClick={() => window.open(`https://sei.explorers.guru/tx/${claimData.hash}`, '_blank')}
          >
            View TX
          </ToastAction>
        ) : undefined,
        duration: 10000, // Show for 10 seconds
      })
    }
  }, [isClaimLoading, claimData, toast])

  // Show toast when claim completes
  useEffect(() => {
    if (isClaimComplete && claimData?.hash) {
      toast({
        title: "Tokens claimed successfully! 🎉",
        description: "You've received 1000 USDC in your wallet. You can now use these tokens in the SEYIELD platform.",
        action: (
          <ToastAction
            altText="View transaction"
            onClick={() => window.open(`https://sei.explorers.guru/tx/${claimData.hash}`, '_blank')}
          >
            View TX
          </ToastAction>
        ),
        duration: 8000, // Show for 8 seconds
      })
    }
  }, [isClaimComplete, claimData, toast])

  // Show toast when claim fails
  useEffect(() => {
    if (claimError) {
      // Extract revert reason if available
      let errorMessage = claimError.message || "Please try again later."
      if (typeof errorMessage === 'string' && errorMessage.includes('execution reverted:')) {
        errorMessage = errorMessage.split('execution reverted:')[1].trim()
      }

      // Check if the error is due to insufficient USDC balance
      const isInsufficientFunds = errorMessage.includes('Insufficient USDC balance')

      toast({
        title: isInsufficientFunds ? "Faucet needs funding ⚠️" : "Failed to claim tokens ❌",
        description: isInsufficientFunds
          ? "The faucet is currently out of USDC tokens. This is not an issue with your wallet. Please try again later when the faucet has been refilled."
          : `${errorMessage}. Please try again later or contact support if the issue persists.`,
        variant: isInsufficientFunds ? "default" : "destructive",
        action: claimData?.hash ? (
          <ToastAction
            altText="View transaction"
            onClick={() => window.open(`https://sei.explorers.guru/tx/${claimData.hash}`, '_blank')}
          >
            View TX
          </ToastAction>
        ) : undefined,
        duration: 10000, // Show for 10 seconds
      })
    }
  }, [claimError, claimData, toast])

  return null
}
