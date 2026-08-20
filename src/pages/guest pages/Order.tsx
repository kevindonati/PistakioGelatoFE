import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ArrowRight, Package } from "lucide-react"

import { getMyOrders } from "../../services/orderApi"
import type { Order } from "../../types/Order"
import Loading from "../../components/Loading"

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

  return (
    <main className="container py-5">
      <h1 className="mb-4">{t("orders.title")}</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {!error && visibleOrders.length === 0 && (
        <div className="text-center py-5">
          <Package size={64} strokeWidth={1.5} className="text-muted mb-3" />

          <h2 className="h4">{t("orders.empty")}</h2>

          <p className="text-muted">{t("orders.emptyMessage")}</p>

          <Link to="/catalog" className="btn btn-dark">
            {t("orders.goToCatalog")}
          </Link>
        </div>
      )}

      <div className="d-flex flex-column gap-3">
        {visibleOrders.map((order) => {
          const orderDate = new Date(order.createdAt).toLocaleDateString()

          return (
            <div key={order.id} className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="row align-items-center g-3">
                  {/* ORDINE */}

                  <div className="col-12 col-md-5">
                    <div className="d-flex align-items-center gap-3">
                      <div>
                        <Package size={28} strokeWidth={1.5} />
                      </div>

                      <div>
                        <h2 className="h6 mb-1">{t("orders.order")}</h2>

                        <p className="mb-1 text-muted text-break">{order.id}</p>

                        <small className="text-muted">{orderDate}</small>
                      </div>
                    </div>
                  </div>

                  {/* STATO */}

                  <div className="col-6 col-md-3">
                    <small className="text-muted d-block mb-1">
                      {t("orders.status")}
                    </small>

                    <span
                      className={`badge ${
                        order.orderStatus === "PAID"
                          ? "text-bg-success"
                          : order.orderStatus === "CANCELLED"
                            ? "text-bg-danger"
                            : "text-bg-secondary"
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>

                  {/* TOTALE */}

                  <div className="col-6 col-md-2">
                    <small className="text-muted d-block mb-1">
                      {t("orders.total")}
                    </small>

                    <strong>€ {order.total.toFixed(2)}</strong>
                  </div>

                  {/* DETTAGLI */}

                  <div className="col-12 col-md-2 text-md-end">
                    <Link
                      to={`/orders/${order.id}`}
                      className="btn btn-outline-dark btn-sm"
                    >
                      {t("orders.details")}

                      <ArrowRight size={16} className="ms-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}

export default Orders
