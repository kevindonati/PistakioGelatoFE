import { ArrowLeft, Mail, Phone, UserRound } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"

import { getUserById, type AdminUser } from "../../services/userApi"
import { getAllOrders } from "../../services/orderApi"
import type { Order } from "../../types/Order"

function AdminCustomerDetails() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()

  const [user, setUser] = useState<AdminUser | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadCustomer = async () => {
      if (!id) return

      try {
        setLoading(true)
        setError("")

        const [userData, ordersData] = await Promise.all([
          getUserById(id),
          getAllOrders({
            userId: id,
            page: 0,
            size: 50,
            direction: "desc",
          }),
        ])

        setUser(userData)
        setOrders(ordersData.content)
      } catch (error) {
        console.error(error)
        setError(t("admin.customers.details.loadError"))
      } finally {
        setLoading(false)
      }
    }

    loadCustomer()
  }, [id, t])

  if (loading) {
    return <div className="text-center py-5">{t("common.loading")}</div>
  }

  if (error || !user) {
    return (
      <div>
        <button
          type="button"
          className="btn btn-outline-secondary mb-4"
          onClick={() => navigate("/admin/customers")}
        >
          <ArrowLeft size={17} className="me-2" />
          {t("admin.customers.details.back")}
        </button>

        <div className="alert alert-danger">
          {error || t("admin.customers.details.notFound")}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* HEADER */}

      <div className="d-flex align-items-center gap-3 mb-4">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => navigate("/admin/customers")}
        >
          <ArrowLeft size={17} />
        </button>

        <div>
          <h1 className="mb-1">
            {user.name} {user.surname}
          </h1>

          <p className="text-muted mb-0">
            {t("admin.customers.details.subtitle")}
          </p>
        </div>
      </div>

      <div className="row g-4">
        {/* DATI CLIENTE */}

        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle bg-light"
                  style={{
                    width: 60,
                    height: 60,
                  }}
                >
                  <UserRound size={27} />
                </div>

                <div>
                  <h4 className="mb-1">
                    {user.name} {user.surname}
                  </h4>

                  <span className="text-muted">
                    {user.role === "ADMIN"
                      ? t("admin.customers.admin")
                      : t("admin.customers.user")}
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <div className="text-muted small mb-1">
                  {t("admin.customers.email")}
                </div>

                <div className="d-flex align-items-center gap-2">
                  <Mail size={16} />
                  <span>{user.email}</span>
                </div>
              </div>

              <div className="mb-3">
                <div className="text-muted small mb-1">
                  {t("admin.customers.phone")}
                </div>

                <div className="d-flex align-items-center gap-2">
                  <Phone size={16} />
                  <span>{user.phone || "—"}</span>
                </div>
              </div>

              <div className="mb-3">
                <div className="text-muted small mb-1">
                  {t("admin.customers.language")}
                </div>

                <span className="badge text-bg-light">{user.language}</span>
              </div>

              <div>
                <div className="text-muted small mb-1">
                  {t("admin.customers.status")}
                </div>

                {user.enabled ? (
                  <span className="badge text-bg-success">
                    {t("admin.customers.active")}
                  </span>
                ) : (
                  <span className="badge text-bg-secondary">
                    {t("admin.customers.disabled")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ORDINI */}

        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h4 className="mb-1">
                    {t("admin.customers.details.orders")}
                  </h4>

                  <span className="text-muted small">
                    {t("admin.customers.details.ordersCount", {
                      count: orders.length,
                    })}
                  </span>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="text-center text-muted py-5">
                  {t("admin.customers.details.noOrders")}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>{t("orders.order")}</th>

                        <th>{t("orders.date")}</th>

                        <th>{t("orders.total")}</th>

                        <th>{t("orders.status")}</th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order.id}
                          role="button"
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                        >
                          <td>
                            <span className="fw-semibold">
                              #{order.id.slice(0, 8)}
                            </span>
                          </td>

                          <td>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>

                          <td>{order.total.toFixed(2)} €</td>

                          <td>
                            <span className="badge text-bg-light">
                              {t(`orderStatus.${order.orderStatus}`)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminCustomerDetails
