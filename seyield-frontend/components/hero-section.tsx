"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles, MousePointer, Wallet } from "lucide-react"
import { useRef, useEffect } from "react"
import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number | null>(null)
  const { address, isConnecting } = useAccount()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      }
    }

    const animateGradient = () => {
      const gradientElements = container.querySelectorAll(".interactive-gradient")
      const { x, y } = mouseRef.current

      for (const el of gradientElements) {
        if (el instanceof HTMLElement) {
          const translateX = (x - 0.5) * 20
          const translateY = (y - 0.5) * 20
          el.style.transform = `translate(${translateX}px, ${translateY}px)`
        }
      }

      rafRef.current = requestAnimationFrame(animateGradient)
    }

    container.addEventListener("mousemove", handleMouseMove)
    rafRef.current = requestAnimationFrame(animateGradient)

    return () => {
      container.removeEventListener("mousemove", handleMouseMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative overflow-hidden bg-background py-20 md:py-32">
      {/* Interactive background elements */}
      <div className="absolute inset-0 z-0 opacity-30 overflow-hidden">
        <div className="interactive-gradient absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-br from-pink-300 via-violet-300 to-transparent dark:from-pink-900/40 dark:via-violet-900/40 rounded-full blur-3xl transform -translate-y-1/2 scale-150 transition-transform duration-300 ease-out" />
        <div className="interactive-gradient absolute bottom-0 right-0 left-0 h-[300px] bg-gradient-to-tr from-blue-300 via-purple-300 to-transparent dark:from-blue-900/40 dark:via-purple-900/40 rounded-full blur-3xl transform translate-y-1/2 scale-150 transition-transform duration-300 ease-out" />
      </div>

      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-300 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>The First Buy Now Pay Never on SEI Network</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              <span className="block">Buy Now,</span>
              <span className="bg-gradient-to-r from-pink-500 to-violet-600 bg-clip-text text-transparent">
                Pay Never
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-md">
              Shop with upfront rewards from your deposits. Your original deposit stays intact.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {!address ? (
                <div className="custom-connect-button">
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => {
                      return (
                        <Button
                          size="lg"
                          className="gap-2 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700"
                          onClick={openConnectModal}
                          disabled={isConnecting}
                        >
                          <Wallet className="h-4 w-4" />
                          {isConnecting ? "Connecting..." : "Connect Wallet"}
                        </Button>
                      );
                    }}
                  </ConnectButton.Custom>
                </div>
              ) : (
                <Button
                  asChild
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700"
                >
                  <Link href="/deposit">
                    Launch App
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" size="lg">
                <Link href="/how-it-works">How It Works</Link>
              </Button>
            </div>

            {/* <motion.div
              className="mt-8 flex items-center gap-2 text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <MousePointer className="h-4 w-4 animate-bounce" />
              <span className="text-sm">Move your mouse to interact with the background</span>
            </motion.div> */}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="relative mx-auto w-full max-w-md">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 p-1 shadow-lg">
                <div className="h-full w-full rounded-xl bg-background p-4 sm:p-6">
                  <div className="flex flex-col h-full">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="rounded-lg bg-muted px-3 py-1 text-sm font-medium">Your Deposit</div>
                      <div className="text-sm text-muted-foreground">FIXED 7% APY</div>
                    </div>

                    <div className="mb-6 text-center">
                      <div className="text-3xl font-bold">1,000 USDC</div>
                    </div>

                    <div className="mb-6">
                      <div className="mb-2 flex justify-between text-sm">
                        <span>Rewards Generated</span>
                        <span className="font-medium">70 USDC/year</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-pink-500 to-violet-500"
                          initial={{ width: "0%" }}
                          animate={{ width: "35%" }}
                          transition={{ duration: 2, delay: 0.5 }}
                        />
                      </div>
                    </div>

                    <div className="rounded-lg border bg-card p-4 mb-4">
                      <div className="text-sm font-medium mb-2">Available for Shopping</div>
                      <div className="text-2xl font-bold">70 USDC</div>
                      <div className="text-xs text-muted-foreground">Upfront Rewards</div>
                    </div>

                    <Button className="mt-auto bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700">
                      Shop Now
                    </Button>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                className="absolute -top-6 -right-6 rounded-lg bg-card shadow-lg p-3 border"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
              >
                <div className="text-xs font-medium">Deposit Safe</div>
                <div className="text-sm font-bold text-green-500">100%</div>
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -left-4 rounded-lg bg-card shadow-lg p-3 border"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
              >
                <div className="text-xs font-medium">Yield Available</div>
                <div className="text-sm font-bold">Immediately</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
