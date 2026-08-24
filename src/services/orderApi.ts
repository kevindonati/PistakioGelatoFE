import api from "./api"

import type { Order } from "../types/Order"
import type { OrderItem } from "../types/OrderItem"

export const createOrder = async (): Promise<Order> => {
  const response = await api.post<Order>("/orders")

  return response.data
}

export const getOrders = async (): Promise<Order[]> => {
  const response = await api.get<{
    content: Order[]
  }>("/orders", {
    params: {
      page: 0,
      size: 50,
    },
  })

  return response.data.content
}

export const getOrderById = async (orderId: string): Promise<Order> => {
  const response = await api.get<Order>(`/orders/${orderId}`)

  return response.data
}

export const getOrderItems = async (): Promise<OrderItem[]> => {
  const response = await api.get<{
    content: OrderItem[]
  }>("/order-items", {
    params: {
      page: 0,
      size: 50,
    },
  })

  return response.data.content
}

export const addOrderItem = async (
  orderId: string,
  flavorId: string,
  tubId: string,
  quantity: number,
): Promise<OrderItem> => {
  const response = await api.post<OrderItem>("/order-items", {
    order: orderId,
    flavor: flavorId,
    tub: tubId,
    quantity,
  })

  return response.data
}

export const updateOrderItem = async (
  orderItemId: string,
  orderId: string,
  flavorId: string,
  tubId: string,
  quantity: number,
): Promise<OrderItem> => {
  const response = await api.put<OrderItem>(`/order-items/${orderItemId}`, {
    order: orderId,
    flavor: flavorId,
    tub: tubId,
    quantity,
  })

  return response.data
}

export const deleteOrderItem = async (orderItemId: string): Promise<void> => {
  await api.delete(`/order-items/${orderItemId}`)
}

export const getCartOrder = async (): Promise<Order | null> => {
  const response = await api.get<Order | null>("/orders/cart")

  return response.data
}

export interface CheckoutData {
  address: string
  notes?: string
}

export const checkoutOrder = async (
  orderId: string,
  data: CheckoutData,
): Promise<Order> => {
  const response = await api.put<Order>(`/orders/${orderId}/checkout`, data)

  return response.data
}

export const getShippingCost = async (): Promise<number> => {
  const response = await api.get<number>("/settings/shipping-cost")
  return response.data
}

export interface StripeCheckoutResponse {
  checkoutUrl: string
}

export const createStripeCheckout = async (
  orderId: string,
): Promise<{ url: string }> => {
  const response = await api.post<{ url: string }>(
    `/payments/stripe/${orderId}`,
  )

  return response.data
}

export const getMyOrders = async (
  page = 0,
  size = 10,
): Promise<{
  content: Order[]
  totalPages: number
  totalElements: number
}> => {
  const response = await api.get("/orders/my", {
    params: {
      page,
      size,
      orderBy: "createdAt",
    },
  })

  return response.data
}

export const getMyOrderById = async (id: string): Promise<Order> => {
  const response = await api.get<Order>(`/orders/${id}`)

  return response.data
}

export const getMyOrderItems = async (page = 0, size = 50) => {
  const response = await api.get("/order-items", {
    params: {
      page,
      size,
      orderBy: "id",
    },
  })

  return response.data.content
}

export interface OrderFilters {
  page?: number
  size?: number
  direction?: "asc" | "desc"
  id?: string
  userId?: string
  customer?: string
  status?: string
  minTotal?: number
  maxTotal?: number
  dateFrom?: string
  dateTo?: string
}

export const getAllOrders = async ({
  page = 0,
  size = 15,
  direction = "desc",
  id,
  userId,
  customer,
  status,
  minTotal,
  maxTotal,
  dateFrom,
  dateTo,
}: OrderFilters = {}): Promise<{
  content: Order[]
  totalPages: number
  totalElements: number
}> => {
  const response = await api.get("/orders", {
    params: {
      page,
      size,
      orderBy: "createdAt",
      direction,
      id: id || undefined,
      userId: userId || undefined,
      customer: customer || undefined,
      status: status || undefined,
      minTotal,
      maxTotal,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    },
  })

  return response.data
}

export const prepareOrder = async (orderId: string): Promise<Order> => {
  const response = await api.put(`/orders/${orderId}/prepare`)

  return response.data
}

export interface Shipment {
  id: string
  carrier: string
  trackingNumber: string
  status: string
  deliveredAt: string | null
  order: {
    id: string
  }
}

export const getAllShipments = async (
  page = 0,
  size = 50,
): Promise<{
  content: Shipment[]
  totalPages: number
  totalElements: number
}> => {
  const response = await api.get("/shipments", {
    params: {
      page,
      size,
      orderBy: "shippingDate",
    },
  })

  return response.data
}

export const createShipment = async (data: {
  carrier: string
  trackingNumber: string
  order: string
}) => {
  const response = await api.post("/shipments", data)

  return response.data
}

export const updateShipmentStatus = async (
  shipmentId: string,
  status: "SHIPPED" | "DELIVERED",
): Promise<Shipment> => {
  const response = await api.patch(`/shipments/${shipmentId}/status`, null, {
    params: {
      status,
    },
  })

  return response.data
}

export interface Payment {
  id: string
  provider: string
  idTransaction: string
  stripeEventId: string | null
  amount: number
  currency: string
  status: string
  paymentDate: string
  order: {
    id: string
  }
}

export const getAllPayments = async (
  page = 0,
  size = 50,
): Promise<{
  content: Payment[]
  totalPages: number
  totalElements: number
}> => {
  const response = await api.get("/payments", {
    params: {
      page,
      size,
      orderBy: "paymentDate",
    },
  })

  return response.data
}

export const getPaymentByOrderId = async (
  orderId: string,
): Promise<Payment> => {
  const response = await api.get<Payment>(`/payments/order/${orderId}`)

  return response.data
}
