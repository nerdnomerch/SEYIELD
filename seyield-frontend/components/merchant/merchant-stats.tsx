"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ShoppingBag, DollarSign, Package } from "lucide-react"
import { formatUnits } from "viem"

export function MerchantStats({ merchant, merchantInfo, merchantOrders }) {
  // Format values from blockchain data if available
  const totalSales = merchantInfo ? Number(merchantOrders?.length || 0) : merchant.totalSales
  const totalRevenue = merchantInfo
    ? Number(formatUnits(BigInt(merchantInfo.totalSales || 0), 6))
    : merchant.totalRevenue
  const pendingPayment = merchantInfo
    ? Number(formatUnits(BigInt(merchantInfo.pendingPayment || 0), 6))
    : merchant.pendingPayouts

  const stats = [
    {
      title: "Total Sales",
      value: totalSales,
      icon: <ShoppingBag className="h-5 w-5" />,
      description: "Total orders",
      trend: ""
    },
    {
      title: "Total Revenue",
      value: `${totalRevenue.toFixed(2)} USDC`,
      icon: <DollarSign className="h-5 w-5" />,
      description: "Lifetime earnings",
      trend: ""
    },
    {
      title: "Pending Payment",
      value: `${pendingPayment.toFixed(2)} USDC`,
      icon: <DollarSign className="h-5 w-5" />,
      description: "Awaiting payout",
      trend: ""
    },
    {
      title: "Active Products",
      value: merchantInfo ? merchantItems?.filter(item => item.isActive).length || 0 : 3,
      icon: <Package className="h-5 w-5" />,
      description: "Listed products",
      trend: ""
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={`stat-${stat.title}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {stat.icon}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              {stat.trend && (
                <p className="text-xs text-green-500">{stat.trend}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
