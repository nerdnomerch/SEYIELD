'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { parseUnits, formatUnits } from 'viem'
import { contractAddresses } from '@/app/config/contract-addresses'
import { merchantAbi } from '@/app/config/abis/merchant-abi'
import { erc20Abi } from '@/app/config/abis/erc20-abi'
import { useToast } from '@/components/ui/use-toast'

export interface MerchantItem {
  id: number
  merchant: string
  name: string
  description: string
  price: bigint
  requiredYSYLD: bigint
  isActive: boolean
}

export interface Purchase {
  id: number
  buyer: string
  merchant: string
  itemId: number
  price: bigint
  timestamp: number
  isPaid: boolean
}

export function useMerchantContract() {
  const { address, isConnected } = useAccount()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [items, setItems] = useState<MerchantItem[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])

  // Get user's ySYLD balance
  const { data: ySYLDBalance, refetch: refetchYSYLDBalance } = useReadContract({
    address: contractAddresses.yieldToken as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: !!address && isConnected,
    }
  })

  // Get item count
  const { data: itemCount, refetch: refetchItemCount } = useReadContract({
    address: contractAddresses.merchant as `0x${string}`,
    abi: merchantAbi,
    functionName: 'itemCount',
    query: {
      enabled: isConnected,
    }
  })

  // Get purchase count
  const { data: purchaseCount, refetch: refetchPurchaseCount } = useReadContract({
    address: contractAddresses.merchant as `0x${string}`,
    abi: merchantAbi,
    functionName: 'purchaseCount',
    query: {
      enabled: isConnected,
    }
  })

  // Purchase item
  const {
    data: purchaseData,
    isPending: isPurchaseLoading,
    isSuccess: isPurchaseStarted,
    writeContract: purchaseItem,
    error: purchaseError
  } = useWriteContract()

  // Wait for purchase transaction to complete
  const {
    isLoading: isPurchaseConfirming,
    isSuccess: isPurchaseComplete
  } = useWaitForTransactionReceipt({
    hash: purchaseData,
  })

  // Load items
  useEffect(() => {
    if (!itemCount || !isConnected) return

    const loadItems = async () => {
      setIsLoading(true)
      try {
        const itemsArray: MerchantItem[] = []

        for (let i = 1; i <= Number(itemCount); i++) {
          try {
            const itemInfo = await readContract({
              address: contractAddresses.merchant as `0x${string}`,
              abi: merchantAbi,
              functionName: 'getItemInfo',
              args: [BigInt(i)],
            })

            if (itemInfo?.isActive) {
              itemsArray.push({
                id: i,
                merchant: itemInfo.merchant,
                name: itemInfo.name,
                description: itemInfo.description,
                price: itemInfo.price,
                requiredYSYLD: itemInfo.requiredYSYLD,
                isActive: itemInfo.isActive
              })
            }
          } catch (error) {
            console.error(`Error loading item ${i}:`, error)
          }
        }

        setItems(itemsArray)
      } catch (error) {
        console.error('Error loading items:', error)
        toast({
          title: "Failed to load marketplace items",
          description: "There was an error loading the marketplace items. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadItems()
  }, [itemCount, isConnected, toast])

  // Load user purchases
  useEffect(() => {
    if (!address || !isConnected || !purchaseCount) return

    const loadPurchases = async () => {
      try {
        const purchasesArray: Purchase[] = []

        for (let i = 1; i <= Number(purchaseCount); i++) {
          try {
            const purchaseInfo = await readContract({
              address: contractAddresses.merchant as `0x${string}`,
              abi: merchantAbi,
              functionName: 'getPurchaseInfo',
              args: [BigInt(i)],
            })

            if (purchaseInfo && purchaseInfo.buyer === address) {
              purchasesArray.push({
                id: i,
                buyer: purchaseInfo.buyer,
                merchant: purchaseInfo.merchant,
                itemId: Number(purchaseInfo.itemId),
                price: purchaseInfo.price,
                timestamp: Number(purchaseInfo.timestamp),
                isPaid: purchaseInfo.isPaid
              })
            }
          } catch (error) {
            console.error(`Error loading purchase ${i}:`, error)
          }
        }

        setPurchases(purchasesArray)
      } catch (error) {
        console.error('Error loading purchases:', error)
      }
    }

    loadPurchases()
  }, [address, isConnected, purchaseCount])

  // Define refreshData function with useCallback to avoid dependency issues
  const refreshData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Refresh all contract data
      const [ySYLDResult, itemCountResult, purchaseCountResult] = await Promise.all([
        refetchYSYLDBalance(),
        refetchItemCount(),
        refetchPurchaseCount()
      ])

      console.log("Data refreshed:", {
        ySYLDBalance: ySYLDResult.data ? formatUnits(ySYLDResult.data, 6) : "0",
        itemCount: itemCountResult.data,
        purchaseCount: purchaseCountResult.data
      })

      // Show toast notification
      toast({
        title: "Data refreshed",
        description: "Marketplace data has been updated.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast({
        title: "Refresh failed",
        description: "Failed to refresh marketplace data. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }, [refetchYSYLDBalance, refetchItemCount, refetchPurchaseCount, toast])

  // Handle purchase completion
  useEffect(() => {
    if (isPurchaseComplete) {
      toast({
        title: "Purchase successful!",
        description: "Your purchase has been completed successfully.",
        duration: 5000,
      })

      // Refresh data after successful purchase
      refreshData()
    }
  }, [isPurchaseComplete, toast, refreshData])

  // Handle purchase errors
  useEffect(() => {
    if (purchaseError) {
      console.error('Purchase error:', purchaseError)

      // Extract revert reason if available
      let errorMessage = purchaseError.message || "Failed to complete purchase. Please try again."
      if (typeof errorMessage === 'string' && errorMessage.includes('execution reverted:')) {
        const revertPart = errorMessage.split('execution reverted:')[1]
        if (revertPart) {
          errorMessage = revertPart.trim()

          // Provide more user-friendly error messages
          if (errorMessage.includes('InsufficientYield')) {
            errorMessage = "You don't have enough ySYLD tokens to make this purchase."
          } else if (errorMessage.includes('InvalidItem')) {
            errorMessage = "This item is no longer available for purchase."
          }
        }
      }

      toast({
        title: "Purchase failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      })
    }
  }, [purchaseError, toast])

  // Function to handle item purchase
  const handlePurchaseItem = async (itemId: number) => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to make a purchase.",
        variant: "destructive",
      })
      return
    }

    try {
      // Find the item
      const item = items.find(i => i.id === itemId)
      if (!item) {
        toast({
          title: "Item not found",
          description: "The item you're trying to purchase could not be found.",
          variant: "destructive",
        })
        return
      }

      // Refresh ySYLD balance to ensure we have the latest data
      await refetchYSYLDBalance()

      // Check if user has enough ySYLD
      if (ySYLDBalance && ySYLDBalance < item.price) {
        toast({
          title: "Insufficient ySYLD",
          description: `You need at least ${formatUnits(item.price, 6)} ySYLD tokens to purchase this item. You currently have ${formatUnits(ySYLDBalance, 6)} ySYLD.`,
          variant: "destructive",
        })
        return
      }

      // Show notification that purchase is being prepared
      toast({
        title: "Preparing purchase...",
        description: `Getting ready to purchase ${item.name} for ${formatUnits(item.price, 6)} ySYLD.`,
        duration: 3000,
      })

      // Execute purchase - this will burn ySYLD tokens and automatically pay the merchant
      await purchaseItem({
        address: contractAddresses.merchant as `0x${string}`,
        abi: merchantAbi,
        functionName: 'purchaseItem',
        args: [BigInt(itemId)],
      })

      // Show notification that transaction is being processed
      toast({
        title: "Purchase initiated",
        description: "Please confirm the transaction in your wallet. This will use your ySYLD tokens.",
        duration: 5000,
      })
    } catch (error) {
      console.error('Error purchasing item:', error)

      // Provide more specific error message if possible
      let errorMessage = "Failed to purchase item. Please try again."
      if (error instanceof Error) {
        if (error.message.includes("user rejected")) {
          errorMessage = "You rejected the transaction in your wallet. You can try again when ready."
        } else if (error.message.includes("insufficient funds")) {
          errorMessage = "You don't have enough SEI to pay for the transaction gas fees."
        }
      }

      toast({
        title: "Purchase error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      })
    }
  }



  return {
    // State
    isLoading,
    isPurchaseLoading: isPurchaseLoading || isPurchaseConfirming,
    isPurchaseComplete,
    items,
    purchases,
    ySYLDBalance,

    // Functions
    handlePurchaseItem,
    refreshData,

    // Connection state
    isConnected,
  }
}
