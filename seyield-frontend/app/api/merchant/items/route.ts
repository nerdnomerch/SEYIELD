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
    
    // Get item count
    const itemCount = await publicClient.readContract({
      address: contractAddresses.merchant as `0x${string}`,
      abi: merchantAbi,
      functionName: 'itemCount'
    })
    
    // Fetch all items and filter by merchant
    const items = []
    
    for (let i = 1; i <= Number(itemCount); i++) {
      const itemInfo = await publicClient.readContract({
        address: contractAddresses.merchant as `0x${string}`,
        abi: merchantAbi,
        functionName: 'getItemInfo',
        args: [BigInt(i)]
      })
      
      // Check if this item belongs to the requested merchant
      if (itemInfo[1].toLowerCase() === address.toLowerCase()) {
        // Format the item
        items.push({
          id: Number(itemInfo[0]),
          merchant: itemInfo[1],
          name: itemInfo[2],
          description: itemInfo[3],
          price: itemInfo[4].toString(),
          requiredYSYLD: itemInfo[5].toString(),
          isActive: itemInfo[6]
        })
      }
    }
    
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching merchant items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch merchant items' },
      { status: 500 }
    )
  }
}
