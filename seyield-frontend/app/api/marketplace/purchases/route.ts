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
    
    // Fetch all purchases and filter by buyer
    const purchases = []
    
    for (let i = 1; i <= Number(purchaseCount); i++) {
      const purchaseInfo = await publicClient.readContract({
        address: contractAddresses.merchant as `0x${string}`,
        abi: merchantAbi,
        functionName: 'getPurchaseInfo',
        args: [BigInt(i)]
      })
      
      // Check if this purchase belongs to the requested address
      if (purchaseInfo[1].toLowerCase() === address.toLowerCase()) {
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
        
        // Add item name and merchant name to the purchase
        purchases.push({
          ...purchase,
          itemName: itemInfo[2],
          merchantName: merchantInfo[1]
        })
      }
    }
    
    // Sort purchases by timestamp (newest first)
    purchases.sort((a, b) => b.timestamp - a.timestamp)
    
    return NextResponse.json(purchases)
  } catch (error) {
    console.error('Error fetching purchases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    )
  }
}
