"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

const partners = [
  { name: "Amazon", logo: "/placeholder.svg?height=60&width=120" },
  { name: "Coursera", logo: "/placeholder.svg?height=60&width=120" },
  { name: "Udemy", logo: "/placeholder.svg?height=60&width=120" },
  { name: "Shopify", logo: "/placeholder.svg?height=60&width=120" },
  { name: "Netflix", logo: "/placeholder.svg?height=60&width=120" },
  { name: "Spotify", logo: "/placeholder.svg?height=60&width=120" },
]

export function Partners() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Partners</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Shop with your rewards at these popular merchants and many more
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
        >
          {partners.map((partner, index) => (
            <Card key={index} className="border-none bg-background shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-center p-6 h-24">
                <img src={partner.logo || "/placeholder.svg"} alt={partner.name} className="max-h-full max-w-full" />
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
