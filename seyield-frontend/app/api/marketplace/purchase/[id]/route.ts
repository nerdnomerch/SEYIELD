import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { seiTestnet } from 'viem/chains'
import { contractAddresses } from '@/app/config/contract-addresses'
import { merchantAbi } from '@/app/config/abis/merchant-abi'

// Create a public client to interact with the blockchain
const publicClient = createPublicClient({
  chain: seiTestnet,
  transport: http('https://evm-rpc-testnet.sei-apis.com')
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const purchaseId = parseInt(params.id)

    if (isNaN(purchaseId) || purchaseId <= 0) {
      return NextResponse.json(
        { error: 'Invalid purchase ID' },
        { status: 400 }
      )
    }

    // Get purchase info from the contract
    const purchaseInfo = await publicClient.readContract({
      address: contractAddresses.merchant as `0x${string}`,
      abi: merchantAbi,
      functionName: 'getPurchaseInfo',
      args: [BigInt(purchaseId)]
    })

    // Format the purchase
    const purchase = {
      id: Number(purchaseInfo[0]),
      buyer: purchaseInfo[1],
      merchant: purchaseInfo[2],
      itemId: Number(purchaseInfo[3]),
      price: purchaseInfo[4].toString(),
      timestamp: Number(purchaseInfo[5]),
      isPaid: purchaseInfo[6]
    }

    // Get item info
    const itemInfo = await publicClient.readContract({
      address: contractAddresses.merchant as `0x${string}`,
      abi: merchantAbi,
      functionName: 'getItemInfo',
      args: [BigInt(purchase.itemId)]
    })

    // Get merchant info
    const merchantInfo = await publicClient.readContract({
      address: contractAddresses.merchant as `0x${string}`,
      abi: merchantAbi,
      functionName: 'getMerchantInfo',
      args: [purchase.merchant as `0x${string}`]
    })

    // Add item and merchant details to the purchase
    const purchaseWithDetails = {
      ...purchase,
      item: {
        id: Number(itemInfo[0]),
        merchant: itemInfo[1],
        name: itemInfo[2],
        description: itemInfo[3],
        price: itemInfo[4].toString(),
        requiredYSYLD: itemInfo[5].toString(),
        isActive: itemInfo[6]
      },
      merchantInfo: {
        isRegistered: merchantInfo[0],
        name: merchantInfo[1],
        description: merchantInfo[2],
        totalSales: merchantInfo[3].toString(),
        pendingPayment: merchantInfo[4].toString()
      },
      // Generate a timeline for the purchase
      timeline: [
        {
          status: 'created',
          timestamp: purchase.timestamp,
          description: 'Purchase initiated'
        },
        {
          status: 'processing',
          timestamp: purchase.timestamp + 15, // Add 15 seconds
          description: 'Burning ySYLD tokens'
        },
        {
          status: 'completed',
          timestamp: purchase.timestamp + 30, // Add 30 seconds
          description: 'Payment automatically sent to merchant'
        }
      ]
    }

    // For backward compatibility with older purchases that might not be paid yet
    if (!purchase.isPaid) {
      // Replace the last timeline item
      purchaseWithDetails.timeline.pop()
      purchaseWithDetails.timeline.push({
        status: 'pending',
        timestamp: purchase.timestamp + 30, // Add 30 seconds
        description: 'Awaiting payment to merchant'
      })
    }

    return NextResponse.json(purchaseWithDetails)
  } catch (error) {
    console.error('Error fetching purchase:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchase' },
      { status: 500 }
    )
  }
}
