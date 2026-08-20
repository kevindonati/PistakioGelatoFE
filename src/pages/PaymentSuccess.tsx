import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ArrowRight, CheckCircle, MapPin, Package } from "lucide-react"

import { getOrderById, getOrderItems } from "../services/orderApi"

import { getFlavorById, getTubById } from "../services/catalogApi"

import type { Order } from "../types/Order"
import type { OrderItem } from "../types/OrderItem"
import type { Flavor } from "../types/Flavor"
import type { Tub } from "../types/Tub"

import Loading from "../components/Loading"

interface PaymentItem {
  orderItem: OrderItem
  flavor: Flavor
  tub: Tub
}

function PaymentSuccess() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()

  const orderId = searchParams.get("orderId")

  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<PaymentItem[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!orderId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(t("paymentSuccess.orderNotFound"))
      setLoading(false)
      return
    }

    let cancelled = false
    let attempts = 0

    const loadPaymentSuccess = async () => {
      try {
        setLoading(true)
        setError("")

        const orderData = await getOrderById(orderId)

        if (cancelled) {
          return
        }

        if (orderData.orderStatus !== "PAID" && attempts < 5) {
          attempts++

          setTimeout(loadPaymentSuccess, 1000)

          return
        }

        const orderItems = await getOrderItems()

        if (cancelled) {
          return
        }

        const currentOrderItems = orderItems.filter(
          (item) => item.order.id === orderData.id,
        )

        const completeItems = await Promise.all(
          currentOrderItems.map(async (item) => {
            const [flavor, tub] = await Promise.all([
              getFlavorById(item.flavor.id),
              getTubById(item.tub.id),
            ])

            return {
              orderItem: item,
              flavor,
              tub,
            }
          }),
        )

        if (cancelled) {
          return
        }

        setOrder(orderData)
        setItems(completeItems)

        if (orderData.orderStatus !== "PAID") {
          setError(t("paymentSuccess.paymentPending"))
        }
      } catch (error) {
        console.error(error)

        if (!cancelled) {
          setError(t("paymentSuccess.loadError"))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadPaymentSuccess()

    return () => {
      cancelled = true
    }
  }, [orderId, t])

  if (loading) {
    return <Loading />
  }

  if (!order) {
    return (
      <main className="container py-5">
        <div className="alert alert-danger">
          {error || t("paymentSuccess.loadError")}
        </div>

        <Link to="/catalog" className="btn btn-dark">
          {t("paymentSuccess.backToCatalog")}
        </Link>
      </main>
    )
  }

  const isPaid = order.orderStatus === "PAID"

  const subtotal = items.reduce(
    (total, item) => total + item.orderItem.unitPrice * item.orderItem.quantity,
    0,
  )

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          {/* HEADER */}

          <div className="text-center mb-5">
            <CheckCircle
              size={72}
              strokeWidth={1.5}
              className="text-success mb-3"
            />

            <h1 className="mb-2">
              {isPaid
                ? t("paymentSuccess.title")
                : t("paymentSuccess.paymentPending")}
            </h1>

            <p className="text-muted mb-0">
              {isPaid
                ? t("paymentSuccess.message")
                : t("paymentSuccess.pendingMessage")}
            </p>
          </div>

          {/* ORDER */}

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="h5 mb-0">
                  <Package size={20} className="me-2" />

                  {t("paymentSuccess.order")}
                </h2>

                <span
                  className={`badge ${
                    isPaid ? "text-bg-success" : "text-bg-warning"
                  }`}
                >
                  {order.orderStatus}
                </span>
              </div>

              {/* ORDER ID */}

              <div className="mb-3">
                <small className="text-muted d-block">
                  {t("paymentSuccess.orderId")}
                </small>

                <span className="text-break">{order.id}</span>
              </div>

              {/* DATE */}

              <div className="mb-4">
                <small className="text-muted d-block">
                  {t("paymentSuccess.orderDate")}
                </small>

                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </div>

              <hr />

              {/* PRODUCTS */}

              <h3 className="h6 mb-3">{t("paymentSuccess.products")}</h3>

              <div className="d-flex flex-column gap-3">
                {items.length === 0 ? (
                  <p className="text-muted mb-0">
                    {t("paymentSuccess.noProducts")}
                  </p>
                ) : (
                  items.map(({ orderItem, flavor, tub }) => (
                    <div
                      key={orderItem.id}
                      className="d-flex justify-content-between align-items-center gap-3"
                    >
                      <div className="d-flex align-items-center gap-3">
                        {flavor.image && (
                          <img
                            src={flavor.image}
                            alt={flavor.name}
                            style={{
                              width: "60px",
                              height: "60px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        )}

                        <div>
                          <div className="fw-semibold">{flavor.name}</div>

                          <small className="text-muted">
                            {tub.weight} g × {orderItem.quantity}
                          </small>
                        </div>
                      </div>

                      <div className="text-nowrap">
                        €{(orderItem.unitPrice * orderItem.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <hr />

              {/* SUBTOTAL */}

              <div className="d-flex justify-content-between mb-2">
                <span>{t("paymentSuccess.subtotal")}</span>

                <span>€ {subtotal.toFixed(2)}</span>
              </div>

              {/* SHIPPING */}

              <div className="d-flex justify-content-between mb-3">
                <span>{t("checkout.shipping")}</span>

                <span>
                  {order.shippingCost === 0
                    ? t("checkout.free")
                    : `€ ${order.shippingCost.toFixed(2)}`}
                </span>
              </div>

              <hr />

              {/* TOTAL */}

              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">{t("cart.total")}</span>

                <span className="fw-bold fs-4">€ {order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* ADDRESS */}

          {order.address && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h2 className="h5 mb-3">
                  <MapPin size={19} className="me-2" />

                  {t("paymentSuccess.deliveryAddress")}
                </h2>

                <div>{order.address.addressLine1}</div>

                {order.address.addressLine2 && (
                  <div>{order.address.addressLine2}</div>
                )}

                <div>
                  {order.address.postalCode} {order.address.city}
                </div>

                <div>{order.address.country}</div>
              </div>
            </div>
          )}

          {/* NOTES */}

          {order.notes && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h2 className="h5 mb-2">{t("paymentSuccess.notes")}</h2>

                <p className="mb-0 text-muted">{order.notes}</p>
              </div>
            </div>
          )}

          {/* ACTIONS */}

          <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
            <Link to="/orders" className="btn btn-dark">
              {t("paymentSuccess.myOrders")}

              <ArrowRight size={17} className="ms-2" />
            </Link>

            <Link to="/catalog" className="btn btn-outline-dark">
              {t("paymentSuccess.backToCatalog")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default PaymentSuccess
