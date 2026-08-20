import type { OrderStatus } from "./OrderStatus"
import type { Address } from "./Address"

export interface Order {
  id: string
  orderStatus: OrderStatus
  shippingCost: number
  total: number
  notes: string | null
  createdAt: string
  updatedAt: string
  user: unknown
  address: Address | null
}
