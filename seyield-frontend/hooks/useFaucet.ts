'use client'

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { contractAddresses } from '@/app/config/contract-addresses'
import { faucetAbi } from '@/app/config/abis/faucet-abi'
import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { dispatchClaimSuccessEvent } from '@/components/faucet/faucet-success-listener'

export function useFaucet() {
  const { address, isConnected } = useAccount()
  const { toast } = useToast()
  const [isClaimable, setIsClaimable] = useState<boolean>(false)
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState<string>('')

  // Check if user can claim tokens
  const { data: canClaim, refetch: refetchCanClaim } = useReadContract({
    address: contractAddresses.faucet as `0x${string}`,
    abi: faucetAbi,
    functionName: 'getClaimableAmount',
    args: [address],
    query: {
      enabled: !!address && isConnected,
    }
  })

  // Get last claim time
  const { data: lastClaimTime, refetch: refetchLastClaimTime } = useReadContract({
    address: contractAddresses.faucet as `0x${string}`,
    abi: faucetAbi,
    functionName: 'lastClaimTime',
    args: [address],
    query: {
      enabled: !!address && isConnected,
    }
  })

  // Claim tokens
  const {
    data: claimData,
    isPending: isClaimLoading,
    isSuccess: isClaimStarted,
    writeContract: claimTokens,
    error: claimError
  } = useWriteContract()

  // Wait for transaction to complete
  const {
    isLoading: isClaimConfirming,
    isSuccess: isClaimComplete
  } = useWaitForTransactionReceipt({
    hash: claimData?.hash,
  })

  // Calculate time until next claim
  useEffect(() => {
    if (!lastClaimTime || lastClaimTime === BigInt(0)) {
      setTimeUntilNextClaim('')
      return
    }

    const updateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000)
      const claimTime = Number(lastClaimTime)
      const nextClaimTime = claimTime + 24 * 60 * 60 // 24 hours in seconds
      const timeRemaining = nextClaimTime - now

      if (timeRemaining <= 0) {
        setTimeUntilNextClaim('')
        setIsClaimable(true)
        return
      }

      setIsClaimable(false)

      // Format time remaining
      const hours = Math.floor(timeRemaining / 3600)
      const minutes = Math.floor((timeRemaining % 3600) / 60)
      const seconds = timeRemaining % 60

      setTimeUntilNextClaim(`${hours}h ${minutes}m ${seconds}s`)
    }

    updateTimeRemaining()
    const interval = setInterval(updateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [lastClaimTime])

  // Update claimable status based on contract data
  useEffect(() => {
    setIsClaimable(!!canClaim)
  }, [canClaim])

  // Handle claim completion
  useEffect(() => {
    if (isClaimComplete) {
      // Log success for debugging
      console.log('Faucet claim successful:', claimData)

      // Show success toast directly from the hook
      toast({
        title: "Tokens claimed successfully! 🎉",
        description: "You've received 1000 USDC in your wallet. You can now use these tokens in the SEYIELD platform.",
        duration: 8000, // Show for 8 seconds
      })

      // Dispatch a global event for the success
      dispatchClaimSuccessEvent(claimData?.hash)

      // Show a browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('SEYIELD Faucet', {
          body: 'You have successfully claimed 1000 USDC tokens!',
          icon: '/favicon.ico'
        })
      }

      // Refetch data after successful claim
      setTimeout(() => {
        refetchCanClaim()
        refetchLastClaimTime()
      }, 2000)
    }
  }, [isClaimComplete, claimData, toast, refetchCanClaim, refetchLastClaimTime])

  // Handle claim errors
  useEffect(() => {
    if (claimError) {
      // Log error for debugging
      console.error('Faucet claim error:', claimError)
    }
  }, [claimError])

  return {
    isClaimable,
    timeUntilNextClaim,
    isClaimLoading: isClaimLoading || isClaimConfirming,
    isClaimComplete,
    claimTokens: () => claimTokens({
      address: contractAddresses.faucet as `0x${string}`,
      abi: faucetAbi,
      functionName: 'claimTokens',
    }),
    isConnected,
    claimError,
    claimData,
  }
}
