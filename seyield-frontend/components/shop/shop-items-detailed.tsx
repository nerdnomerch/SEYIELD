"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { ShoppingCart, Info, Check, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { shopItems } from "@/data/shop-items"

// Using the imported shopItems from data file

export function ShopItemsDetailed() {
  const { toast } = useToast()
  const [selectedItem, setSelectedItem] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Mock user data
  const userRewards = 100
  const userDeposit = 1000

  const handlePurchase = (item) => {
    setIsProcessing(true)

    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false)

      toast({
        title: "Purchase successful!",
        description: `You've purchased ${item.name} for ${item.price} USDC using your rewards.`,
      })

      // Close dialog
      setSelectedItem(null)
    }, 1500)
  }

  const openItemDetails = (item) => {
    setSelectedItem(item)
  }

  return (
    <div className="space-y-8">
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
              <CardContent className="pb-2 space-y-2">
                <div className="text-muted-foreground text-sm capitalize">{item.category.replace("-", " ")}</div>
                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>

                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Min. Deposit Required</span>
                    <span className="font-medium">{item.depositRequired} USDC</span>
                  </div>
                  <Progress value={(userDeposit / item.depositRequired) * 100} className="h-1" />
                  <div className="flex justify-end mt-1">
                    <span className="text-xs text-muted-foreground">
                      {userDeposit >= item.depositRequired ? (
                        <span className="text-green-500 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Eligible
                        </span>
                      ) : (
                        <span className="text-amber-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Need {item.depositRequired - userDeposit} more USDC
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="mt-auto pt-2 flex items-center justify-between">
                <div className="font-bold">{item.price} USDC</div>
                <div className="flex gap-2">
                  <Button size="sm" className="gap-2" variant="outline" onClick={() => openItemDetails(item)}>
                    <Info className="h-4 w-4" />
                    Quick View
                  </Button>
                  <Button size="sm" className="gap-2" variant="outline" asChild>
                    <Link href={`/shop/${item.id}`}>
                      <ShoppingCart className="h-4 w-4" />
                      Buy
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Item Details Dialog */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedItem.name}</DialogTitle>
              <DialogDescription>{selectedItem.description}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <img
                    src={selectedItem.image || "/placeholder.svg"}
                    alt={selectedItem.name}
                    className="w-full aspect-square object-cover rounded-md"
                  />
                </div>
                <div className="col-span-3 space-y-2">
                  <p className="text-sm">{selectedItem.details}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium capitalize">{selectedItem.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium">{selectedItem.price} USDC</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="font-medium">Purchase Requirements</h4>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Minimum Deposit Required:</span>
                    <span className="font-medium">{selectedItem.depositRequired} USDC</span>
                  </div>
                  <Progress value={(userDeposit / selectedItem.depositRequired) * 100} className="h-1" />
                  <div className="flex justify-end mt-1">
                    <span className="text-xs">
                      {userDeposit >= selectedItem.depositRequired ? (
                        <span className="text-green-500 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Your deposit: {userDeposit} USDC
                        </span>
                      ) : (
                        <span className="text-amber-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Need {selectedItem.depositRequired - userDeposit} more
                          USDC
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Rewards Required:</span>
                    <span className="font-medium">{selectedItem.price} USDC</span>
                  </div>
                  <Progress value={(userRewards / selectedItem.price) * 100} className="h-1" />
                  <div className="flex justify-end mt-1">
                    <span className="text-xs">
                      {userRewards >= selectedItem.price ? (
                        <span className="text-green-500 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Your rewards: {userRewards} USDC
                        </span>
                      ) : (
                        <span className="text-amber-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Need {selectedItem.price - userRewards} more USDC
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={() => handlePurchase(selectedItem)}
                disabled={
                  isProcessing || userRewards < selectedItem.price || userDeposit < selectedItem.depositRequired
                }
                className="gap-2 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700"
              >
                {isProcessing ? (
                  "Processing..."
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    Buy with Rewards
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
