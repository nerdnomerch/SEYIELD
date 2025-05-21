import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { seiTestnet } from 'viem/chains'
import { contractAddresses } from '@/app/config/contract-addresses'
import { merchantAbi } from '@/app/config/abis/merchant-abi'
import { erc20Abi } from '@/app/config/abis/erc20-abi'

// Create a public client to interact with the blockchain
const publicClient = createPublicClient({
  chain: seiTestnet,
  transport: http('https://evm-rpc-testnet.sei-apis.com')
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const itemId = searchParams.get('itemId')
    
    if (!address || !itemId) {
      return NextResponse.json(
        { error: 'Address and itemId parameters are required' },
        { status: 400 }
      )
    }
    
    // Check eligibility from the contract
    const isEligible = await publicClient.readContract({
      address: contractAddresses.merchant as `0x${string}`,
      abi: merchantAbi,
      functionName: 'isEligibleForPurchase',
      args: [address as `0x${string}`, BigInt(itemId)]
    })
    
    // Get item info
    const itemInfo = await publicClient.readContract({
      address: contractAddresses.merchant as `0x${string}`,
      abi: merchantAbi,
      functionName: 'getItemInfo',
      args: [BigInt(itemId)]
    })
    
    // Get user's ySYLD balance
    const ySYLDBalance = await publicClient.readContract({
      address: contractAddresses.yieldToken as `0x${string}`,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [address as `0x${string}`]
    })
    
    return NextResponse.json({
      isEligible,
      requiredYSYLD: itemInfo[5].toString(),
      userYSYLDBalance: ySYLDBalance.toString()
    })
  } catch (error) {
    console.error('Error checking eligibility:', error)
    return NextResponse.json(
      { error: 'Failed to check eligibility' },
      { status: 500 }
    )
  }
}
