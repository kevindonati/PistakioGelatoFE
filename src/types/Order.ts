import type { OrderStatus } from "./OrderStatus"

export interface Order {
  id: string
  orderStatus: OrderStatus
  shippingCost: number
  total: number
  notes: string | null
  createdAt: string
  updatedAt: string
}
