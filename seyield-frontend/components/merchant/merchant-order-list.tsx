"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, AlertCircle, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { formatUnits } from "viem"
import Link from "next/link"

export function MerchantOrderList({ orders, showActions = false }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" /> Completed
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            <Clock className="h-3 w-3 mr-1" /> Processing
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            <AlertCircle className="h-3 w-3 mr-1" /> Failed
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        )
    }
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No orders found</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            {showActions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <div className="font-medium">{order.id}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(order.timestamp ? order.timestamp * 1000 : order.date), { addSuffix: true })}
                </div>
              </TableCell>
              <TableCell>{order.item?.name || order.product}</TableCell>
              <TableCell>
                <div className="font-medium text-green-600 dark:text-green-500">
                  +{order.price ? formatUnits(BigInt(order.price), 6) : order.amount.toFixed(2)} USDC
                </div>
                <div className="text-xs text-muted-foreground">
                  Paid by SEYIELD
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              {showActions && (
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">View</span>
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
