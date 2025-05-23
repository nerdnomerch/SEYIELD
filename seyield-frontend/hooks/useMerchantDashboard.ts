'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { contractAddresses } from '@/app/config/contract-addresses'
import { merchantAbi } from '@/app/config/abis/merchant-abi'
import { useToast } from '@/components/ui/use-toast'

export interface MerchantInfo {
  isRegistered: boolean
  name: string
  description: string
  totalSales: string
  pendingPayment: string
}

export function useMerchantDashboard() {
  const { address, isConnected } = useAccount()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [merchantInfo, setMerchantInfo] = useState<MerchantInfo | null>(null)
  const [isMerchant, setIsMerchant] = useState(false)
  const [merchantItems, setMerchantItems] = useState([])
  const [merchantOrders, setMerchantOrders] = useState([])

  // Register merchant
  const {
    data: registerData,
    isPending: isRegisterLoading,
    isSuccess: isRegisterStarted,
    writeContract: registerMerchant,
    error: registerError
  } = useWriteContract()

  // Wait for register transaction to complete
  const {
    isLoading: isRegisterConfirming,
    isSuccess: isRegisterComplete
  } = useWaitForTransactionReceipt({
    hash: registerData?.hash,
  })

  // Update merchant
  const {
    data: updateData,
    isPending: isUpdateLoading,
    isSuccess: isUpdateStarted,
    writeContract: updateMerchantInfo,
    error: updateError
  } = useWriteContract()

  // Wait for update transaction to complete
  const {
    isLoading: isUpdateConfirming,
    isSuccess: isUpdateComplete
  } = useWaitForTransactionReceipt({
    hash: updateData?.hash,
  })

  // List item
  const {
    data: listItemData,
    isPending: isListItemLoading,
    isSuccess: isListItemStarted,
    writeContract: listItem,
    error: listItemError
  } = useWriteContract()

  // Wait for list item transaction to complete
  const {
    isLoading: isListItemConfirming,
    isSuccess: isListItemComplete
  } = useWaitForTransactionReceipt({
    hash: listItemData?.hash,
  })

  // Update item
  const {
    data: updateItemData,
    isPending: isUpdateItemLoading,
    isSuccess: isUpdateItemStarted,
    writeContract: updateItem,
    error: updateItemError
  } = useWriteContract()

  // Wait for update item transaction to complete
  const {
    isLoading: isUpdateItemConfirming,
    isSuccess: isUpdateItemComplete
  } = useWaitForTransactionReceipt({
    hash: updateItemData?.hash,
  })

  // Check if user is a merchant
  useEffect(() => {
    if (!address || !isConnected) return

    const checkMerchantStatus = async () => {
      setIsLoading(true)
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
        setMerchantInfo(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkMerchantStatus()
  }, [address, isConnected, isRegisterComplete, isUpdateComplete])

  // Load merchant items
  useEffect(() => {
    if (!address || !isConnected || !isMerchant) return

    const loadMerchantItems = async () => {
      try {
        // Fetch items from the API
        const response = await fetch(`/api/merchant/items?address=${address}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch merchant items')
        }
        
        const data = await response.json()
        setMerchantItems(data)
      } catch (error) {
        console.error('Error loading merchant items:', error)
        setMerchantItems([])
      }
    }

    loadMerchantItems()
  }, [address, isConnected, isMerchant, isListItemComplete, isUpdateItemComplete])

  // Load merchant orders
  useEffect(() => {
    if (!address || !isConnected || !isMerchant) return

    const loadMerchantOrders = async () => {
      try {
        // Fetch orders from the API
        const response = await fetch(`/api/merchant/orders?address=${address}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch merchant orders')
        }
        
        const data = await response.json()
        setMerchantOrders(data)
      } catch (error) {
        console.error('Error loading merchant orders:', error)
        setMerchantOrders([])
      }
    }

    loadMerchantOrders()
  }, [address, isConnected, isMerchant])

  // Handle register merchant
  const handleRegisterMerchant = async (name: string, description: string) => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to register as a merchant.",
        variant: "destructive",
      })
      return
    }
    
    try {
      registerMerchant({
        address: contractAddresses.merchant as `0x${string}`,
        abi: merchantAbi,
        functionName: 'registerMerchant',
        args: [name, description],
      })
    } catch (error) {
      console.error('Error registering merchant:', error)
      toast({
        title: "Registration error",
        description: "Failed to register as a merchant. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle update merchant
  const handleUpdateMerchant = async (name: string, description: string) => {
    if (!isConnected || !isMerchant) {
      toast({
        title: "Not a merchant",
        description: "You need to be registered as a merchant to update your information.",
        variant: "destructive",
      })
      return
    }
    
    try {
      updateMerchantInfo({
        address: contractAddresses.merchant as `0x${string}`,
        abi: merchantAbi,
        functionName: 'updateMerchant',
        args: [name, description],
      })
    } catch (error) {
      console.error('Error updating merchant:', error)
      toast({
        title: "Update error",
        description: "Failed to update merchant information. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle list item
  const handleListItem = async (name: string, description: string, price: number, requiredYSYLD: number) => {
    if (!isConnected || !isMerchant) {
      toast({
        title: "Not a merchant",
        description: "You need to be registered as a merchant to list items.",
        variant: "destructive",
      })
      return
    }
    
    try {
      listItem({
        address: contractAddresses.merchant as `0x${string}`,
        abi: merchantAbi,
        functionName: 'listItem',
        args: [
          name, 
          description, 
          parseUnits(price.toString(), 6), // USDC has 6 decimals
          parseUnits(requiredYSYLD.toString(), 6)
        ],
      })
    } catch (error) {
      console.error('Error listing item:', error)
      toast({
        title: "Listing error",
        description: "Failed to list item. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle update item
  const handleUpdateItem = async (itemId: number, price: number, requiredYSYLD: number, isActive: boolean) => {
    if (!isConnected || !isMerchant) {
      toast({
        title: "Not a merchant",
        description: "You need to be registered as a merchant to update items.",
        variant: "destructive",
      })
      return
    }
    
    try {
      updateItem({
        address: contractAddresses.merchant as `0x${string}`,
        abi: merchantAbi,
        functionName: 'updateItem',
        args: [
          BigInt(itemId),
          parseUnits(price.toString(), 6), // USDC has 6 decimals
          parseUnits(requiredYSYLD.toString(), 6),
          isActive
        ],
      })
    } catch (error) {
      console.error('Error updating item:', error)
      toast({
        title: "Update error",
        description: "Failed to update item. Please try again.",
        variant: "destructive",
      })
    }
  }

  return {
    // State
    isLoading: isLoading || isRegisterLoading || isRegisterConfirming || isUpdateLoading || isUpdateConfirming || isListItemLoading || isListItemConfirming || isUpdateItemLoading || isUpdateItemConfirming,
    isMerchant,
    merchantInfo,
    merchantItems,
    merchantOrders,
    
    // Registration status
    isRegisterComplete,
    isUpdateComplete,
    isListItemComplete,
    isUpdateItemComplete,
    
    // Functions
    handleRegisterMerchant,
    handleUpdateMerchant,
    handleListItem,
    handleUpdateItem,
    
    // Connection state
    isConnected,
  }
}
