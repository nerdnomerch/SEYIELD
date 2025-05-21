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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      )
    }
    
    // Get purchase count
    const purchaseCount = await publicClient.readContract({
      address: contractAddresses.merchant as `0x${string}`,
      abi: merchantAbi,
      functionName: 'purchaseCount'
    })
    
    // Fetch all purchases and filter by merchant
    const orders = []
    
    for (let i = 1; i <= Number(purchaseCount); i++) {
      const purchaseInfo = await publicClient.readContract({
        address: contractAddresses.merchant as `0x${string}`,
        abi: merchantAbi,
        functionName: 'getPurchaseInfo',
        args: [BigInt(i)]
      })
      
      // Check if this purchase is for the requested merchant
      if (purchaseInfo[2].toLowerCase() === address.toLowerCase()) {
        // Get item info
        const itemInfo = await publicClient.readContract({
          address: contractAddresses.merchant as `0x${string}`,
          abi: merchantAbi,
          functionName: 'getItemInfo',
          args: [purchaseInfo[3]]
        })
        
        // Format the order
        orders.push({
          id: Number(purchaseInfo[0]),
          buyer: purchaseInfo[1],
          merchant: purchaseInfo[2],
          itemId: Number(purchaseInfo[3]),
          price: purchaseInfo[4].toString(),
          timestamp: Number(purchaseInfo[5]),
          isPaid: purchaseInfo[6],
          item: {
            name: itemInfo[2],
            description: itemInfo[3]
          }
        })
      }
    }
    
    // Sort orders by timestamp (newest first)
    orders.sort((a, b) => b.timestamp - a.timestamp)
    
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching merchant orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch merchant orders' },
      { status: 500 }
    )
  }
}
