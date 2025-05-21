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
    
    // Get merchant info from the contract
    const merchantInfo = await publicClient.readContract({
      address: contractAddresses.merchant as `0x${string}`,
      abi: merchantAbi,
      functionName: 'getMerchantInfo',
      args: [address as `0x${string}`]
    })
    
    // Format the response
    const merchant = {
      isRegistered: merchantInfo[0],
      name: merchantInfo[1],
      description: merchantInfo[2],
      totalSales: merchantInfo[3].toString(),
      pendingPayment: merchantInfo[4].toString()
    }
    
    return NextResponse.json(merchant)
  } catch (error) {
    console.error('Error fetching merchant info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch merchant info' },
      { status: 500 }
    )
  }
}
