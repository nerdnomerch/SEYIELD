'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAccount } from 'wagmi'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Wallet, CreditCard } from 'lucide-react'

export function WalletBalanceDisplay() {
  const [selectedAsset, setSelectedAsset] = useState<'sei' | 'usdc'>('usdc')
  const { isConnected } = useAccount()
  const { 
    balance, 
    symbol, 
    isLoading: isBalanceLoading 
  } = useTokenBalance(selectedAsset)

  return (
    <Card className="border border-pink-100 dark:border-pink-900/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Wallet Balance</CardTitle>
            <CardDescription>Your available assets</CardDescription>
          </div>
          <Wallet className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {!isConnected ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Connect your wallet to view balance</p>
          </div>
        ) : (
          <>
            <Tabs defaultValue="usdc" onValueChange={(value) => setSelectedAsset(value as 'sei' | 'usdc')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="usdc">USDC</TabsTrigger>
                <TabsTrigger value="sei">SEI</TabsTrigger>
              </TabsList>
              <TabsContent value="usdc" className="pt-4">
                <BalanceContent 
                  isLoading={isBalanceLoading} 
                  balance={balance} 
                  symbol={symbol} 
                  assetName="USD Coin" 
                />
              </TabsContent>
              <TabsContent value="sei" className="pt-4">
                <BalanceContent 
                  isLoading={isBalanceLoading} 
                  balance={balance} 
                  symbol={symbol} 
                  assetName="SEI Token" 
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  )
}

interface BalanceContentProps {
  isLoading: boolean
  balance: string | undefined
  symbol: string | undefined
  assetName: string
}

function BalanceContent({ isLoading, balance, symbol, assetName }: BalanceContentProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{assetName}</span>
      </div>
      
      {isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <div className="text-2xl font-bold">
          {balance || '0'} <span className="text-muted-foreground">{symbol}</span>
        </div>
      )}
    </div>
  )
}
