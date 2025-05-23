'use client'

import { useAccount, useBalance, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi'

export function useWalletInfo() {
  const { address, isConnected, isConnecting, isDisconnected, status } = useAccount()
  const { data: ensName } = useEnsName({ address })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! })
  const { disconnect } = useDisconnect()
  const { data: balanceData } = useBalance({
    address,
  })

  return {
    address,
    displayName: ensName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : undefined),
    ensAvatar,
    isConnected,
    isConnecting,
    isDisconnected,
    status,
    disconnect,
    balance: balanceData?.formatted,
    balanceSymbol: balanceData?.symbol,
  }
}
