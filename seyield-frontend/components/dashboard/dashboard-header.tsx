"use client"

import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export function DashboardHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Manage your deposits and track your rewards</p>
      </div>
      <div className="flex gap-2">
        <Button
          asChild
          className="gap-2 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700"
        >
          <Link href="/deposit">
            <PlusCircle className="h-4 w-4" />
            New Deposit
          </Link>
        </Button>
      </div>
    </motion.div>
  )
}
