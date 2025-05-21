
'use client'

import { useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { useAccount } from 'wagmi'
import { contractAddresses } from '@/app/config/contract-addresses'

// Custom event name for faucet claim success
export const FAUCET_CLAIM_SUCCESS_EVENT = 'faucet-claim-success'

export function FaucetSuccessListener() {
  const { toast } = useToast()
  const { address } = useAccount()

  useEffect(() => {
    // Function to handle the custom event
    const handleClaimSuccess = (event: CustomEvent) => {
      const { txHash } = event.detail || {}
      
      console.log('FaucetSuccessListener: Claim success event received', event.detail)
      
      // Show a toast notification
      toast({
        title: "Tokens claimed successfully! 🎉",
        description: "You've received 1000 USDC in your wallet. You can now use these tokens in the SEYIELD platform.",
        action: txHash ? (
          <ToastAction 
            altText="View transaction" 
            onClick={() => window.open(`https://sei.explorers.guru/tx/${txHash}`, '_blank')}
          >
            View TX
          </ToastAction>
        ) : undefined,
        duration: 8000, // Show for 8 seconds
      })
      
      // Also show a browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('SEYIELD Faucet', {
          body: 'You have successfully claimed 1000 USDC tokens!',
          icon: '/favicon.ico'
        })
      }
    }

    // Add event listener for the custom event
    window.addEventListener(FAUCET_CLAIM_SUCCESS_EVENT, handleClaimSuccess as EventListener)

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener(FAUCET_CLAIM_SUCCESS_EVENT, handleClaimSuccess as EventListener)
    }
  }, [toast, address])

  return null
}

// Helper function to dispatch the success event
export function dispatchClaimSuccessEvent(txHash?: string) {
  const event = new CustomEvent(FAUCET_CLAIM_SUCCESS_EVENT, {
    detail: { txHash }
  })
  window.dispatchEvent(event)
}
