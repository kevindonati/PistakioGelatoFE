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
    <div>
      {/* HEADER */}

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="mb-1">{t("orders.title")}</h1>

          <p className="text-muted mb-0">{t("orders.subtitle")}</p>
        </div>

        <div className="text-muted">
          {totalElements} {t("orders.all")}
        </div>
      </div>

      {/* ERROR */}

      {error && <div className="alert alert-danger">{error}</div>}

      {/* FILTRI */}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            {/* ID */}

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label">{t("orders.id")}</label>

              <div className="input-group">
                <span className="input-group-text">
                  <Search size={16} />
                </span>

                <input
                  type="text"
                  className="form-control"
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

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label">{t("orders.customer")}</label>

              <div className="input-group">
                <span className="input-group-text">
                  <Search size={16} />
                </span>

                <input
                  type="text"
                  className="form-control"
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

            <div className="col-12 col-md-6 col-lg-2">
              <label className="form-label">{t("orders.status")}</label>

              <select
                className="form-select"
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

            <div className="col-6 col-md-3 col-lg-2">
              <label className="form-label">{t("orders.minTotal")}</label>

              <input
                type="number"
                min="0"
                step="0.01"
                className="form-control"
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

            <div className="col-6 col-md-3 col-lg-2">
              <label className="form-label">{t("orders.maxTotal")}</label>

              <input
                type="number"
                min="0"
                step="0.01"
                className="form-control"
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

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label">{t("orders.dateFrom")}</label>

              <input
                type="date"
                className="form-control"
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

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label">{t("orders.dateTo")}</label>

              <input
                type="date"
                className="form-control"
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

            <div className="col-12 col-lg-6 d-flex align-items-end gap-2">
              <button
                type="button"
                className="btn btn-dark"
                onClick={handleSearch}
              >
                <Search size={16} className="me-1" />

                {t("orders.search")}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleReset}
              >
                {t("orders.reset")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ORDINAMENTO */}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="text-muted">
          {totalElements} {t("orders.all")}
        </span>

        <select
          className="form-select"
          style={{
            width: "220px",
          }}
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

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>{t("orders.order")}</th>

                  <th>{t("orders.customer")}</th>

                  <th>{t("orders.date")}</th>

                  <th>{t("orders.total")}</th>

                  <th>{t("orders.status")}</th>

                  <th className="text-end">{t("orders.actions")}</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      {t("common.loading")}
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
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
                          <span className="fw-semibold">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                        </td>

                        {/* CLIENTE */}

                        <td>
                          <div className="fw-semibold">
                            {order.user.name} {order.user.surname}
                          </div>

                          <small className="text-muted">
                            {order.user.email}
                          </small>
                        </td>

                        {/* DATA */}

                        <td>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>

                        {/* TOTALE */}

                        <td>
                          <strong>€ {order.total.toFixed(2)}</strong>
                        </td>

                        {/* STATO */}

                        <td>
                          <select
                            className="form-select form-select-sm"
                            style={{
                              width: "190px",
                              fontWeight: 600,
                              cursor: "pointer",
                              ...getStatusStyle(order.orderStatus),
                            }}
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

                        <td className="text-end">
                          <button
                            type="button"
                            className="btn btn-outline-dark btn-sm"
                            title={t("orders.details")}
                            onClick={() =>
                              navigate(`/admin/orders/${order.id}`)
                            }
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
      </div>

      {/* PAGINAZIONE */}

      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary"
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
            className="btn btn-outline-secondary"
            disabled={page >= totalPages - 1 || loading}
            onClick={() => setPage((currentPage) => currentPage + 1)}
          >
            ›
          </button>
        </div>
      )}

      {/* MODALE SPEDIZIONE */}

      {showShipmentModal && (
        <div
          className="modal d-block"
          tabIndex={-1}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <Truck size={20} className="me-2" />

                  {t("orders.confirmShipment")}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowShipmentModal(false)
                    setSelectedOrder(null)
                  }}
                />
              </div>

              <div className="modal-body">
                {selectedOrder && (
                  <p className="text-muted">
                    {t("orders.shipmentFor")} #
                    {selectedOrder.id.slice(0, 8).toUpperCase()}
                  </p>
                )}

                <div className="mb-3">
                  <label className="form-label">{t("orders.carrier")}</label>

                  <input
                    type="text"
                    className="form-control"
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

                <div>
                  <label className="form-label">
                    {t("orders.trackingNumber")}
                  </label>

                  <input
                    type="text"
                    className="form-control"
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

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
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
                  className="btn btn-dark"
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
        </div>
      )}
    </div>
  )
}

export default AdminOrders
