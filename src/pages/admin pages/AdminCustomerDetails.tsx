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

        <div className="flex-grow-1">
          <h1 className="mb-1">
            {user.name} {user.surname}
          </h1>

          <p className="text-muted mb-0">
            {t("admin.customers.details.subtitle")}
          </p>
        </div>

        {!editing && (
          <button type="button" className="btn btn-dark" onClick={startEditing}>
            <Pencil size={17} className="me-2" />
            {t("admin.customers.details.edit")}
          </button>
        )}
      </div>

      {/* RIEPILOGO */}

      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small mb-1">
                    {t("admin.customers.details.totalOrders")}
                  </div>

                  <h3 className="mb-0">{validOrders.length}</h3>
                </div>

                <ShoppingBag size={28} className="text-muted" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small mb-1">
                    {t("admin.customers.details.totalSpent")}
                  </div>

                  <h3 className="mb-0">{formatCurrency(totalSpent)}</h3>
                </div>

                <Euro size={28} className="text-muted" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small mb-1">
                    {t("admin.customers.details.averageOrder")}
                  </div>

                  <h3 className="mb-0">{formatCurrency(averageOrderValue)}</h3>
                </div>

                <Euro size={28} className="text-muted" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small mb-1">
                    {t("admin.customers.details.lastOrder")}
                  </div>

                  <h3 className="mb-0">
                    {lastOrder ? formatDate(lastOrder.createdAt) : "—"}
                  </h3>
                </div>

                <CalendarDays size={28} className="text-muted" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* DATI CLIENTE */}

        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center gap-3">
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

                {editing && (
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={cancelEditing}
                      disabled={saving}
                    >
                      <X size={15} />
                    </button>

                    <button
                      type="button"
                      className="btn btn-sm btn-dark"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      <Save size={15} />
                    </button>
                  </div>
                )}
              </div>

              {editError && (
                <div className="alert alert-danger">{editError}</div>
              )}

              {editing && editForm ? (
                <>
                  <div className="mb-3">
                    <label className="form-label">
                      {t("admin.customers.name")}
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={editForm.name}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          name: event.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      {t("admin.customers.surname")}
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={editForm.surname}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          surname: event.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      {t("admin.customers.email")}
                    </label>

                    <input
                      type="email"
                      className="form-control"
                      value={editForm.email}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          email: event.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      {t("admin.customers.phone")}
                    </label>

                    <input
                      type="tel"
                      className="form-control"
                      value={editForm.phone || ""}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          phone: event.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      {t("admin.customers.language")}
                    </label>

                    <select
                      className="form-select"
                      value={editForm.language}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          language: event.target.value as
                            | "IT"
                            | "EN"
                            | "FR"
                            | "DE",
                        })
                      }
                    >
                      <option value="IT">Italiano</option>

                      <option value="EN">English</option>

                      <option value="FR">Français</option>

                      <option value="DE">Deutsch</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      {t("admin.customers.role")}
                    </label>

                    <select
                      className="form-select"
                      value={editForm.role}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          role: event.target.value as "USER" | "ADMIN",
                        })
                      }
                    >
                      <option value="USER">{t("admin.customers.user")}</option>

                      <option value="ADMIN">
                        {t("admin.customers.admin")}
                      </option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      {t("admin.customers.status")}
                    </label>

                    <select
                      className="form-select"
                      value={editForm.enabled ? "true" : "false"}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          enabled: event.target.value === "true",
                        })
                      }
                    >
                      <option value="true">
                        {t("admin.customers.active")}
                      </option>

                      <option value="false">
                        {t("admin.customers.disabled")}
                      </option>
                    </select>
                  </div>

                  <div>
                    <div className="text-muted small mb-1">
                      {t("admin.customers.createdAt")}
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <CalendarDays size={16} />

                      <span>{formatDateTime(user.createdAt)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-3">
                    <div className="text-muted small mb-1">
                      {t("admin.customers.email")}
                    </div>

                    <div className="d-flex align-items-center justify-content-between gap-2">
                      <div className="d-flex align-items-center gap-2 text-break">
                        <Mail size={16} />

                        <span>{user.email}</span>
                      </div>

                      <a
                        href={`mailto:${user.email}`}
                        className="btn btn-sm btn-outline-secondary"
                        title={t("admin.customers.details.sendEmail")}
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-muted small mb-1">
                      {t("admin.customers.phone")}
                    </div>

                    <div className="d-flex align-items-center justify-content-between gap-2">
                      <div className="d-flex align-items-center gap-2">
                        <Phone size={16} />

                        <span>{user.phone || "—"}</span>
                      </div>

                      {user.phone && (
                        <a
                          href={`tel:${user.phone}`}
                          className="btn btn-sm btn-outline-secondary"
                          title={t("admin.customers.details.call")}
                        >
                          <Phone size={14} />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-muted small mb-1">
                      {t("admin.customers.language")}
                    </div>

                    <span className="badge text-bg-light">{user.language}</span>
                  </div>

                  <div className="mb-3">
                    <div className="text-muted small mb-1">
                      {t("admin.customers.role")}
                    </div>

                    <span className="badge text-bg-light">
                      {user.role === "ADMIN"
                        ? t("admin.customers.admin")
                        : t("admin.customers.user")}
                    </span>
                  </div>

                  <div className="mb-3">
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

                  <div>
                    <div className="text-muted small mb-1">
                      {t("admin.customers.createdAt")}
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <CalendarDays size={16} />

                      <span>{formatDateTime(user.createdAt)}</span>
                    </div>
                  </div>
                </>
              )}
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
                      count: validOrders.length,
                    })}
                  </span>
                </div>
              </div>

              {validOrders.length === 0 ? (
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

                        <th>{t("orders.status")}</th>

                        <th>{t("orders.total")}</th>

                        <th className="text-end">{t("orders.actions")}</th>
                      </tr>
                    </thead>

                    <tbody>
                      {validOrders.map((order) => (
                        <tr key={order.id}>
                          <td>
                            <span className="fw-semibold">
                              #{order.id.slice(0, 8)}
                            </span>
                          </td>

                          <td>
                            <div>{formatDate(order.createdAt)}</div>

                            <small className="text-muted">
                              {formatDateTime(order.createdAt)}
                            </small>
                          </td>

                          <td>
                            <span className="badge text-bg-light">
                              {t(`orderStatus.${order.orderStatus}`)}
                            </span>
                          </td>

                          <td className="fw-semibold">
                            {formatCurrency(order.total)}
                          </td>

                          <td className="text-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() =>
                                navigate(`/admin/orders/${order.id}`)
                              }
                            >
                              <ExternalLink size={14} />
                            </button>
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

      {/* ULTIMO ORDINE */}

      {lastOrder && (
        <div className="card border-0 shadow-sm mt-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-1">
                  {t("admin.customers.details.lastOrder")}
                </h4>

                <span className="text-muted small">
                  #{lastOrder.id.slice(0, 8)} ·{" "}
                  {formatDateTime(lastOrder.createdAt)}
                </span>
              </div>

              <div className="text-end">
                <div className="fw-semibold fs-5">
                  {formatCurrency(lastOrder.total)}
                </div>

                <span className="badge text-bg-light">
                  {t(`orderStatus.${lastOrder.orderStatus}`)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCustomerDetails
