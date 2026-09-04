import {
  ArrowLeft,
  Mail,
  Phone,
  UserRound,
  ShoppingBag,
  Euro,
  CalendarDays,
  ExternalLink,
  Pencil,
  Save,
  X,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import {
  getUserById,
  updateUserByAdmin,
  type AdminUser,
  type AdminUserUpdateData,
} from "../../services/userApi"
import { getAllOrders } from "../../services/orderApi"
import type { Order } from "../../types/Order"
import "../../styles/AdminCustomerDetails.css"

function AdminCustomerDetails() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState("")
  const [editForm, setEditForm] = useState<AdminUserUpdateData | null>(null)

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

  const validOrders = useMemo(() => {
    return orders.filter((order) => order.orderStatus !== "CART")
  }, [orders])

  const totalSpent = useMemo(() => {
    return validOrders.reduce((total, order) => {
      return total + order.total
    }, 0)
  }, [validOrders])

  const averageOrderValue = useMemo(() => {
    if (validOrders.length === 0) {
      return 0
    }

    return totalSpent / validOrders.length
  }, [validOrders, totalSpent])

  const lastOrder = validOrders.length > 0 ? validOrders[0] : null

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const startEditing = () => {
    if (!user) return

    setEditError("")

    setEditForm({
      name: user.name,
      surname: user.surname,
      email: user.email,
      phone: user.phone || "",
      language: user.language,
      role: user.role,
      enabled: user.enabled,
    })

    setEditing(true)
  }

  const cancelEditing = () => {
    setEditing(false)
    setEditError("")
    setEditForm(null)
  }

  const handleSave = async () => {
    if (!id || !editForm || !user) return

    const roleChanged = editForm.role !== user.role
    const promotingToAdmin = editForm.role === "ADMIN"

    if (roleChanged && promotingToAdmin) {
      const confirmed = window.confirm(
        t("admin.customers.details.adminRoleWarning"),
      )

      if (!confirmed) {
        return
      }
    }

    try {
      setSaving(true)
      setEditError("")

      const updatedUser = await updateUserByAdmin(id, editForm)

      setUser({
        ...updatedUser,
        createdAt: user.createdAt,
      })

      setEditing(false)
      setEditForm(null)
    } catch (error) {
      console.error(error)

      setEditError(t("admin.customers.details.updateError"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-customer-details-loading">
        {t("common.loading")}
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="admin-customer-details-page">
        <button
          type="button"
          className="admin-customer-details-back-button"
          onClick={() => navigate("/admin/customers")}
        >
          <ArrowLeft size={17} />
          {t("admin.customers.details.back")}
        </button>

        <div className="admin-customer-details-error">
          {error || t("admin.customers.details.notFound")}
        </div>
      </div>
    )
  }

  return (
    <div className="admin-customer-details-page">
      <div className="admin-customer-details-header">
        <button
          type="button"
          className="admin-customer-details-back-button"
          onClick={() => navigate("/admin/customers")}
        >
          <ArrowLeft size={17} />
        </button>

        <div className="admin-customer-details-header-info">
          <h1>
            {user.name} {user.surname}
          </h1>

          <p>{t("admin.customers.details.subtitle")}</p>
        </div>

        {!editing && (
          <button
            type="button"
            className="admin-customer-details-primary-button"
            onClick={startEditing}
          >
            <Pencil size={17} />
            {t("admin.customers.details.edit")}
          </button>
        )}
      </div>

      <div className="admin-customer-details-stats">
        <div className="admin-customer-details-stat-card">
          <div>
            <span>{t("admin.customers.details.totalOrders")}</span>

            <strong>{validOrders.length}</strong>
          </div>

          <div className="admin-customer-details-stat-icon">
            <ShoppingBag size={25} />
          </div>
        </div>

        <div className="admin-customer-details-stat-card">
          <div>
            <span>{t("admin.customers.details.totalSpent")}</span>

            <strong>{formatCurrency(totalSpent)}</strong>
          </div>

          <div className="admin-customer-details-stat-icon">
            <Euro size={25} />
          </div>
        </div>

        <div className="admin-customer-details-stat-card">
          <div>
            <span>{t("admin.customers.details.averageOrder")}</span>

            <strong>{formatCurrency(averageOrderValue)}</strong>
          </div>

          <div className="admin-customer-details-stat-icon">
            <Euro size={25} />
          </div>
        </div>

        <div className="admin-customer-details-stat-card">
          <div>
            <span>{t("admin.customers.details.lastOrder")}</span>

            <strong>{lastOrder ? formatDate(lastOrder.createdAt) : "—"}</strong>
          </div>

          <div className="admin-customer-details-stat-icon">
            <CalendarDays size={25} />
          </div>
        </div>
      </div>

      <div className="admin-customer-details-content">
        <div className="admin-customer-details-card customer-card">
          <div className="admin-customer-details-card-header">
            <div className="admin-customer-details-profile">
              <div className="admin-customer-details-avatar">
                <UserRound size={27} />
              </div>

              <div>
                <h2>
                  {user.name} {user.surname}
                </h2>

                <span>
                  {user.role === "ADMIN"
                    ? t("admin.customers.admin")
                    : t("admin.customers.user")}
                </span>
              </div>
            </div>

            {editing && (
              <div className="admin-customer-details-edit-actions">
                <button
                  type="button"
                  className="admin-customer-details-icon-button cancel"
                  onClick={cancelEditing}
                  disabled={saving}
                >
                  <X size={15} />
                </button>

                <button
                  type="button"
                  className="admin-customer-details-icon-button save"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save size={15} />
                </button>
              </div>
            )}
          </div>

          {editError && (
            <div className="admin-customer-details-error">{editError}</div>
          )}

          {editing && editForm ? (
            <div className="admin-customer-details-form">
              <div className="admin-customer-details-form-field">
                <label>{t("admin.customers.name")}</label>

                <input
                  type="text"
                  value={editForm.name}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      name: event.target.value,
                    })
                  }
                />
              </div>

              <div className="admin-customer-details-form-field">
                <label>{t("admin.customers.surname")}</label>

                <input
                  type="text"
                  value={editForm.surname}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      surname: event.target.value,
                    })
                  }
                />
              </div>

              <div className="admin-customer-details-form-field">
                <label>{t("admin.customers.email")}</label>

                <input
                  type="email"
                  value={editForm.email}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      email: event.target.value,
                    })
                  }
                />
              </div>

              <div className="admin-customer-details-form-field">
                <label>{t("admin.customers.phone")}</label>

                <input
                  type="tel"
                  value={editForm.phone || ""}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      phone: event.target.value,
                    })
                  }
                />
              </div>

              <div className="admin-customer-details-form-field">
                <label>{t("admin.customers.language")}</label>

                <select
                  value={editForm.language}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      language: event.target.value as "IT" | "EN" | "FR" | "DE",
                    })
                  }
                >
                  <option value="IT">Italiano</option>
                  <option value="EN">English</option>
                  <option value="FR">Français</option>
                  <option value="DE">Deutsch</option>
                </select>
              </div>

              <div className="admin-customer-details-form-field">
                <label>{t("admin.customers.role")}</label>

                <select
                  value={editForm.role}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      role: event.target.value as "USER" | "ADMIN",
                    })
                  }
                >
                  <option value="USER">{t("admin.customers.user")}</option>

                  <option value="ADMIN">{t("admin.customers.admin")}</option>
                </select>
              </div>

              <div className="admin-customer-details-form-field">
                <label>{t("admin.customers.status")}</label>

                <select
                  value={editForm.enabled ? "true" : "false"}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      enabled: event.target.value === "true",
                    })
                  }
                >
                  <option value="true">{t("admin.customers.active")}</option>

                  <option value="false">{t("admin.customers.disabled")}</option>
                </select>
              </div>

              <div className="admin-customer-details-created">
                <span>{t("admin.customers.createdAt")}</span>

                <div>
                  <CalendarDays size={16} />
                  {formatDateTime(user.createdAt)}
                </div>
              </div>
            </div>
          ) : (
            <div className="admin-customer-details-info">
              <div className="admin-customer-details-info-row">
                <div>
                  <span>{t("admin.customers.email")}</span>

                  <div className="admin-customer-details-info-value">
                    <Mail size={16} />
                    <span>{user.email}</span>
                  </div>
                </div>

                <a
                  href={`mailto:${user.email}`}
                  className="admin-customer-details-small-button"
                  title={t("admin.customers.details.sendEmail")}
                >
                  <ExternalLink size={14} />
                </a>
              </div>

              <div className="admin-customer-details-info-row">
                <div>
                  <span>{t("admin.customers.phone")}</span>

                  <div className="admin-customer-details-info-value">
                    <Phone size={16} />
                    <span>{user.phone || "—"}</span>
                  </div>
                </div>

                {user.phone && (
                  <a
                    href={`tel:${user.phone}`}
                    className="admin-customer-details-small-button"
                    title={t("admin.customers.details.call")}
                  >
                    <Phone size={14} />
                  </a>
                )}
              </div>

              <div className="admin-customer-details-info-item">
                <span>{t("admin.customers.language")}</span>

                <span className="admin-customer-details-badge neutral">
                  {user.language}
                </span>
              </div>

              <div className="admin-customer-details-info-item">
                <span>{t("admin.customers.role")}</span>

                <span className="admin-customer-details-badge neutral">
                  {user.role === "ADMIN"
                    ? t("admin.customers.admin")
                    : t("admin.customers.user")}
                </span>
              </div>

              <div className="admin-customer-details-info-item">
                <span>{t("admin.customers.status")}</span>

                {user.enabled ? (
                  <span className="admin-customer-details-badge active">
                    {t("admin.customers.active")}
                  </span>
                ) : (
                  <span className="admin-customer-details-badge disabled">
                    {t("admin.customers.disabled")}
                  </span>
                )}
              </div>

              <div className="admin-customer-details-created">
                <span>{t("admin.customers.createdAt")}</span>

                <div>
                  <CalendarDays size={16} />
                  {formatDateTime(user.createdAt)}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="admin-customer-details-card orders-card">
          <div className="admin-customer-details-card-title">
            <div>
              <h2>{t("admin.customers.details.orders")}</h2>

              <span>
                {t("admin.customers.details.ordersCount", {
                  count: validOrders.length,
                })}
              </span>
            </div>
          </div>

          {validOrders.length === 0 ? (
            <div className="admin-customer-details-empty">
              {t("admin.customers.details.noOrders")}
            </div>
          ) : (
            <div className="admin-customer-details-orders-wrapper">
              <table className="admin-customer-details-orders">
                <thead>
                  <tr>
                    <th>{t("orders.order")}</th>
                    <th>{t("orders.date")}</th>
                    <th>{t("orders.status")}</th>
                    <th>{t("orders.total")}</th>
                    <th>{t("orders.actions")}</th>
                  </tr>
                </thead>

                <tbody>
                  {validOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <span className="admin-customer-details-order-id">
                          #{order.id.slice(0, 8)}
                        </span>
                      </td>

                      <td>
                        <div>{formatDate(order.createdAt)}</div>

                        <small>{formatDateTime(order.createdAt)}</small>
                      </td>

                      <td>
                        <span className="admin-customer-details-badge neutral">
                          {t(`orderStatus.${order.orderStatus}`)}
                        </span>
                      </td>

                      <td>
                        <strong>{formatCurrency(order.total)}</strong>
                      </td>

                      <td>
                        <div className="admin-customer-details-order-action">
                          <button
                            type="button"
                            className="admin-customer-details-small-button"
                            onClick={() =>
                              navigate(`/admin/orders/${order.id}`)
                            }
                          >
                            <ExternalLink size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {lastOrder && (
        <div className="admin-customer-details-last-order">
          <div>
            <h2>{t("admin.customers.details.lastOrder")}</h2>

            <span>
              #{lastOrder.id.slice(0, 8)} ·{" "}
              {formatDateTime(lastOrder.createdAt)}
            </span>
          </div>

          <div className="admin-customer-details-last-order-value">
            <strong>{formatCurrency(lastOrder.total)}</strong>

            <span className="admin-customer-details-badge neutral">
              {t(`orderStatus.${lastOrder.orderStatus}`)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCustomerDetails
