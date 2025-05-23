'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
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
  price: string
  requiredYSYLD: string
  isActive: boolean
}

export interface Purchase {
  id: number
  buyer: string
  merchant: string
  itemId: number
  price: string
  timestamp: number
  isPaid: boolean
  // Additional frontend properties
  itemName?: string
  merchantName?: string
}

export function useMerchant() {
  const { address, isConnected } = useAccount()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [items, setItems] = useState<MerchantItem[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [selectedItem, setSelectedItem] = useState<MerchantItem | null>(null)
  const [merchantInfo, setMerchantInfo] = useState<any>(null)
  const [isMerchant, setIsMerchant] = useState(false)

  // Get item count
  const { data: itemCount } = useReadContract({
    address: contractAddresses.merchant as `0x${string}`,
    abi: merchantAbi,
    functionName: 'itemCount',
    query: {
      enabled: isConnected,
    }
  })

  // Get purchase count
  const { data: purchaseCount } = useReadContract({
    address: contractAddresses.merchant as `0x${string}`,
    abi: merchantAbi,
    functionName: 'purchaseCount',
    query: {
      enabled: isConnected,
    }
  })

  // Get user's ySYLD balance
  const { data: ySYLDBalance } = useReadContract({
    address: contractAddresses.yieldToken as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: !!address && isConnected,
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
    hash: purchaseData?.hash,
  })

  // Check if user is a merchant
  useEffect(() => {
    if (!address || !isConnected) return

    const checkMerchantStatus = async () => {
      try {
        const result = await fetch(`/api/merchant/info?address=${address}`)
        const data = await result.json()

        if (data.isRegistered) {
          setIsMerchant(true)
          setMerchantInfo(data)
        } else {
          setIsMerchant(false)
          setMerchantInfo(null)
        }
      } catch (error) {
        console.error('Error checking merchant status:', error)
        setIsMerchant(false)
      }
    }

    checkMerchantStatus()
  }, [address, isConnected])

  // Load items
  useEffect(() => {
    if (!itemCount || !isConnected) return

    const loadItems = async () => {
      setIsLoading(true)
      try {
        const itemsArray: MerchantItem[] = []

        for (let i = 1; i <= Number(itemCount); i++) {
          const itemInfo = await fetch(`/api/marketplace/item/${i}`)
          const item = await itemInfo.json()

          if (item && item.isActive) {
            itemsArray.push({
              id: item.id,
              merchant: item.merchant,
              name: item.name,
              description: item.description,
              price: formatUnits(BigInt(item.price), 6), // USDC has 6 decimals
              requiredYSYLD: formatUnits(BigInt(item.requiredYSYLD), 6),
              isActive: item.isActive
            })
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
        const result = await fetch(`/api/marketplace/purchases?address=${address}`)
        const data = await result.json()

        if (data && Array.isArray(data)) {
          setPurchases(data)
        }
      } catch (error) {
        console.error('Error loading purchases:', error)
      }
    }

    loadPurchases()
  }, [address, isConnected, purchaseCount, isPurchaseComplete])

  // Handle purchase completion
  useEffect(() => {
    if (isPurchaseComplete && selectedItem) {
      toast({
        title: "Purchase successful!",
        description: `You've successfully purchased ${selectedItem.name} for ${selectedItem.price} USDC.`,
        duration: 5000,
      })

      // Reset selected item
      setSelectedItem(null)
    }
  }, [isPurchaseComplete, selectedItem, toast])

  // Handle purchase errors
  useEffect(() => {
    if (purchaseError) {
      console.error('Purchase error:', purchaseError)

      // Extract revert reason if available
      let errorMessage = purchaseError.message || "Failed to complete purchase. Please try again."
      if (typeof errorMessage === 'string' && errorMessage.includes('execution reverted:')) {
        errorMessage = errorMessage.split('execution reverted:')[1].trim()
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

      // Set selected item
      setSelectedItem(item)

      // Check eligibility
      const eligibilityResult = await fetch(`/api/marketplace/eligibility?address=${address}&itemId=${itemId}`)
      const eligibility = await eligibilityResult.json()

      if (!eligibility.isEligible) {
        toast({
          title: "Not eligible",
          description: `You need at least ${item.requiredYSYLD} ySYLD tokens to purchase this item.`,
          variant: "destructive",
        })
        return
      }

      // Execute purchase - this will burn ySYLD tokens and automatically pay the merchant
      purchaseItem({
        address: contractAddresses.merchant as `0x${string}`,
        abi: merchantAbi,
        functionName: 'purchaseItem',
        args: [BigInt(itemId)],
      })
    } catch (error) {
      console.error('Error purchasing item:', error)
      toast({
        title: "Purchase error",
        description: "Failed to purchase item. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Function to get purchase details
  const getPurchaseDetails = async (purchaseId: number) => {
    try {
      const result = await fetch(`/api/marketplace/purchase/${purchaseId}`)
      const purchase = await result.json()
      return purchase
    } catch (error) {
      console.error('Error getting purchase details:', error)
      return null
    }
  }

  return {
    // State
    isLoading,
    isPurchaseLoading: isPurchaseLoading || isPurchaseConfirming,
    isPurchaseComplete,
    items,
    purchases,
    selectedItem,
    merchantInfo,
    isMerchant,
    ySYLDBalance: ySYLDBalance ? formatUnits(ySYLDBalance, 6) : '0',

    // Functions
    handlePurchaseItem,
    getPurchaseDetails,

    // Connection state
    isConnected,
  }
}
