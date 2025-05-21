"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { ShoppingCart, Info } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const shopItems = [
  {
    id: 1,
    name: "Coursera Subscription",
    category: "education",
    price: 49,
    image: "/placeholder.svg?height=200&width=200",
    popular: true,
  },
  {
    id: 2,
    name: "Udemy Course Bundle",
    category: "education",
    price: 29.99,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 3,
    name: "Amazon Gift Card",
    category: "gifts",
    price: 25,
    image: "/placeholder.svg?height=200&width=200",
    popular: true,
  },
  {
    id: 4,
    name: "Spotify Premium",
    category: "entertainment",
    price: 9.99,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 5,
    name: "Netflix Subscription",
    category: "entertainment",
    price: 15.99,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 6,
    name: "DoorDash Credit",
    category: "food",
    price: 20,
    image: "/placeholder.svg?height=200&width=200",
  },
]

export function ShopItems() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const handlePurchase = (item) => {
    toast({
      title: "Purchase successful!",
      description: `You've purchased ${item.name} for ${item.price} USDC using your rewards.`,
    })
  }

  const handleLearnMore = (item) => {
    setSelectedItem(item)
    setOpen(true)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="shop-items">
      {shopItems.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
          whileHover={{ y: -5 }}
        >
          <Card className="overflow-hidden h-full flex flex-col border border-pink-100 dark:border-pink-900/20 hover:border-pink-200 dark:hover:border-pink-800/30 transition-colors">
            <div className="aspect-square relative overflow-hidden bg-muted">
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                className="object-cover w-full h-full transition-transform hover:scale-105"
              />
              {item.popular && (
                <Badge className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700">
                  Popular
                </Badge>
              )}
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{item.name}</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-muted-foreground text-sm capitalize">{item.category.replace("-", " ")}</div>
            </CardContent>
            <CardFooter className="mt-auto pt-2 flex items-center justify-between">
              <div className="font-bold">{item.price} USDC</div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleLearnMore(item)}>
                  <Info className="h-4 w-4 mr-2" />
                  Learn More
                </Button>
                <Button
                  size="sm"
                  className="gap-2 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700"
                  onClick={() => handlePurchase(item)}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Buy with Rewards
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedItem?.name}</DialogTitle>
            <DialogDescription>
              {selectedItem ? (
                <>Learn more about the {selectedItem?.name} and how it can benefit you.</>
              ) : (
                "No item selected."
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Category
              </label>
              <input
                type="text"
                id="name"
                value={selectedItem?.category}
                className="col-span-3 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="username" className="text-right">
                Price
              </label>
              <input
                type="text"
                id="username"
                value={selectedItem?.price}
                className="col-span-3 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
