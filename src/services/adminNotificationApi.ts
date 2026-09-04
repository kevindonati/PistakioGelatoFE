export interface AdminNotificationOrder {
  id: string
  total: number
  createdAt: string
  user: {
    id: string
    name: string
    surname: string
    email: string
  }
}

export interface AdminNotificationCustomer {
  id: string
  name: string
  surname: string
  email: string
  createdAt: string
}

export interface AdminNotifications {
  ordersCount: number
  customersCount: number
  orders: AdminNotificationOrder[]
  customers: AdminNotificationCustomer[]
}
