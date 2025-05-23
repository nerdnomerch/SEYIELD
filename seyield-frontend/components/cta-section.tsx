"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-violet-500/20 rounded-3xl blur-3xl" />
            <div className="relative bg-gradient-to-br from-background/80 to-background rounded-3xl border p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Buy Now, Pay Never?</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join SEYIELD today and experience the future of shopping with rewards. Your deposit stays safe while
                your money works for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700"
                >
                  <Link href="/deposit">
                    Start Depositing
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/how-it-works">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
