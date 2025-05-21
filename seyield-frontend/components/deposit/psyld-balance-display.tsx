'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAccount } from 'wagmi'
import { useReadContract } from 'wagmi'
import { contractAddresses } from '@/app/config/contract-addresses'
import { erc20Abi } from '@/app/config/abis/erc20-abi'
import { formatUnits } from 'viem'
import { Skeleton } from '@/components/ui/skeleton'
import { Coins } from 'lucide-react'

export function PSYLDBalanceDisplay() {
  const { address, isConnected } = useAccount()
  
  // Get pSYLD balance
  const { data: pSyldBalance, isLoading: isPSyldLoading } = useReadContract({
    address: contractAddresses.principalToken as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: !!address && isConnected,
    }
  })
  
  // Format balance for display
  const formattedPSyldBalance = pSyldBalance ? formatUnits(pSyldBalance, 6) : '0'
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          Your pSYLD Balance
        </CardTitle>
        <CardDescription>
          Principal tokens representing your deposits
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-2">
            {isPSyldLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{Number(formattedPSyldBalance).toLocaleString()}</span>
                <span className="text-muted-foreground">pSYLD</span>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Each pSYLD token represents 1 USDC deposited in the protocol
            </p>
          </div>
        ) : (
          <div className="text-center py-2 text-muted-foreground">
            Connect your wallet to view your pSYLD balance
          </div>
        )}
      </CardContent>
    </Card>
  )
}
