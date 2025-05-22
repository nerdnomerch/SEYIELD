'use client'

import { useWalletInfo } from '@/hooks/useWalletInfo'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConnectButton } from './ConnectButton'

export function WalletInfo() {
  const { 
    address, 
    displayName, 
    isConnected, 
    balance, 
    balanceSymbol 
  } = useWalletInfo()

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet Connection</CardTitle>
          <CardDescription>Connect your wallet to get started</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ConnectButton />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Connected</CardTitle>
        <CardDescription>Your wallet is connected to the SEI Network</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Address</p>
            <p className="text-sm font-mono">{displayName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Balance</p>
            <p className="text-sm">
              {balance} {balanceSymbol}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
