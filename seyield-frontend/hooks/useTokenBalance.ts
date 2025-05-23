'use client'

import { useAccount, useBalance } from 'wagmi'
import { tokenAddresses, tokenMetadata } from '@/app/config/token-addresses'

type AssetType = 'sei' | 'usdc' 

/**
 * Custom hook to fetch token balance for a specific asset
 * @param asset The asset to fetch balance for ('sei' or 'usdc')
 * @returns Object containing balance information and loading state
 */
export function useTokenBalance(asset: AssetType) {
  const { address, isConnected } = useAccount()
  
  // For SEI (native token), we don't need to pass a token address
  // For USDC, we need to pass the token contract address
  const { data, isError, isLoading, refetch } = useBalance({
    address: isConnected ? address : undefined,
    token: asset !== 'sei' ? tokenAddresses[asset] as `0x${string}` : undefined,
  })

  return {
    balance: data?.formatted,
    symbol: data?.symbol || tokenMetadata[asset]?.symbol,
    decimals: data?.decimals || tokenMetadata[asset]?.decimals,
    value: data?.value,
    isLoading,
    isError,
    refetch,
    isConnected,
  }
}
