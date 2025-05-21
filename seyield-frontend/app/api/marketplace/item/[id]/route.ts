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
    const itemId = parseInt(params.id)
    
    if (isNaN(itemId) || itemId <= 0) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
        { status: 400 }
      )
    }
    
    // Get item info from the contract
    const itemInfo = await publicClient.readContract({
      address: contractAddresses.merchant as `0x${string}`,
      abi: merchantAbi,
      functionName: 'getItemInfo',
      args: [BigInt(itemId)]
    })
    
    // Format the response
    const item = {
      id: Number(itemInfo[0]),
      merchant: itemInfo[1],
      name: itemInfo[2],
      description: itemInfo[3],
      price: itemInfo[4].toString(),
      requiredYSYLD: itemInfo[5].toString(),
      isActive: itemInfo[6]
    }
    
    // Get merchant info
    const merchantInfo = await publicClient.readContract({
      address: contractAddresses.merchant as `0x${string}`,
      abi: merchantAbi,
      functionName: 'getMerchantInfo',
      args: [item.merchant as `0x${string}`]
    })
    
    // Add merchant name to the item
    const itemWithMerchant = {
      ...item,
      merchantName: merchantInfo[1]
    }
    
    return NextResponse.json(itemWithMerchant)
  } catch (error) {
    console.error('Error fetching item:', error)
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    )
  }
}
