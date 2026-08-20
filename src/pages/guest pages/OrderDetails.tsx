import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ArrowLeft, Check, MapPin, Package } from "lucide-react"
import { createStripeCheckout } from "../../services/orderApi"

import { getMyOrderById, getMyOrderItems } from "../../services/orderApi"

import { getFlavorById, getTubById } from "../../services/catalogApi"

import type { Order } from "../../types/Order"
import type { OrderItem } from "../../types/OrderItem"
import type { Flavor } from "../../types/Flavor"
import type { Tub } from "../../types/Tub"

import Loading from "../../components/Loading"

interface OrderProduct {
  orderItem: OrderItem
  flavor: Flavor
  tub: Tub
}

function OrderDetails() {
  const { t } = useTranslation()
  const { id } = useParams()

  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderProduct[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [paymentLoading, setPaymentLoading] = useState(false)

  useEffect(() => {
    if (!id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(t("orderDetails.orderNotFound"))
      setLoading(false)
      return
    }

    const loadOrder = async () => {
      try {
        setLoading(true)
        setError("")

        const orderData = await getMyOrderById(id)

        const orderItems = await getMyOrderItems()

        const currentOrderItems = orderItems.filter(
          (item: OrderItem) => item.order.id === orderData.id,
        )

        const completeItems = await Promise.all(
          currentOrderItems.map(async (item: OrderItem) => {
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

        setOrder(orderData)
        setItems(completeItems)
      } catch (error) {
        console.error(error)
        setError(t("orderDetails.loadError"))
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [id, t])

  const handlePayment = async () => {
    if (!order) {
      return
    }

    try {
      setPaymentLoading(true)

      const response = await createStripeCheckout(order.id)

      window.location.href = response.url
    } catch (error) {
      console.error(error)
      setError(t("orderDetails.paymentError"))
      setPaymentLoading(false)
    }
  }

  if (loading) {
    return <Loading />
  }

  if (!order) {
    return (
      <main className="container py-5">
        <div className="alert alert-danger">
          {error || t("orderDetails.orderNotFound")}
        </div>

        <Link to="/orders" className="btn btn-dark">
          <ArrowLeft size={17} className="me-1" />
          {t("orderDetails.backToOrders")}
        </Link>
      </main>
    )
  }

  const subtotal = items.reduce(
    (total, item) => total + item.orderItem.unitPrice * item.orderItem.quantity,
    0,
  )

  const statusOrder = ["PAID", "PREPARING", "SHIPPED", "DELIVERED"]

  const currentStatusIndex = statusOrder.indexOf(order.orderStatus)

  const isCancelled = order.orderStatus === "CANCELLED"

  return (
    <main className="container py-5">
      {/* HEADER */}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <Link
            to="/orders"
            className="text-decoration-none text-dark d-inline-flex align-items-center mb-3"
          >
            <ArrowLeft size={17} className="me-1" />
            {t("orderDetails.backToOrders")}
          </Link>

          <h1 className="mb-1">{t("orderDetails.title")}</h1>

          <p className="text-muted mb-0 text-break">#{order.id}</p>
        </div>

        <span
          className={`badge fs-6 ${
            order.orderStatus === "PAID"
              ? "text-bg-success"
              : order.orderStatus === "CANCELLED"
                ? "text-bg-danger"
                : "text-bg-secondary"
          }`}
        >
          {order.orderStatus}
        </span>
        {order.orderStatus === "PENDING_PAYMENT" && (
          <button
            type="button"
            className="btn btn-dark"
            onClick={handlePayment}
            disabled={paymentLoading}
          >
            {paymentLoading
              ? t("orderDetails.paymentLoading")
              : t("orderDetails.payNow")}
          </button>
        )}
      </div>

      {/* DATE */}

      <p className="text-muted mb-4">
        {t("orderDetails.orderDate")}:{" "}
        {new Date(order.createdAt).toLocaleString()}
      </p>

      {/* TIMELINE */}

      {!isCancelled && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <h2 className="h5 mb-4">{t("orderDetails.status")}</h2>

            <div className="row text-center">
              {statusOrder.map((status, index) => {
                const completed = currentStatusIndex >= index

                return (
                  <div key={status} className="col">
                    <div
                      className={`rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center ${
                        completed
                          ? "bg-success text-white"
                          : "bg-light text-muted"
                      }`}
                      style={{
                        width: "40px",
                        height: "40px",
                      }}
                    >
                      {completed ? <Check size={19} /> : index + 1}
                    </div>

                    <small className={completed ? "fw-semibold" : "text-muted"}>
                      {t(`orderStatus.${status}`)}
                    </small>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* CANCELLED */}

      {isCancelled && (
        <div className="alert alert-danger mb-4">
          {t("orderDetails.cancelled")}
        </div>
      )}

      <div className="row g-4">
        {/* PRODUCTS */}

        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h2 className="h5 mb-4">
                <Package size={20} className="me-2" />
                {t("orderDetails.products")}
              </h2>

              <div className="d-flex flex-column gap-4">
                {items.map(({ orderItem, flavor, tub }) => (
                  <div
                    key={orderItem.id}
                    className="row align-items-center g-3"
                  >
                    {/* IMAGE */}

                    <div className="col-3 col-sm-2">
                      {flavor.image && (
                        <img
                          src={flavor.image}
                          alt={flavor.name}
                          className="img-fluid rounded"
                          style={{
                            height: "75px",
                            width: "75px",
                            objectFit: "cover",
                          }}
                        />
                      )}
                    </div>

                    {/* INFO */}

                    <div className="col-6 col-sm-7">
                      <h3 className="h6 mb-1">{flavor.name}</h3>

                      <p className="text-muted mb-1">
                        {t("orderDetails.tubSize")}: {tub.weight} g
                      </p>

                      <small className="text-muted">
                        {t("orderDetails.quantity")}: {orderItem.quantity}
                      </small>
                    </div>

                    {/* PRICE */}

                    <div className="col-3 col-sm-3 text-end">
                      <strong>
                        €{(orderItem.unitPrice * orderItem.quantity).toFixed(2)}
                      </strong>

                      <small className="d-block text-muted">
                        €{orderItem.unitPrice.toFixed(2)} /{" "}
                        {t("orderDetails.unit")}
                      </small>
                    </div>
                  </div>
                ))}
              </div>

              <hr className="my-4" />

              {/* TOTALS */}

              <div className="d-flex justify-content-between mb-2">
                <span>{t("orderDetails.subtotal")}</span>

                <span>€ {subtotal.toFixed(2)}</span>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span>{t("orderDetails.shipping")}</span>

                <span>
                  {order.shippingCost === 0
                    ? t("orderDetails.free")
                    : `€ ${order.shippingCost.toFixed(2)}`}
                </span>
              </div>

              <hr />

              <div className="d-flex justify-content-between">
                <strong>{t("orderDetails.total")}</strong>

                <strong className="fs-5">€ {order.total.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}

        <div className="col-12 col-lg-4">
          {/* ADDRESS */}

          {order.address && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h2 className="h5 mb-3">
                  <MapPin size={19} className="me-2" />
                  {t("orderDetails.address")}
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
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h2 className="h5 mb-3">{t("orderDetails.notes")}</h2>

                <p className="text-muted mb-0">{order.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default OrderDetails
