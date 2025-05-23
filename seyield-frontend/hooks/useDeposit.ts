'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSimulateContract } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { contractAddresses } from '@/app/config/contract-addresses'
import { fundsVaultAbi } from '@/app/config/abis/funds-vault-abi'
import { erc20Abi } from '@/app/config/abis/erc20-abi'
import { useToast } from '@/components/ui/use-toast'
// We'll use a simpler approach without JSX in toasts

export interface DepositHookReturn {
  isApproved: boolean;
  isCheckingApproval: boolean;
  isApproveLoading: boolean;
  isDepositLoading: boolean;
  isApproveComplete: boolean;
  isDepositComplete: boolean;
  depositAmount: string;
  userInfo: { deposit: bigint; depositTime: bigint; hasWithdrawn: boolean } | undefined;
  usdcBalance: bigint | undefined;
  pSyldBalance: bigint | undefined;
  ySyldBalance: bigint | undefined;
  handleApprove: (amount: string) => Promise<void>;
  handleDeposit: (amount: string) => Promise<void>;
  handleOneClickDeposit: (amount: string) => Promise<void>;
  forceRefreshBalances: () => Promise<void>;
  isConnected: boolean;
}

export function useDeposit(): DepositHookReturn {
  const { address, isConnected } = useAccount()
  const { toast } = useToast()
  const [isApproved, setIsApproved] = useState(false)
  const [isCheckingApproval, setIsCheckingApproval] = useState(false)
  const [depositAmount, setDepositAmount] = useState<string>('')
  const [isManualDepositLoading, setIsManualDepositLoading] = useState(false)

  // Get user's deposit info
  const { data: userInfo, refetch: refetchUserInfo } = useReadContract({
    address: contractAddresses.fundsVault as `0x${string}`,
    abi: fundsVaultAbi,
    functionName: 'userInfo',
    args: [address],
    query: {
      enabled: !!address && isConnected,
    }
  }) as {
    data: { deposit: bigint; depositTime: bigint; hasWithdrawn: boolean } | undefined;
    refetch: () => Promise<{ data: { deposit: bigint; depositTime: bigint; hasWithdrawn: boolean } | undefined }>
  }

  // Get user's USDC allowance for the vault
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: contractAddresses.usdc as `0x${string}`,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address, contractAddresses.fundsVault],
    query: {
      enabled: !!address && isConnected,
    }
  }) as { data: bigint | undefined; refetch: () => Promise<{ data: bigint | undefined }> }

  // Get user's USDC balance
  const { data: usdcBalance, refetch: refetchUsdcBalance } = useReadContract({
    address: contractAddresses.usdc as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: !!address && isConnected,
    }
  }) as { data: bigint | undefined; refetch: () => Promise<{ data: bigint | undefined }> }

  // Log USDC balance changes for debugging
  useEffect(() => {
    if (typeof usdcBalance === 'bigint') {
      console.log("USDC Balance updated:", formatUnits(usdcBalance, 6), "USDC");
    }
  }, [usdcBalance])

  // Get user's pSYLD balance
  const { data: pSyldBalance, refetch: refetchPSyldBalance } = useReadContract({
    address: contractAddresses.principalToken as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: !!address && isConnected,
    }
  }) as { data: bigint | undefined; refetch: () => Promise<{ data: bigint | undefined }> }

  // Get user's ySYLD balance
  const { data: ySyldBalance, refetch: refetchYSyldBalance } = useReadContract({
    address: contractAddresses.yieldToken as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: !!address && isConnected,
    }
  }) as { data: bigint | undefined; refetch: () => Promise<{ data: bigint | undefined }> }

  // Approve USDC spending
  const {
    data: approveData,
    isPending: isApproveLoading,
    writeContract: approveUsdc,
    error: approveError
  } = useWriteContract()

  // Wait for approval transaction to complete
  const {
    isLoading: isApproveConfirming,
    isSuccess: isApproveComplete
  } = useWaitForTransactionReceipt({
    hash: approveData
  })

  // Deposit USDC
  const {
    data: depositData,
    isPending: isDepositLoading,
    writeContract: depositUsdc,
    error: depositError
  } = useWriteContract()

  // Wait for deposit transaction to complete
  const {
    isLoading: isDepositConfirming,
    isSuccess: isDepositComplete
  } = useWaitForTransactionReceipt({
    hash: depositData
  })

  // Check if the current amount is approved
  useEffect(() => {
    if (!depositAmount || !isConnected) return

    try {
      const parsedAmount = parseUnits(depositAmount, 6) // USDC has 6 decimals

      // If allowance is undefined, we'll refetch it
      if (allowance === undefined) {
        console.log("Allowance is undefined, refetching...");
        refetchAllowance();
        return;
      }

      // Log for debugging
      console.log("Checking approval status:", {
        allowance: allowance ? allowance.toString() : "null",
        parsedAmount: parsedAmount.toString(),
        isApproved: allowance !== null && typeof allowance === 'bigint' && allowance >= parsedAmount
      });

      setIsApproved(typeof allowance === 'bigint' && allowance >= parsedAmount)
    } catch (error) {
      console.error('Error parsing amount:', error)
      setIsApproved(false)
    }
  }, [depositAmount, allowance, isConnected, refetchAllowance])

  // Handle approval completion
  useEffect(() => {
    if (isApproveComplete && depositAmount && !isDepositComplete) {
      console.log("Approval complete, preparing to deposit...");

      // Show success notification for approval
      toast({
        title: "Approval successful! ✅",
        description: "Your USDC has been approved for deposit. Preparing next step...",
        variant: "default",
        duration: 5000,
      })

      // Immediately set isApproved to true when approval is complete
      setIsApproved(true)

      // Refetch allowance immediately to update UI
      refetchAllowance();

      // Show a toast notification about the transition with clear instructions
      setTimeout(() => {
        toast({
          title: "Preparing deposit transaction...",
          description: "Please wait while we prepare your deposit transaction. This will start automatically in a few seconds.",
          duration: 5000,
        })
      }, 1000)

      // Automatically trigger deposit after approval with a longer delay
      // to ensure the blockchain has time to confirm the approval
      const depositTimer = setTimeout(() => {
        console.log("Initiating automatic deposit after approval...");
        try {
          // Check if deposit is already complete or in progress
          if (isDepositComplete || isDepositLoading) {
            console.log("Deposit already complete or in progress, skipping automatic deposit");
            return;
          }

          // Clear notification that deposit is starting
          toast({
            title: "Starting deposit transaction",
            description: "Please confirm the deposit transaction in your wallet when prompted.",
            duration: 5000,
          })

          // Execute the deposit transaction
          depositUsdc({
            address: contractAddresses.fundsVault as `0x${string}`,
            abi: fundsVaultAbi,
            functionName: 'deposit',
            args: [parseUnits(depositAmount, 6)],
          })
        } catch (error) {
          console.error("Error in automatic deposit:", error);

          // Show detailed error message
          let errorMessage = "Please try depositing manually using the 'Force Deposit' button below.";
          if (error instanceof Error) {
            if (error.message.includes("user rejected")) {
              errorMessage = "You rejected the transaction. You can try again when ready.";
            } else {
              errorMessage = `Error: ${error.message}. Please try the 'Force Deposit' button.`;
            }
          }

          toast({
            title: "Automatic deposit failed",
            description: errorMessage,
            variant: "destructive",
            duration: 8000,
          })
        }
      }, 3000) // 3 seconds delay for reliability

      // Cleanup function to prevent memory leaks
      return () => clearTimeout(depositTimer);
    }
  }, [isApproveComplete, depositAmount, isDepositComplete, isDepositLoading, toast, refetchAllowance, depositUsdc])

  // Handle deposit completion
  useEffect(() => {
    if (isDepositComplete) {
      // Calculate expected token amounts
      const parsedAmount = depositAmount ? parseUnits(depositAmount, 6) : BigInt(0);
      const expectedYSYLD = parsedAmount * BigInt(7) / BigInt(100);

      // Show success toast with detailed information
      toast({
        title: "Deposit successful! 🎉",
        description: `You've deposited ${depositAmount} USDC and received ${depositAmount} pSYLD and ${formatUnits(expectedYSYLD, 6)} ySYLD tokens.`,
        variant: "default",
        duration: 10000,
      })

      // Open transaction in explorer if available
      if (depositData) {
        const txHash = typeof depositData === 'string' ? depositData : '';
        const explorerUrl = `https://testnet.seistream.app/transactions/${txHash}`;

        // Create a clickable link to the transaction
        toast({
          title: "Transaction confirmed on blockchain",
          description: `Your transaction has been confirmed. View it at: ${explorerUrl}`,
          duration: 8000
        })

        // Log the transaction URL for reference
        console.log("Transaction confirmed:", explorerUrl);
      }

      // Show notification that balances are being updated
      toast({
        title: "Updating balances...",
        description: "Refreshing your token balances. This may take a few moments.",
        duration: 5000,
      });

      // Immediate refetch to update UI quickly
      console.log("Performing immediate refetch of balances...");
      Promise.all([
        refetchUserInfo(),
        refetchUsdcBalance(),
        refetchPSyldBalance(),
        refetchYSyldBalance()
      ]).then(() => {
        console.log("Initial balance refresh complete");
      });

      // Second refetch after a delay to ensure blockchain state is updated
      setTimeout(() => {
        console.log("Performing delayed refetch of balances...");
        Promise.all([
          refetchUserInfo(),
          refetchUsdcBalance(),
          refetchPSyldBalance(),
          refetchYSyldBalance()
        ]).then(() => {
          console.log("Second balance refresh complete");

          // Show updated balances notification
          if (pSyldBalance && typeof pSyldBalance === 'bigint' &&
              ySyldBalance && typeof ySyldBalance === 'bigint') {
            toast({
              title: "Balances updated",
              description: `Your current balances: ${formatUnits(pSyldBalance, 6)} pSYLD and ${formatUnits(ySyldBalance, 6)} ySYLD`,
              duration: 5000,
            });
          }
        });
      }, 3000)

      // Third refetch after a longer delay for network consistency
      setTimeout(() => {
        console.log("Performing final refetch of balances...");
        Promise.all([
          refetchUserInfo(),
          refetchUsdcBalance(),
          refetchPSyldBalance(),
          refetchYSyldBalance()
        ]).then(() => {
          console.log("Final balance refresh complete");

          // Show final confirmation with all balances
          if (usdcBalance && typeof usdcBalance === 'bigint' &&
              pSyldBalance && typeof pSyldBalance === 'bigint' &&
              ySyldBalance && typeof ySyldBalance === 'bigint') {
            toast({
              title: "All balances confirmed",
              description: `USDC: ${formatUnits(usdcBalance, 6)}, pSYLD: ${formatUnits(pSyldBalance, 6)}, ySYLD: ${formatUnits(ySyldBalance, 6)}`,
              variant: "default",
              duration: 5000,
            });
          }
        });
      }, 6000)
    }
  }, [isDepositComplete, depositAmount, depositData, toast, refetchUserInfo, refetchUsdcBalance, refetchPSyldBalance, refetchYSyldBalance, usdcBalance, pSyldBalance, ySyldBalance])

  // Show prominent toast for approve pending
  useEffect(() => {
    if (isApproveLoading) {
      toast({
        title: "Approval pending...",
        description: "Waiting for your approval transaction to be confirmed on the blockchain.",
        duration: 6000,
      });
    }
  }, [isApproveLoading, toast]);

  // Show prominent toast for deposit pending
  useEffect(() => {
    const isAnyDepositLoading = isDepositLoading || isManualDepositLoading || isDepositConfirming;
    if (isAnyDepositLoading) {
      toast({
        title: "Deposit pending...",
        description: "Waiting for your deposit transaction to be confirmed on the blockchain.",
        duration: 6000,
      });
    }
  }, [isDepositLoading, isManualDepositLoading, isDepositConfirming, toast]);

  // Handle approval errors with detailed messages
  useEffect(() => {
    if (approveError) {
      console.error('Approval error:', approveError);

      // Try to extract a more helpful error message
      let errorMessage = approveError.message || "Failed to approve USDC. Please try again.";
      let errorTitle = "Approval failed";

      if (typeof errorMessage === 'string') {
        if (errorMessage.includes('user rejected')) {
          errorTitle = "Approval rejected";
          errorMessage = "You rejected the transaction in your wallet. You can try again when ready.";
        } else if (errorMessage.includes('insufficient funds')) {
          errorTitle = "Insufficient funds for gas";
          errorMessage = "You don't have enough SEI to pay for the transaction gas fees.";
        } else if (errorMessage.includes('execution reverted:')) {
          // Extract the specific revert reason
          const revertReason = errorMessage.split('execution reverted:')[1]?.trim() || "Unknown contract error";
          errorTitle = "Contract error";
          errorMessage = `The contract rejected the transaction: ${revertReason}`;
        }
      }

      // Show detailed error toast
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
        duration: 8000,
      });

      // Log detailed error for debugging
      console.log("Detailed approval error:", {
        title: errorTitle,
        message: errorMessage,
        originalError: approveError.message
      });
    }
  }, [approveError, toast])

  // Handle deposit errors separately with detailed messages
  useEffect(() => {
    if (depositError) {
      console.error('Deposit error:', depositError);

      // Try to extract a more helpful error message
      let errorMessage = depositError.message || "Failed to deposit USDC. Please try again.";
      let errorTitle = "Deposit failed";

      if (typeof errorMessage === 'string') {
        if (errorMessage.includes('user rejected')) {
          errorTitle = "Deposit rejected";
          errorMessage = "You rejected the transaction in your wallet. You can try again when ready.";
        } else if (errorMessage.includes('insufficient funds')) {
          errorTitle = "Insufficient funds";
          errorMessage = "You don't have enough SEI to pay for the transaction gas fees.";
        } else if (errorMessage.includes('execution reverted:')) {
          // Extract the specific revert reason
          const revertReason = errorMessage.split('execution reverted:')[1]?.trim() || "Unknown contract error";
          errorTitle = "Contract error";

          // Provide more specific guidance based on the error
          if (revertReason.includes("InsufficientBalance")) {
            errorMessage = "You don't have enough USDC in your wallet. Please check your balance and try again.";
          } else if (revertReason.includes("InvalidAmount")) {
            errorMessage = "The deposit amount is invalid. Please try a different amount.";
          } else {
            errorMessage = `The contract rejected the transaction: ${revertReason}`;
            errorMessage += "\n\nPlease try refreshing your balances and try again with a smaller amount.";
          }
        }
      }

      // Show detailed error toast
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
        duration: 10000,
      });

      // Log detailed error for debugging
      console.log("Detailed deposit error:", {
        title: errorTitle,
        message: errorMessage,
        originalError: depositError.message
      });

      // Force refresh balances after error to ensure UI is up to date
      setTimeout(() => {
        forceRefreshBalances();
      }, 2000);
    }
  }, [depositError, toast])

  // Function to approve USDC
  const handleApprove = async (amount: string) => {
    if (!amount || !isConnected) return

    // Set depositAmount setiap kali approve agar pengecekan approval berjalan konsisten
    setDepositAmount(amount)
    try {
      setIsCheckingApproval(true)

      // Show notification that approval is being prepared
      toast({
        title: "Preparing approval...",
        description: "Setting up USDC approval for the vault contract.",
        duration: 3000,
      });

      // Use a very large approval amount to avoid future approval issues
      // This is a common pattern in DeFi to reduce the number of approval transactions
      const MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")

      // Log detailed information for debugging
      console.log("Approving USDC spending with max amount:", {
        usdc: contractAddresses.usdc,
        fundsVault: contractAddresses.fundsVault,
        amount: "MAX_UINT256",
        userAddress: address
      });

      // Show notification that transaction is being sent
      toast({
        title: "Initiating approval...",
        description: "Please confirm the approval transaction in your wallet.",
        duration: 5000,
      });

      // Execute the approval transaction
      approveUsdc({
        address: contractAddresses.usdc as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [contractAddresses.fundsVault, MAX_UINT256],
      })

      // Store the deposit amount for later use
      setDepositAmount(amount)
    } catch (error) {
      console.error('Error approving USDC:', error)

      // Try to extract a more helpful error message
      let errorMessage = "Failed to approve USDC. Please try again.";
      let errorTitle = "Approval error";

      if (error instanceof Error) {
        if (error.message.includes("user rejected")) {
          errorTitle = "Approval rejected";
          errorMessage = "You rejected the approval transaction in your wallet. You can try again when ready.";
        } else {
          // Include the actual error message for better debugging
          errorMessage = `Error: ${error.message}. Please try again or contact support if the issue persists.`;
        }
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
        duration: 8000,
      })
    } finally {
      setIsCheckingApproval(false)
    }
  }

  // Function to deposit USDC
  const handleDeposit = async (amount: string) => {
    if (!amount || !isConnected) return

    setDepositAmount(amount)
    setIsManualDepositLoading(true)
    try {
      // Validasi: amount harus > 0
      if (Number(amount) <= 0) {
        toast({
          title: "Invalid amount",
          description: "Deposit amount must be greater than 0.",
          variant: "destructive",
          duration: 8000,
        });
        setIsManualDepositLoading(false)
        return;
      }

      const parsedAmount = parseUnits(amount, 6)
      await refetchUsdcBalance();

      // Validasi: saldo USDC harus cukup
      if (typeof usdcBalance === 'bigint' && usdcBalance < parsedAmount) {
        toast({
          title: "Insufficient USDC balance",
          description: `You need ${formatUnits(parsedAmount, 6)} USDC but only have ${formatUnits(usdcBalance, 6)} USDC.`,
          variant: "destructive",
          duration: 8000,
        });
        setIsManualDepositLoading(false)
        return;
      }

      // Validasi: allowance harus cukup
      if (typeof allowance !== 'bigint' || allowance < parsedAmount) {
        toast({
          title: "Approval required",
          description: "You need to approve USDC spending before depositing. Please use the 'Approve & Deposit' or 'Approve Only' button.",
          variant: "destructive",
          duration: 8000,
        });
        setIsManualDepositLoading(false)
        return;
      }

      // Show initial notification that deposit is being prepared
      toast({
        title: "Preparing deposit...",
        description: "Checking your balance and preparing the transaction.",
        duration: 3000,
      });
      console.log("Deposit initiated with amount:", amount);

      // Force refresh USDC balance to ensure we have the latest data
      await refetchUsdcBalance();

      // Check if user has enough USDC with the latest balance
      if (typeof usdcBalance === 'bigint' && usdcBalance < parsedAmount) {
        toast({
          title: "Insufficient USDC balance",
          description: `You need ${formatUnits(parsedAmount, 6)} USDC but only have ${formatUnits(usdcBalance, 6)} USDC.`,
          variant: "destructive",
          duration: 8000,
        });
        return;
      }

      // Check if approval is sufficient
      if (typeof allowance !== 'bigint' || allowance < parsedAmount) {
        toast({
          title: "Approval required",
          description: "You need to approve USDC spending before depositing. Please use the 'Approve & Deposit' or 'Approve Only' button.",
          variant: "destructive",
          duration: 8000,
        });
        return;
      }

      // Log detailed information for debugging
      console.log("Depositing USDC:", {
        fundsVault: contractAddresses.fundsVault,
        amount: parsedAmount.toString(),
        userBalance: usdcBalance && typeof usdcBalance === 'bigint' ? formatUnits(usdcBalance, 6) : "unknown",
        allowance: allowance && typeof allowance === 'bigint' ? formatUnits(allowance, 6) : "unknown"
      });

      // Show notification that transaction is being sent
      toast({
        title: "Initiating deposit...",
        description: "Please confirm the transaction in your wallet.",
        duration: 5000,
      });

      // Execute the deposit transaction
      depositUsdc({
        address: contractAddresses.fundsVault as `0x${string}`,
        abi: fundsVaultAbi,
        functionName: 'deposit',
        args: [parsedAmount],
      })
    } catch (error) {
      console.error('Error depositing USDC:', error)

      // Hentikan loading jika error
      setIsManualDepositLoading(false)

      // Try to extract a more helpful error message
      let errorMessage = "Failed to deposit USDC. Please try again.";
      let errorTitle = "Deposit error";

      if (error instanceof Error) {
        if (error.message.includes("insufficient funds")) {
          errorTitle = "Insufficient funds";
          errorMessage = "You don't have enough USDC in your wallet. Please check your balance and try again.";
        } else if (error.message.includes("user rejected")) {
          errorTitle = "Transaction rejected";
          errorMessage = "You rejected the transaction in your wallet. You can try again when ready.";
        } else if (error.message.includes("execution reverted")) {
          errorTitle = "Transaction failed";
          errorMessage = "Transaction failed on the blockchain. This could be due to:";
          errorMessage += "\n• Insufficient USDC balance";
          errorMessage += "\n• Insufficient SEI for gas fees";
          errorMessage += "\n• Contract error";
          errorMessage += "\n\nPlease try refreshing your balances and try again.";
        } else {
          // Include the actual error message for better debugging
          errorMessage = `Error: ${error.message}. Please try again or contact support if the issue persists.`;
        }
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
        duration: 10000,
      })
    } finally {
      setIsManualDepositLoading(false) // Pastikan loading dihentikan di finally
    }
  }

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

      // Log current balances after refresh
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

  // Function to handle one-click deposit (approve if needed, then deposit)
  // Note: The actual deposit after approval is handled by the approval completion useEffect
  const handleOneClickDeposit = async (amount: string) => {
    if (!amount || !isConnected) return

    // Set depositAmount setiap kali one-click agar pengecekan approval berjalan konsisten
    setDepositAmount(amount)
    try {
      // Show initial notification
      toast({
        title: "Processing deposit request...",
        description: "Checking approval status and preparing transaction.",
        duration: 3000,
      });

      // Log current state for debugging
      console.log("One-click deposit initiated with state:", {
        isApproved,
        isApproveComplete,
        depositAmount: amount,
        allowance: allowance ? allowance.toString() : "undefined",
        parsedAmount: parseUnits(amount, 6).toString()
      });

      // Force refresh balances and allowance before deposit to ensure we have the latest state
      await Promise.all([
        refetchUsdcBalance(),
        refetchAllowance()
      ]);

      // Parse amount once to avoid doing it multiple times
      const parsedAmount = parseUnits(amount, 6);

      // Check if user has enough USDC with the latest balance
      if (usdcBalance && typeof usdcBalance === 'bigint' && usdcBalance < parsedAmount) {
        toast({
          title: "Insufficient USDC balance",
          description: `You need ${formatUnits(parsedAmount, 6)} USDC but only have ${formatUnits(usdcBalance, 6)} USDC.`,
          variant: "destructive",
          duration: 8000,
        });
        return;
      }

      // Re-check approval status with latest data
      const needsApproval = !allowance || (typeof allowance === 'bigint' && allowance < parsedAmount);

      // Check if approval is needed
      if (needsApproval) {
        console.log("Approval needed, initiating approval process...");
        toast({
          title: "Approval required",
          description: "You need to approve USDC spending before depositing. This will be done in the next step.",
          duration: 5000,
        });

        // Need to approve first - deposit will happen automatically after approval
        await handleApprove(amount);

        toast({
          title: "Approval in progress",
          description: "Please confirm the approval transaction. Deposit will start automatically after approval.",
          duration: 5000,
        });
        return;
      }

      console.log("Already approved, proceeding with direct deposit...");
      toast({
        title: "Already approved",
        description: "Your USDC is already approved. Proceeding directly to deposit.",
        duration: 3000,
      });

      // Already approved, proceed with deposit directly
      await handleDeposit(amount);
    } catch (error) {
      console.error('Error in one-click deposit:', error);

      // Try to extract a more helpful error message
      let errorMessage = "Failed to process your deposit. Please try again.";
      let errorTitle = "Transaction error";

      if (error instanceof Error) {
        if (error.message.includes("user rejected")) {
          errorTitle = "Transaction rejected";
          errorMessage = "You rejected the transaction in your wallet. You can try again when ready.";
        } else if (error.message.includes("insufficient funds")) {
          errorTitle = "Insufficient funds";
          errorMessage = "You don't have enough USDC in your wallet or SEI for gas fees.";
        } else {
          // Include the actual error message for better debugging
          errorMessage = `Error: ${error.message}. Please try again or contact support if the issue persists.`;
        }
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
        duration: 8000,
      });
    }
  }

  return {
    // State
    isApproved,
    isCheckingApproval,
    depositAmount,

    // Loading states
    isApproveLoading: isApproveLoading || isApproveConfirming,
    isDepositLoading: isDepositLoading || isDepositConfirming || isManualDepositLoading,

    // Completion states
    isApproveComplete,
    isDepositComplete,

    // Data
    userInfo,
    usdcBalance,
    pSyldBalance,
    ySyldBalance,

    // Functions
    handleApprove,
    handleDeposit,
    handleOneClickDeposit,
    forceRefreshBalances,

    // Connection state
    isConnected,
  }
}
