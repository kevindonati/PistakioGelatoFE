import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import type { Flavor } from "../types/Flavor"
import type { Tub } from "../types/Tub"
import type { Order } from "../types/Order"

import {
  createOrder,
  getCartOrder,
  getOrderItems,
  addOrderItem,
  updateOrderItem,
  deleteOrderItem,
} from "../services/orderApi"

import { getFlavorById, getTubById } from "../services/catalogApi"

import { useAuth } from "./useAuth"

export interface CartItem {
  id: string
  flavor: Flavor
  tub: Tub
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  order: Order | null
  loading: boolean
  addToCart: (flavor: Flavor, tub: Tub, quantity: number) => Promise<void>
  removeFromCart: (flavorId: string, tubId: string) => Promise<void>
  updateQuantity: (
    flavorId: string,
    tubId: string,
    quantity: number,
  ) => Promise<void>
  clearCart: () => Promise<void>
  totalItems: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()

  const [items, setItems] = useState<CartItem[]>([])
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadCart = async () => {
      //svuoto carrello
      setItems([])
      setOrder(null)

      if (!isAuthenticated || !user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const cartOrder = await getCartOrder()

        if (cancelled) {
          return
        }

        if (!cartOrder) {
          setOrder(null)
          setItems([])
          return
        }

        setOrder(cartOrder)

        const orderItems = await getOrderItems()

        if (cancelled) {
          return
        }

        const cartOrderItems = orderItems.filter(
          (item) => item.order.id === cartOrder.id,
        )

        const cartItems = await Promise.all(
          cartOrderItems.map(async (item) => {
            const [flavor, tub] = await Promise.all([
              getFlavorById(item.flavor.id),
              getTubById(item.tub.id),
            ])

            return {
              id: item.id,
              flavor,
              tub,
              quantity: item.quantity,
            }
          }),
        )

        if (cancelled) {
          return
        }

        setItems(cartItems)
      } catch (error) {
        if (cancelled) {
          return
        }

        console.error("Errore caricamento carrello:", error)

        setItems([])
        setOrder(null)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadCart()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, user])

  const addToCart = async (flavor: Flavor, tub: Tub, quantity: number) => {
    let currentOrder = order

    if (!currentOrder) {
      currentOrder = await createOrder()
      setOrder(currentOrder)
    }

    const existingItem = items.find(
      (item) => item.flavor.id === flavor.id && item.tub.id === tub.id,
    )

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity

      if (newQuantity > flavor.stockPortions) {
        throw new Error("Not enough stock")
      }

      await updateOrderItem(
        existingItem.id,
        currentOrder.id,
        flavor.id,
        tub.id,
        newQuantity,
      )

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === existingItem.id
            ? {
                ...item,
                quantity: newQuantity,
              }
            : item,
        ),
      )

      return
    }

    const savedItem = await addOrderItem(
      currentOrder.id,
      flavor.id,
      tub.id,
      quantity,
    )

    setItems((currentItems) => [
      ...currentItems,
      {
        id: savedItem.id,
        flavor,
        tub,
        quantity,
      },
    ])
  }

  const removeFromCart = async (flavorId: string, tubId: string) => {
    const item = items.find(
      (currentItem) =>
        currentItem.flavor.id === flavorId && currentItem.tub.id === tubId,
    )

    if (!item) {
      return
    }

    await deleteOrderItem(item.id)

    setItems((currentItems) =>
      currentItems.filter((currentItem) => currentItem.id !== item.id),
    )
  }

  const updateQuantity = async (
    flavorId: string,
    tubId: string,
    quantity: number,
  ) => {
    const item = items.find(
      (currentItem) =>
        currentItem.flavor.id === flavorId && currentItem.tub.id === tubId,
    )

    if (!item) {
      return
    }

    if (quantity <= 0) {
      await removeFromCart(flavorId, tubId)
      return
    }

    if (quantity > item.flavor.stockPortions) {
      return
    }

    if (!order) {
      return
    }

    await updateOrderItem(item.id, order.id, flavorId, tubId, quantity)

    setItems((currentItems) =>
      currentItems.map((currentItem) =>
        currentItem.id === item.id
          ? {
              ...currentItem,
              quantity,
            }
          : currentItem,
      ),
    )
  }

  const clearCart = async () => {
    await Promise.all(items.map((item) => deleteOrderItem(item.id)))

    setItems([])
  }

  const totalItems = items.reduce((total, item) => total + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        order,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error("useCart must be used inside CartProvider")
  }

  return context
}
