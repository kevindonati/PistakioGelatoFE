import type { OrderStatus } from "./OrderStatus"

export interface Order {
  id: string
  orderStatus: OrderStatus
  shippingCost: number
  total: number
  notes: string | null
  createdAt: string
  updatedAt: string

  user: {
    id: string
    name: string
    surname: string
    email: string
  }

  address: {
    id: string
    addressLine1: string
    addressLine2?: string
    postalCode: string
    city: string
    country: string
  }
}
