"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Book, ShoppingCart, Laptop, Utensils, Ticket, Gift } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const categories = [
  { id: "all", name: "All", icon: ShoppingCart },
  { id: "education", name: "Education", icon: Book },
  { id: "electronics", name: "Electronics", icon: Laptop },
  { id: "food", name: "Food & Drinks", icon: Utensils },
  { id: "entertainment", name: "Entertainment", icon: Ticket },
  { id: "gifts", name: "Gift Cards", icon: Gift },
]

export function ShopCategories() {
  const [activeCategory, setActiveCategory] = useState("all")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mb-8"
      id="shop-categories"
    >
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 gap-2 scrollbar-hide">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant="outline"
            className={cn(
              "flex items-center gap-2 whitespace-nowrap",
              activeCategory === category.id &&
                "bg-gradient-to-r from-pink-500 to-violet-600 text-white hover:from-pink-600 hover:to-violet-700 hover:text-white border-transparent",
            )}
            onClick={() => setActiveCategory(category.id)}
          >
            <category.icon className="h-4 w-4" />
            {category.name}
          </Button>
        ))}
      </div>
    </motion.div>
  )
}
