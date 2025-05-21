"use client"
import { Input } from "@/components/ui/input"
import { Search, ShoppingBag } from "lucide-react"
import { motion } from "framer-motion"

export function ShopHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
      id="shop-header"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-8 w-8" />
            Shop with Rewards
          </h1>
          <p className="text-muted-foreground">Browse our partner merchants and spend your rewards</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-300 px-3 py-1 rounded-full text-sm font-medium">
            Available: 100 USDC
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search shops and products..." className="pl-10" />
      </div>
    </motion.div>
  )
}
