import { useEffect, useState } from "react"

import { Link, useSearchParams } from "react-router-dom"

import { useTranslation } from "react-i18next"

import {
  ArrowRight,
  Check,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react"

import {
  getOrderById,
  getOrderItems,
  capturePaypalPayment,
} from "../../services/orderApi"

import { getFlavorById, getTubById } from "../../services/catalogApi"

import type { Order } from "../../types/Order"
import type { OrderItem } from "../../types/OrderItem"
import type { Flavor } from "../../types/Flavor"
import type { Tub } from "../../types/Tub"

import Loading from "../../components/Loading"

import "../../styles/PaymentSuccess.css"

interface PaymentItem {
  orderItem: OrderItem
  flavor: Flavor
  tub: Tub
}

function PaymentSuccess() {
  const { t } = useTranslation()

  const [searchParams] = useSearchParams()

  const orderId = searchParams.get("orderId")

  /*
   * PayPal aggiunge automaticamente il parametro "token"
   * alla success URL.
   *
   * Il token corrisponde al PayPal Order ID.
   */
  const paypalOrderId = searchParams.get("token")

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
    let paypalCaptureAttempted = false

    const loadPaymentSuccess = async () => {
      try {
        setLoading(true)
        setError("")

        /*
         * Recuperiamo l'ordine.
         */
        const orderData = await getOrderById(orderId)

        if (cancelled) {
          return
        }

        /*
         * =========================================
         * PAYPAL CAPTURE
         * =========================================
         *
         * Se nella URL c'è "token", significa che
         * PayPal ci ha riportato dopo il pagamento.
         *
         * Il token è il PayPal Order ID.
         *
         * Facciamo la capture una sola volta.
         */

        if (
          paypalOrderId &&
          !paypalCaptureAttempted &&
          orderData.orderStatus === "PENDING_PAYMENT"
        ) {
          paypalCaptureAttempted = true

          try {
            await capturePaypalPayment(paypalOrderId)

            if (cancelled) {
              return
            }

            /*
             * Dopo la capture ricarichiamo l'ordine
             * per ottenere lo stato PAID.
             */

            const updatedOrder = await getOrderById(orderId)

            if (cancelled) {
              return
            }

            if (updatedOrder.orderStatus !== "PAID") {
              setError(t("paymentSuccess.paymentPending"))
            }

            setOrder(updatedOrder)
          } catch (error) {
            console.error("Errore capture PayPal:", error)

            setError(t("paymentSuccess.loadError"))

            /*
             * Non interrompiamo completamente il caricamento:
             * mostriamo comunque i dati dell'ordine.
             */

            setOrder(orderData)
          }
        } else {
          /*
           * Stripe:
           * il webhook aggiorna il pagamento e l'ordine.
           *
           * Quindi continuiamo ad aspettare PAID.
           */

          if (orderData.orderStatus !== "PAID" && attempts < 5) {
            attempts++

            setTimeout(loadPaymentSuccess, 1000)

            return
          }

          setOrder(orderData)

          if (orderData.orderStatus !== "PAID") {
            setError(t("paymentSuccess.paymentPending"))
          }
        }

        /*
         * =========================================
         * ORDER ITEMS
         * =========================================
         */

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

        setItems(completeItems)

        /*
         * Se non abbiamo già impostato l'ordine
         * durante la capture PayPal, lo impostiamo qui.
         */

        if (!paypalOrderId) {
          setOrder(orderData)
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
  }, [orderId, paypalOrderId, t])

  /*
   * =========================================
   * LOADING
   * =========================================
   */

  if (loading) {
    return <Loading />
  }

  /*
   * =========================================
   * ORDER NOT FOUND
   * =========================================
   */

  if (!order) {
    return (
      <main className="pistakio-payment">
        <div className="container">
          <div className="pistakio-payment-error">
            <div className="pistakio-payment-error-icon">
              <Package size={28} />
            </div>

            <h1>{t("paymentSuccess.orderNotFound")}</h1>

            <p>{error || t("paymentSuccess.loadError")}</p>

            <Link to="/catalog" className="pistakio-payment-primary-button">
              {t("paymentSuccess.backToCatalog")}

              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const isPaid = order.orderStatus === "PAID"

  /*
   * =========================================
   * TOTALS
   * =========================================
   */

  const subtotal = items.reduce(
    (total, item) => total + item.orderItem.unitPrice * item.orderItem.quantity,
    0,
  )

  const orderDate = new Date(order.createdAt).toLocaleString()

  return (
    <main className="pistakio-payment">
      <div className="container">
        <div className="pistakio-payment-wrapper">
          {/* =========================================
              SUCCESS HEADER
          ========================================= */}

          <section
            className={`pistakio-payment-hero ${
              isPaid ? "is-success" : "is-pending"
            }`}
          >
            <div className="pistakio-payment-check">
              {isPaid ? <Check size={40} /> : <Package size={38} />}
            </div>

            <h1>
              {isPaid
                ? t("paymentSuccess.title")
                : t("paymentSuccess.paymentPending")}
            </h1>

            <p>
              {isPaid
                ? t("paymentSuccess.message")
                : t("paymentSuccess.pendingMessage")}
            </p>
          </section>

          {/* =========================================
              PENDING WARNING
          ========================================= */}

          {!isPaid && error && (
            <div className="pistakio-payment-pending-alert">{error}</div>
          )}

          {/* =========================================
              ORDER INFO
          ========================================= */}

          <section className="pistakio-payment-card">
            <div className="pistakio-payment-card-header">
              <div className="pistakio-payment-section-icon">
                <Package size={20} />
              </div>

              <div>
                <h2>{t("paymentSuccess.order")}</h2>

                <p>
                  {t("paymentSuccess.orderDate")}: {orderDate}
                </p>
              </div>

              <span
                className={`pistakio-payment-status ${
                  isPaid ? "paid" : "pending"
                }`}
              >
                {isPaid ? <Check size={14} /> : null}

                {order.orderStatus}
              </span>
            </div>

            <div className="pistakio-payment-order-id">
              <span>{t("paymentSuccess.orderId")}</span>

              <strong>{order.id}</strong>
            </div>
          </section>

          {/* =========================================
              PRODUCTS
          ========================================= */}

          <section className="pistakio-payment-card">
            <div className="pistakio-payment-card-header">
              <div className="pistakio-payment-section-icon pistakio-payment-section-icon-pink">
                <ShoppingBag size={20} />
              </div>

              <div>
                <h2>{t("paymentSuccess.products")}</h2>

                <p>
                  {items.length} {items.length === 1 ? "item" : "items"}
                </p>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="pistakio-payment-empty-products">
                {t("paymentSuccess.noProducts")}
              </div>
            ) : (
              <div className="pistakio-payment-products">
                {items.map(({ orderItem, flavor, tub }) => (
                  <div key={orderItem.id} className="pistakio-payment-product">
                    <div className="pistakio-payment-product-image">
                      {flavor.image ? (
                        <img src={flavor.image} alt={flavor.name} />
                      ) : (
                        <ShoppingBag size={22} />
                      )}
                    </div>

                    <div className="pistakio-payment-product-info">
                      <strong>{flavor.name}</strong>

                      <span>
                        {tub.weight} g × {orderItem.quantity}
                      </span>
                    </div>

                    <strong className="pistakio-payment-product-price">
                      €{(orderItem.unitPrice * orderItem.quantity).toFixed(2)}
                    </strong>
                  </div>
                ))}
              </div>
            )}

            <div className="pistakio-payment-divider" />

            {/* PRICES */}

            <div className="pistakio-payment-price-row">
              <span>{t("paymentSuccess.subtotal")}</span>

              <strong>€ {subtotal.toFixed(2)}</strong>
            </div>

            <div className="pistakio-payment-price-row">
              <span className="d-flex align-items-center gap-2">
                <Truck size={15} />

                {t("checkout.shipping")}
              </span>

              <strong>
                {order.shippingCost === 0
                  ? t("checkout.free")
                  : `€ ${order.shippingCost.toFixed(2)}`}
              </strong>
            </div>

            <div className="pistakio-payment-divider" />

            <div className="pistakio-payment-total">
              <span>{t("cart.total")}</span>

              <strong>€ {order.total.toFixed(2)}</strong>
            </div>
          </section>

          {/* =========================================
              DELIVERY ADDRESS
          ========================================= */}

          {order.address && (
            <section className="pistakio-payment-card">
              <div className="pistakio-payment-card-header">
                <div className="pistakio-payment-section-icon">
                  <MapPin size={20} />
                </div>

                <div>
                  <h2>{t("paymentSuccess.deliveryAddress")}</h2>

                  <p>{t("checkout.deliveryAddressDescription")}</p>
                </div>
              </div>

              <div className="pistakio-payment-address">
                <strong>{order.address.addressLine1}</strong>

                {order.address.addressLine2 && (
                  <span>{order.address.addressLine2}</span>
                )}

                <span>
                  {order.address.postalCode} {order.address.city}
                </span>

                <span>{order.address.country}</span>
              </div>
            </section>
          )}

          {/* =========================================
              NOTES
          ========================================= */}

          {order.notes && (
            <section className="pistakio-payment-card">
              <div className="pistakio-payment-card-header">
                <div className="pistakio-payment-section-icon pistakio-payment-section-icon-pink">
                  <Package size={20} />
                </div>

                <div>
                  <h2>{t("paymentSuccess.notes")}</h2>
                </div>
              </div>

              <p className="pistakio-payment-notes">{order.notes}</p>
            </section>
          )}

          {/* =========================================
              ACTIONS
          ========================================= */}

          <div className="pistakio-payment-actions">
            <Link to="/orders" className="pistakio-payment-primary-button">
              {t("paymentSuccess.myOrders")}

              <ArrowRight size={17} />
            </Link>

            <Link to="/catalog" className="pistakio-payment-secondary-button">
              {t("paymentSuccess.backToCatalog")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default PaymentSuccess
