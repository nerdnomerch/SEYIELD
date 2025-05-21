"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

const shops = [
  {
    id: 1,
    name: "Amazon",
    category: "Shopping",
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Coursera",
    category: "Education",
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Udemy",
    category: "Education",
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Shopify Stores",
    category: "Shopping",
    logo: "/placeholder.svg?height=40&width=40",
  },
]

export function AvailableShops() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="h-full border border-pink-100 dark:border-pink-900/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Available Shops</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/shop">
              View All
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shops.map((shop) => (
              <div key={shop.id} className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                  <img src={shop.logo || "/placeholder.svg"} alt={shop.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{shop.name}</div>
                  <div className="text-sm text-muted-foreground">{shop.category}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-pink-200 dark:border-pink-800 hover:bg-pink-50 dark:hover:bg-pink-900/20"
                >
                  Shop
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
