"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

type WalletContextType = {
  address: string | null
  balance: {
    sei: number
    usdc: number
    usdt: number
    eth: number
  }
  connect: () => void
  disconnect: () => void
  isConnecting: boolean
  chainId: string
  switchNetwork: (chainId: string) => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Mock wallet data for demonstration
const MOCK_ADDRESSES = [
  "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b",
]

const NETWORKS = {
  "sei-testnet": { name: "SEI Testnet", chainId: "sei-testnet" },
  ethereum: { name: "Ethereum", chainId: "ethereum" },
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [chainId, setChainId] = useState("sei-testnet")
  const [balance, setBalance] = useState({
    sei: 100,
    usdc: 1000,
    usdt: 500,
    eth: 0.5,
  })
  const { toast } = useToast()

  // Check for saved wallet connection
  useEffect(() => {
    const savedAddress = localStorage.getItem("walletAddress")
    if (savedAddress) {
      setAddress(savedAddress)
    }
  }, [])

  const connect = async () => {
    setIsConnecting(true)

    // Simulate wallet connection delay
    setTimeout(() => {
      try {
        // Randomly select a mock address
        const randomAddress = MOCK_ADDRESSES[Math.floor(Math.random() * MOCK_ADDRESSES.length)]
        setAddress(randomAddress)
        localStorage.setItem("walletAddress", randomAddress)

        toast({
          title: "Wallet connected",
          description: `Connected to ${randomAddress.slice(0, 6)}...${randomAddress.slice(-4)}`,
        })
      } catch (error) {
        toast({
          title: "Connection failed",
          description: "Could not connect to wallet",
          variant: "destructive",
        })
      } finally {
        setIsConnecting(false)
      }
    }, 1000)
  }

  const disconnect = () => {
    setAddress(null)
    localStorage.removeItem("walletAddress")
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  const switchNetwork = (newChainId: string) => {
    setChainId(newChainId)
    toast({
      title: "Network switched",
      description: `Switched to ${NETWORKS[newChainId as keyof typeof NETWORKS]?.name || newChainId}`,
    })
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        balance,
        connect,
        disconnect,
        isConnecting,
        chainId,
        switchNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
