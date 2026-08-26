import { useEffect, useState } from "react"

import { Link } from "react-router-dom"

import { useTranslation } from "react-i18next"

import { ArrowRight, Package } from "lucide-react"

import { getMyOrders } from "../../services/orderApi"

import type { Order } from "../../types/Order"

import Loading from "../../components/Loading"

import "../../styles/Order.css"

function Orders() {
  const { t } = useTranslation()

  const [orders, setOrders] = useState<Order[]>([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState("")

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)

        setError("")

        const data = await getMyOrders()

        setOrders(data.content)
      } catch (error) {
        console.error(error)

        setError(t("orders.loadError"))
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [t])

  if (loading) {
    return <Loading />
  }

  const visibleOrders = orders.filter((order) => order.orderStatus !== "CART")

  const getStatusClass = (status: string) => {
    switch (status) {
      case "PAID":
        return "paid"

      case "CANCELLED":
        return "cancelled"

      case "PENDING":
        return "pending"

      default:
        return "default"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PAID":
        return t("orders.statusPaid")

      case "CANCELLED":
        return t("orders.statusCancelled")

      case "PENDING":
        return t("orders.statusPending")

      default:
        return status
    }
  }

  return (
    <main className="orders">
      <div className="container">
        {/* =================================================
            HEADER
        ================================================= */}

        <section className="orders-header">
          <div>
            <h1>{t("orders.title")}</h1>

            <p>{t("orders.description")}</p>
          </div>
        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && <div className="orders-error">{error}</div>}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!error && visibleOrders.length === 0 && (
          <div className="orders-empty">
            <div className="orders-empty-icon">
              <Package size={34} />
            </div>

            <h2>{t("orders.empty")}</h2>

            <p>{t("orders.emptyMessage")}</p>

            <Link to="/catalog" className="orders-empty-button">
              {t("orders.goToCatalog")}

              <ArrowRight size={17} />
            </Link>
          </div>
        )}

        {/* =================================================
            ORDERS
        ================================================= */}

        {!error && visibleOrders.length > 0 && (
          <div className="orders-list">
            {visibleOrders.map((order) => {
              const orderDate = new Date(order.createdAt).toLocaleDateString(
                undefined,
                {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                },
              )

              const statusClass = getStatusClass(order.orderStatus)

              const statusLabel = getStatusLabel(order.orderStatus)

              return (
                <article key={order.id} className="order-card">
                  {/* ICON */}

                  <div className="order-icon">
                    <Package size={24} />
                  </div>

                  {/* MAIN INFO */}

                  <div className="order-main">
                    <div className="order-heading">
                      <div>
                        <span className="order-label">{t("orders.order")}</span>

                        <h2>#{order.id.slice(0, 8)}</h2>
                      </div>

                      <span className={`order-status ${statusClass}`}>
                        <span />

                        {statusLabel}
                      </span>
                    </div>

                    <span className="order-date">{orderDate}</span>
                  </div>

                  {/* TOTAL */}

                  <div className="order-total">
                    <span>{t("orders.total")}</span>

                    <strong>€ {order.total.toFixed(2)}</strong>
                  </div>

                  {/* DETAILS */}

                  <Link
                    to={`/orders/${order.id}`}
                    className="order-details"
                    aria-label={`${t("orders.details")} ${order.id}`}
                  >
                    <span>{t("orders.details")}</span>

                    <ArrowRight size={17} />
                  </Link>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

export default Orders
