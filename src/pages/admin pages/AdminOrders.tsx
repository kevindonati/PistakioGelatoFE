import { useEffect, useState } from "react"
import { Eye, Search, Truck } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import type { Order } from "../../types/Order"

import {
  createShipment,
  getAllOrders,
  prepareOrder,
  updateShipmentStatus,
  getAllShipments,
  type Shipment,
} from "../../services/orderApi"

import Loading from "../../components/Loading"

import "../../styles/Adminorder.css"

function AdminOrders() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [orders, setOrders] = useState<Order[]>([])
  const [shipments, setShipments] = useState<Shipment[]>([])

  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const [error, setError] = useState("")

  const [page, setPage] = useState(0)
  const [pageSize] = useState(15)

  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [direction, setDirection] = useState<"asc" | "desc">("desc")

  const [filters, setFilters] = useState({
    id: "",
    customer: "",
    status: "ALL",
    minTotal: "",
    maxTotal: "",
    dateFrom: "",
    dateTo: "",
  })

  const [appliedFilters, setAppliedFilters] = useState({
    id: "",
    customer: "",
    status: "ALL",
    minTotal: "",
    maxTotal: "",
    dateFrom: "",
    dateTo: "",
  })

  const [showShipmentModal, setShowShipmentModal] = useState(false)

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const [shipmentForm, setShipmentForm] = useState({
    carrier: "",
    trackingNumber: "",
  })

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")

      const [ordersData, shipmentsData] = await Promise.all([
        getAllOrders({
          page,
          size: pageSize,
          direction,

          id: appliedFilters.id || undefined,

          customer: appliedFilters.customer || undefined,

          status:
            appliedFilters.status === "ALL" ? undefined : appliedFilters.status,

          minTotal: appliedFilters.minTotal
            ? Number(appliedFilters.minTotal)
            : undefined,

          maxTotal: appliedFilters.maxTotal
            ? Number(appliedFilters.maxTotal)
            : undefined,

          dateFrom: appliedFilters.dateFrom || undefined,

          dateTo: appliedFilters.dateTo || undefined,
        }),

        getAllShipments(),
      ])

      setOrders(ordersData.content)
      setTotalPages(ordersData.totalPages)
      setTotalElements(ordersData.totalElements)

      setShipments(shipmentsData.content)
    } catch (error) {
      console.error(error)

      setError(t("orders.loadError"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [page, direction, appliedFilters])

  const handleSearch = () => {
    setPage(0)

    setAppliedFilters({
      ...filters,
    })
  }

  const handleReset = () => {
    const emptyFilters = {
      id: "",
      customer: "",
      status: "ALL",
      minTotal: "",
      maxTotal: "",
      dateFrom: "",
      dateTo: "",
    }

    setFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
    setPage(0)
  }

  const handleDirectionChange = (newDirection: "asc" | "desc") => {
    setPage(0)
    setDirection(newDirection)
  }

  const handleStatusChange = async (order: Order, newStatus: string) => {
    if (!newStatus || newStatus === order.orderStatus) {
      return
    }

    try {
      setActionLoading(true)
      setError("")

      // PAID → PREPARING

      if (newStatus === "PREPARING" && order.orderStatus === "PAID") {
        await prepareOrder(order.id)

        await loadData()

        return
      }

      // PREPARING → SHIPPED

      if (newStatus === "SHIPPED" && order.orderStatus === "PREPARING") {
        const existingShipment = shipments.find(
          (shipment) => shipment.order.id === order.id,
        )

        if (!existingShipment) {
          setSelectedOrder(order)
          setShowShipmentModal(true)
          return
        }

        await updateShipmentStatus(existingShipment.id, "SHIPPED")

        await loadData()

        return
      }

      // SHIPPED → DELIVERED

      if (newStatus === "DELIVERED" && order.orderStatus === "SHIPPED") {
        const existingShipment = shipments.find(
          (shipment) => shipment.order.id === order.id,
        )

        if (!existingShipment) {
          return
        }

        await updateShipmentStatus(existingShipment.id, "DELIVERED")

        await loadData()
      }
    } catch (error) {
      console.error(error)

      setError(t("orders.actionError"))
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateShipment = async () => {
    if (!selectedOrder) {
      return
    }

    if (!shipmentForm.carrier || !shipmentForm.trackingNumber) {
      return
    }

    try {
      setActionLoading(true)
      setError("")

      const createdShipment = await createShipment({
        carrier: shipmentForm.carrier,
        trackingNumber: shipmentForm.trackingNumber,
        order: selectedOrder.id,
      })

      await updateShipmentStatus(createdShipment.id, "SHIPPED")

      setShowShipmentModal(false)
      setSelectedOrder(null)

      setShipmentForm({
        carrier: "",
        trackingNumber: "",
      })

      await loadData()
    } catch (error) {
      console.error(error)

      setError(t("orders.actionError"))
    } finally {
      setActionLoading(false)
    }
  }

  const getShipmentForOrder = (orderId: string) => {
    return shipments.find((shipment) => shipment.order.id === orderId)
  }

  // COLORE DELLO STATO

  const getStatusStyle = (status: string): React.CSSProperties => {
    switch (status) {
      case "PAID":
        return {
          backgroundColor: "#d1e7dd",
          color: "#0f5132",
          borderColor: "#a3cfbb",
        }

      case "PREPARING":
        return {
          backgroundColor: "#fff3cd",
          color: "#664d03",
          borderColor: "#ffecb5",
        }

      case "SHIPPED":
        return {
          backgroundColor: "#cfe2ff",
          color: "#084298",
          borderColor: "#9ec5fe",
        }

      case "DELIVERED":
        return {
          backgroundColor: "#d1e7dd",
          color: "#0f5132",
          borderColor: "#a3cfbb",
        }

      case "PENDING_PAYMENT":
        return {
          backgroundColor: "#e2e3e5",
          color: "#41464b",
          borderColor: "#d3d6d8",
        }

      case "CANCELLED":
        return {
          backgroundColor: "#f8d7da",
          color: "#842029",
          borderColor: "#f1aeb5",
        }

      default:
        return {}
    }
  }

  return (
    <div className="admin-orders">
      {/* HEADER */}

      <div className="admin-orders-header">
        <div>
          <h1>{t("admin.orders.title")}</h1>
          <p>{t("admin.orders.subtitle")}</p>
        </div>

        <div className="admin-orders-count">
          {totalElements} {t("admin.orders.all")}
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="admin-orders-error">
          <span>{error}</span>
        </div>
      )}

      {/* FILTRI */}

      <div className="admin-orders-filter-card">
        <div className="admin-orders-filter-grid">
          {/* ID */}

          <div className="admin-orders-field admin-orders-field-id">
            <label>{t("orders.id")}</label>

            <div className="admin-orders-input-wrapper">
              <Search size={16} />

              <input
                type="text"
                placeholder={t("orders.searchId")}
                value={filters.id}
                onChange={(event) =>
                  setFilters({
                    ...filters,
                    id: event.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* CLIENTE */}

          <div className="admin-orders-field admin-orders-field-customer">
            <label>{t("orders.customer")}</label>

            <div className="admin-orders-input-wrapper">
              <Search size={16} />

              <input
                type="text"
                placeholder={t("orders.searchCustomer")}
                value={filters.customer}
                onChange={(event) =>
                  setFilters({
                    ...filters,
                    customer: event.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* STATO */}

          <div className="admin-orders-field">
            <label>{t("orders.status")}</label>

            <select
              value={filters.status}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  status: event.target.value,
                })
              }
            >
              <option value="ALL">{t("orders.all")}</option>

              <option value="PENDING_PAYMENT">
                {t("orderStatus.PENDING_PAYMENT")}
              </option>

              <option value="PAID">{t("orderStatus.PAID")}</option>

              <option value="PREPARING">{t("orderStatus.PREPARING")}</option>

              <option value="SHIPPED">{t("orderStatus.SHIPPED")}</option>

              <option value="DELIVERED">{t("orderStatus.DELIVERED")}</option>

              <option value="CANCELLED">{t("orderStatus.CANCELLED")}</option>
            </select>
          </div>

          {/* TOTALE MIN */}

          <div className="admin-orders-field">
            <label>{t("orders.minTotal")}</label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={filters.minTotal}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  minTotal: event.target.value,
                })
              }
            />
          </div>

          {/* TOTALE MAX */}

          <div className="admin-orders-field">
            <label>{t("orders.maxTotal")}</label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={filters.maxTotal}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  maxTotal: event.target.value,
                })
              }
            />
          </div>

          {/* DATA DA */}

          <div className="admin-orders-field">
            <label>{t("orders.dateFrom")}</label>

            <input
              type="date"
              value={filters.dateFrom}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  dateFrom: event.target.value,
                })
              }
            />
          </div>

          {/* DATA A */}

          <div className="admin-orders-field">
            <label>{t("orders.dateTo")}</label>

            <input
              type="date"
              value={filters.dateTo}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  dateTo: event.target.value,
                })
              }
            />
          </div>

          {/* BOTTONI */}

          <div className="admin-orders-filter-actions">
            <button
              type="button"
              className="admin-orders-search-button"
              onClick={handleSearch}
            >
              <Search size={16} />

              {t("orders.search")}
            </button>

            <button
              type="button"
              className="admin-orders-reset-button"
              onClick={handleReset}
            >
              {t("orders.reset")}
            </button>
          </div>
        </div>
      </div>

      {/* ORDINAMENTO */}

      <div className="admin-orders-toolbar">
        <span>
          {totalElements} {t("orders.all")}
        </span>

        <select
          value={direction}
          onChange={(event) =>
            handleDirectionChange(event.target.value as "asc" | "desc")
          }
        >
          <option value="desc">{t("orders.newestFirst")}</option>

          <option value="asc">{t("orders.oldestFirst")}</option>
        </select>
      </div>

      {/* TABELLA */}

      <div className="admin-orders-table-card">
        <div className="admin-orders-table-wrapper">
          <table className="admin-orders-table">
            <thead>
              <tr>
                <th>{t("orders.order")}</th>

                <th>{t("orders.customer")}</th>

                <th>{t("orders.date")}</th>

                <th>{t("orders.total")}</th>

                <th>{t("orders.status")}</th>

                <th className="admin-orders-actions-column">
                  {t("orders.actions")}
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="admin-orders-loading">
                    <Loading />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-orders-empty">
                    {t("orders.empty")}
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const shipment = getShipmentForOrder(order.id)

                  return (
                    <tr key={order.id}>
                      {/* ID */}

                      <td>
                        <span className="admin-orders-id">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>

                      {/* CLIENTE */}

                      <td>
                        <div className="admin-orders-customer">
                          {order.user.name} {order.user.surname}
                        </div>

                        <small>{order.user.email}</small>
                      </td>

                      {/* DATA */}

                      <td className="admin-orders-date">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>

                      {/* TOTALE */}

                      <td>
                        <strong className="admin-orders-total">
                          € {order.total.toFixed(2)}
                        </strong>
                      </td>

                      {/* STATO */}

                      <td>
                        <select
                          className="admin-orders-status-select"
                          style={getStatusStyle(order.orderStatus)}
                          value={order.orderStatus}
                          disabled={actionLoading}
                          onChange={(event) =>
                            handleStatusChange(order, event.target.value)
                          }
                        >
                          <option value="PENDING_PAYMENT" disabled>
                            {t("orderStatus.PENDING_PAYMENT")}
                          </option>

                          <option value="PAID" disabled>
                            {t("orderStatus.PAID")}
                          </option>

                          <option value="PREPARING">
                            {t("orderStatus.PREPARING")}
                          </option>

                          <option value="SHIPPED">
                            {t("orderStatus.SHIPPED")}
                          </option>

                          <option
                            value="DELIVERED"
                            disabled={
                              !shipment || shipment.status !== "SHIPPED"
                            }
                          >
                            {t("orderStatus.DELIVERED")}
                          </option>

                          <option value="CANCELLED" disabled>
                            {t("orderStatus.CANCELLED")}
                          </option>
                        </select>
                      </td>

                      {/* AZIONI */}

                      <td className="admin-orders-actions">
                        <button
                          type="button"
                          className="admin-orders-view-button"
                          title={t("orders.details")}
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINAZIONE */}

      {totalPages > 1 && (
        <div className="admin-orders-pagination">
          <button
            type="button"
            disabled={page === 0 || loading}
            onClick={() => setPage((currentPage) => currentPage - 1)}
          >
            ‹
          </button>

          <span>
            {page + 1} / {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages - 1 || loading}
            onClick={() => setPage((currentPage) => currentPage + 1)}
          >
            ›
          </button>
        </div>
      )}

      {/* MODALE SPEDIZIONE */}

      {showShipmentModal && (
        <div className="admin-orders-modal-overlay">
          <div className="admin-orders-modal">
            <div className="admin-orders-modal-header">
              <div className="admin-orders-modal-title">
                <div className="admin-orders-modal-icon">
                  <Truck size={20} />
                </div>

                <h5>{t("orders.confirmShipment")}</h5>
              </div>

              <button
                type="button"
                className="admin-orders-modal-close"
                onClick={() => {
                  setShowShipmentModal(false)
                  setSelectedOrder(null)
                }}
              >
                ×
              </button>
            </div>

            <div className="admin-orders-modal-body">
              {selectedOrder && (
                <p className="admin-orders-modal-description">
                  {t("orders.shipmentFor")} #
                  {selectedOrder.id.slice(0, 8).toUpperCase()}
                </p>
              )}

              <div className="admin-orders-field">
                <label>{t("orders.carrier")}</label>

                <input
                  type="text"
                  value={shipmentForm.carrier}
                  onChange={(event) =>
                    setShipmentForm({
                      ...shipmentForm,
                      carrier: event.target.value,
                    })
                  }
                  placeholder="GLS"
                />
              </div>

              <div className="admin-orders-field">
                <label>{t("orders.trackingNumber")}</label>

                <input
                  type="text"
                  value={shipmentForm.trackingNumber}
                  onChange={(event) =>
                    setShipmentForm({
                      ...shipmentForm,
                      trackingNumber: event.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="admin-orders-modal-footer">
              <button
                type="button"
                className="admin-orders-modal-cancel"
                disabled={actionLoading}
                onClick={() => {
                  setShowShipmentModal(false)
                  setSelectedOrder(null)
                }}
              >
                {t("orders.cancel")}
              </button>

              <button
                type="button"
                className="admin-orders-modal-confirm"
                disabled={
                  actionLoading ||
                  !shipmentForm.carrier ||
                  !shipmentForm.trackingNumber
                }
                onClick={handleCreateShipment}
              >
                {actionLoading
                  ? t("common.loading")
                  : t("orders.confirmShipment")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrders
