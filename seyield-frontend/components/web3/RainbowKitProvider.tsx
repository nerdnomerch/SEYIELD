'use client'

import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http, WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { seiTestnet } from '@/app/config/sei-testnet'
import '@rainbow-me/rainbowkit/styles.css'

// Create a new query client for React Query
const queryClient = new QueryClient()

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'a22afebdaae366d76dc279c52b60a5cd'

const config = getDefaultConfig({
  appName: 'SEYIELD',
  projectId: projectId,
  chains: [seiTestnet],
  transports: {
    [seiTestnet.id]: http(),
  },
  ssr: true,
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          showRecentTransactions={true}
          appInfo={{
            appName: 'SEYIELD'
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
