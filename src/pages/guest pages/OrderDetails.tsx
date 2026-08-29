import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  ArrowLeft,
  Check,
  CreditCard,
  FileText,
  MapPin,
  Package,
  Wallet,
} from "lucide-react"
import {
  createStripeCheckout,
  createPaypalOrder,
  getMyOrderById,
  getMyOrderItems,
} from "../../services/orderApi"
import { getFlavorById, getTubById } from "../../services/catalogApi"
import type { Order } from "../../types/Order"
import type { OrderItem } from "../../types/OrderItem"
import type { Flavor } from "../../types/Flavor"
import type { Tub } from "../../types/Tub"
import Loading from "../../components/Loading"
import "../../styles/OrderDetails.css"

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

  const handlePayment = async (method: "STRIPE" | "PAYPAL") => {
    if (!order) {
      return
    }

    try {
      setPaymentLoading(true)
      setError("")

      if (method === "STRIPE") {
        const response = await createStripeCheckout(order.id)

        window.location.href = response.url

        return
      }

      const response = await createPaypalOrder(order.id)

      window.location.href = response.approvalUrl
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
      <main className="pistakio-order-error-page">
        <div className="container">
          <div className="pistakio-order-error-content">
            <div className="pistakio-order-error-icon">
              <Package size={32} />
            </div>

            <h1>{t("orderDetails.orderNotFound")}</h1>

            <p>{error || t("orderDetails.orderNotFound")}</p>

            <Link to="/orders" className="pistakio-order-error-button">
              <ArrowLeft size={17} />

              {t("orderDetails.backToOrders")}
            </Link>
          </div>
        </div>
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
  const getStatusLabel = (status: string) => {
    return t(`orderStatus.${status}`)
  }

  return (
    <main className="pistakio-order-details">
      <div className="container">
        {/* HEADER */}

        <section className="pistakio-order-header">
          <div>
            <Link to="/orders" className="pistakio-order-back">
              <ArrowLeft size={17} />

              {t("orderDetails.backToOrders")}
            </Link>

            <h1>{t("orderDetails.title")}</h1>

            <p className="pistakio-order-id">#{order.id}</p>
          </div>

          <div className="pistakio-order-header-actions">
            <span
              className={`pistakio-order-status-large ${
                isCancelled
                  ? "pistakio-order-status-cancelled"
                  : order.orderStatus === "PAID"
                    ? "pistakio-order-status-paid"
                    : "pistakio-order-status-pending"
              }`}
            >
              <span />

              {getStatusLabel(order.orderStatus)}
            </span>

            {order.orderStatus === "PENDING_PAYMENT" && (
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="pistakio-order-pay-button"
                  onClick={() => handlePayment("STRIPE")}
                  disabled={paymentLoading}
                >
                  <CreditCard size={18} />

                  {paymentLoading
                    ? t("orderDetails.paymentLoading")
                    : t("orderDetails.payWithStripe")}
                </button>

                <button
                  type="button"
                  className="pistakio-order-pay-button"
                  onClick={() => handlePayment("PAYPAL")}
                  disabled={paymentLoading}
                >
                  <Wallet size={18} />

                  {paymentLoading
                    ? t("orderDetails.paymentLoading")
                    : t("orderDetails.payWithPaypal")}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ERROR */}

        {error && <div className="pistakio-order-error-message">{error}</div>}

        {/* DATE */}

        <div className="pistakio-order-date">
          <span>{t("orderDetails.orderDate")}</span>

          <strong>{new Date(order.createdAt).toLocaleString()}</strong>
        </div>

        {/* TIMELINE */}

        {!isCancelled && (
          <section className="pistakio-order-timeline">
            <div className="pistakio-order-section-heading">
              <div className="pistakio-order-section-icon">
                <Package size={19} />
              </div>

              <h2>{t("orderDetails.status")}</h2>
            </div>

            <div className="pistakio-order-timeline-list">
              {statusOrder.map((status, index) => {
                const completed = currentStatusIndex >= index

                const active = currentStatusIndex === index

                return (
                  <div
                    key={status}
                    className={`pistakio-order-timeline-step ${
                      completed ? "pistakio-order-timeline-completed" : ""
                    } ${active ? "pistakio-order-timeline-active" : ""}`}
                  >
                    <div className="pistakio-order-timeline-marker">
                      {completed ? <Check size={16} /> : index + 1}
                    </div>

                    <span>{getStatusLabel(status)}</span>

                    {index < statusOrder.length - 1 && (
                      <div
                        className={`pistakio-order-timeline-line ${
                          currentStatusIndex > index
                            ? "pistakio-order-timeline-line-completed"
                            : ""
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* CANCELLED */}

        {isCancelled && (
          <div className="pistakio-order-cancelled">
            <strong>{t("orderDetails.cancelled")}</strong>
          </div>
        )}

        {/* CONTENT */}

        <div className="pistakio-order-grid">
          {/* PRODUCTS */}

          <section className="pistakio-order-products">
            <div className="pistakio-order-section-heading">
              <div className="pistakio-order-section-icon">
                <Package size={19} />
              </div>

              <div>
                <h2>{t("orderDetails.products")}</h2>

                <span>
                  {items.length}{" "}
                  {items.length === 1
                    ? t("orderDetails.product")
                    : t("orderDetails.productsCount")}
                </span>
              </div>
            </div>

            <div className="pistakio-order-product-list">
              {items.map(({ orderItem, flavor, tub }) => {
                const itemTotal = orderItem.unitPrice * orderItem.quantity

                return (
                  <div key={orderItem.id} className="pistakio-order-product">
                    <div className="pistakio-order-product-image">
                      {flavor.image ? (
                        <img src={flavor.image} alt={flavor.name} />
                      ) : (
                        <Package size={25} />
                      )}
                    </div>

                    <div className="pistakio-order-product-info">
                      <h3>{flavor.name}</h3>

                      <span>
                        {t("orderDetails.tubSize")}: {tub.weight} g
                      </span>

                      <span>
                        {t("orderDetails.quantity")}: {orderItem.quantity}
                      </span>
                    </div>

                    <div className="pistakio-order-product-price">
                      <strong>€ {itemTotal.toFixed(2)}</strong>

                      <span>
                        € {orderItem.unitPrice.toFixed(2)} /{" "}
                        {t("orderDetails.unit")}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* TOTALS */}

            <div className="pistakio-order-totals">
              <div>
                <span>{t("orderDetails.subtotal")}</span>

                <strong>€ {subtotal.toFixed(2)}</strong>
              </div>

              <div>
                <span>{t("orderDetails.shipping")}</span>

                <strong>
                  {order.shippingCost === 0
                    ? t("orderDetails.free")
                    : `€ ${order.shippingCost.toFixed(2)}`}
                </strong>
              </div>

              <div className="pistakio-order-grand-total">
                <span>{t("orderDetails.total")}</span>

                <strong>€ {order.total.toFixed(2)}</strong>
              </div>
            </div>
          </section>

          {/* SIDEBAR */}

          <aside className="pistakio-order-sidebar">
            {/* ADDRESS */}

            {order.address && (
              <section className="pistakio-order-info-card">
                <div className="pistakio-order-section-heading">
                  <div className="pistakio-order-section-icon">
                    <MapPin size={19} />
                  </div>

                  <h2>{t("orderDetails.address")}</h2>
                </div>

                <div className="pistakio-order-address">
                  <div>{order.address.addressLine1}</div>

                  {order.address.addressLine2 && (
                    <div>{order.address.addressLine2}</div>
                  )}

                  <div>
                    {order.address.postalCode} {order.address.city}
                  </div>

                  <div>{order.address.country}</div>
                </div>
              </section>
            )}

            {/* NOTES */}

            {order.notes && (
              <section className="pistakio-order-info-card">
                <div className="pistakio-order-section-heading">
                  <div className="pistakio-order-section-icon">
                    <FileText size={19} />
                  </div>

                  <h2>{t("orderDetails.notes")}</h2>
                </div>

                <p className="pistakio-order-notes">{order.notes}</p>
              </section>
            )}
          </aside>
        </div>
      </div>
    </main>
  )
}

export default OrderDetails
