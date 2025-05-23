'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { contractAddresses } from '@/app/config/contract-addresses'
import { fundsVaultAbi } from '@/app/config/abis/funds-vault-abi'
import { erc20Abi } from '@/app/config/abis/erc20-abi'
import { useToast } from '@/components/ui/use-toast'

export function useWithdraw() {
  const { address, isConnected } = useAccount()
  const { toast } = useToast()
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false)

  // Get user's deposit info
  const { data: userInfo, refetch: refetchUserInfo } = useReadContract({
    address: contractAddresses.fundsVault as `0x${string}`,
    abi: fundsVaultAbi,
    functionName: 'userInfo',
    args: [address],
    query: {
      enabled: !!address && isConnected,
    }
  })

  // Get user's USDC balance
  const { data: usdcBalance, refetch: refetchUsdcBalance } = useReadContract({
    address: contractAddresses.usdc as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: !!address && isConnected,
    }
  })

  // Get user's pSYLD balance
  const { data: pSyldBalance, refetch: refetchPSyldBalance } = useReadContract({
    address: contractAddresses.principalToken as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: !!address && isConnected,
    }
  })

  // Get user's ySYLD balance
  const { data: ySyldBalance, refetch: refetchYSyldBalance } = useReadContract({
    address: contractAddresses.yieldToken as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: !!address && isConnected,
    }
  })

  // Withdraw USDC
  const {
    data: withdrawData,
    isPending: isWithdrawPending,
    writeContract: withdrawUsdc,
    error: withdrawError
  } = useWriteContract()

  // Wait for withdraw transaction to complete
  const {
    isLoading: isWithdrawConfirming,
    isSuccess: isWithdrawComplete
  } = useWaitForTransactionReceipt({
    hash: withdrawData,
  })

  // Handle withdraw completion
  useEffect(() => {
    if (isWithdrawComplete) {
      toast({
        title: "Withdrawal successful!",
        description: "Your USDC has been withdrawn successfully.",
        variant: "default",
        duration: 5000,
      })

      // Refresh balances
      Promise.all([
        refetchUserInfo(),
        refetchUsdcBalance(),
        refetchPSyldBalance(),
        refetchYSyldBalance()
      ]).then(() => {
        console.log("Balances refreshed after withdrawal");
      });
    }
  }, [isWithdrawComplete, toast, refetchUserInfo, refetchUsdcBalance, refetchPSyldBalance, refetchYSyldBalance])

  // Function to force refresh all balances with useCallback to avoid dependency issues
  const forceRefreshBalances = useCallback(async () => {
    console.log("Force refreshing all balances...");
    try {
      toast({
        title: "Refreshing balances...",
        description: "Fetching your latest token balances from the blockchain.",
        duration: 2000,
      });

      // Refresh all balances in parallel for better performance
      const [usdcResult, pSyldResult, ySyldResult, _userInfoResult] = await Promise.all([
        refetchUsdcBalance(),
        refetchPSyldBalance(),
        refetchYSyldBalance(),
        refetchUserInfo()
      ]);

      // Log the updated balances for debugging
      console.log("Balances refreshed:", {
        usdc: usdcResult.data && typeof usdcResult.data === 'bigint' ? formatUnits(usdcResult.data, 6) : "0",
        pSyld: pSyldResult.data && typeof pSyldResult.data === 'bigint' ? formatUnits(pSyldResult.data, 6) : "0",
        ySyld: ySyldResult.data && typeof ySyldResult.data === 'bigint' ? formatUnits(ySyldResult.data, 6) : "0"
      });

      toast({
        title: "Balances updated",
        description: "Your token balances have been refreshed from the blockchain.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error refreshing balances:", error);
      toast({
        title: "Refresh failed",
        description: "Failed to refresh your balances. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [refetchUsdcBalance, refetchPSyldBalance, refetchYSyldBalance, refetchUserInfo, toast]);

  // Handle withdraw errors
  useEffect(() => {
    if (withdrawError) {
      console.error('Withdraw error:', withdrawError)

      // Extract revert reason if available
      let errorMessage = withdrawError.message || "Failed to withdraw USDC. Please try again."
      let errorTitle = "Withdrawal failed"

      if (typeof errorMessage === 'string') {
        if (errorMessage.includes('user rejected')) {
          errorTitle = "Transaction rejected"
          errorMessage = "You rejected the transaction in your wallet. You can try again when ready."
        } else if (errorMessage.includes('insufficient funds')) {
          errorTitle = "Insufficient funds for gas"
          errorMessage = "You don't have enough SEI to pay for the transaction gas fees."
        } else if (errorMessage.includes('execution reverted:')) {
          // Extract the specific revert reason
          const revertPart = errorMessage.split('execution reverted:')[1]
          if (revertPart) {
            const revertReason = revertPart.trim()
            errorTitle = "Contract error"

            // Provide more user-friendly error messages based on contract errors
            if (revertReason.includes('InsufficientBalance')) {
              errorMessage = "You don't have enough pSYLD tokens to withdraw this amount."
            } else if (revertReason.includes('WithdrawalLocked')) {
              errorMessage = "Your deposit is still locked. There is a minimum lock period before you can withdraw."
            } else if (revertReason.includes('AlreadyWithdrawn')) {
              errorMessage = "You have already withdrawn your deposit."
            } else {
              errorMessage = `The contract rejected the transaction: ${revertReason}`
            }
          }
        }
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
        duration: 8000,
      })

      // Force refresh balances after error to ensure UI is up to date
      setTimeout(() => {
        forceRefreshBalances()
      }, 2000)
    }
  }, [withdrawError, toast, forceRefreshBalances])

  // Function to withdraw USDC
  const handleWithdraw = async (amount: string) => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to withdraw.",
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    setIsWithdrawLoading(true)
    try {
      // Validate amount
      if (Number(amount) <= 0) {
        toast({
          title: "Invalid amount",
          description: "Withdrawal amount must be greater than 0.",
          variant: "destructive",
          duration: 5000,
        })
        setIsWithdrawLoading(false)
        return
      }

      const parsedAmount = parseUnits(amount, 6) // USDC has 6 decimals

      // Force refresh pSYLD balance to ensure we have the latest data
      await refetchPSyldBalance()

      // Check if user has enough pSYLD
      if (pSyldBalance && typeof pSyldBalance === 'bigint' && pSyldBalance < parsedAmount) {
        toast({
          title: "Insufficient pSYLD balance",
          description: `You need ${formatUnits(parsedAmount, 6)} pSYLD but only have ${formatUnits(pSyldBalance, 6)} pSYLD.`,
          variant: "destructive",
          duration: 5000,
        })
        setIsWithdrawLoading(false)
        return
      }

      // Show notification that withdrawal is being prepared
      toast({
        title: "Preparing withdrawal...",
        description: "Setting up your withdrawal transaction.",
        duration: 3000,
      })

      // Execute withdraw transaction
      withdrawUsdc({
        address: contractAddresses.fundsVault as `0x${string}`,
        abi: fundsVaultAbi,
        functionName: 'withdraw',
        args: [parsedAmount],
      })

      // Show notification that transaction is being sent
      toast({
        title: "Initiating withdrawal...",
        description: "Please confirm the transaction in your wallet.",
        duration: 5000,
      })
    } catch (error) {
      console.error('Error withdrawing USDC:', error)

      // Provide more specific error message if possible
      let errorMessage = "Failed to withdraw USDC. Please try again."
      if (error instanceof Error) {
        if (error.message.includes("user rejected")) {
          errorMessage = "You rejected the transaction in your wallet. You can try again when ready."
        } else if (error.message.includes("insufficient funds")) {
          errorMessage = "You don't have enough SEI to pay for the transaction gas fees."
        } else {
          errorMessage = `Error: ${error.message}. Please try again or contact support if the issue persists.`
        }
      }

      toast({
        title: "Withdrawal error",
        description: errorMessage,
        variant: "destructive",
        duration: 8000,
      })
    } finally {
      setIsWithdrawLoading(false)
    }
  }



  return {
    // State
    isWithdrawLoading: isWithdrawLoading || isWithdrawPending || isWithdrawConfirming,
    isWithdrawComplete,
    userInfo,
    usdcBalance,
    pSyldBalance,
    ySyldBalance,

    // Functions
    handleWithdraw,
    forceRefreshBalances,

    // Connection state
    isConnected,
  }
}
