export interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  order: {
    id: string
  }
  flavor: {
    id: string
  }
  tub: {
    id: string
  }
}
