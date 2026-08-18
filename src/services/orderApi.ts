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
