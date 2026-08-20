import { useEffect, useState } from "react"
import { Eye, Package } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import type { Order } from "../../types/Order"

import {
  getAllOrders,
  getAllShipments,
  prepareOrder,
  createShipment,
  updateShipmentStatus,
  type Shipment,
} from "../../services/orderApi"

import Loading from "../../components/Loading"

function AdminOrders() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [orders, setOrders] = useState<Order[]>([])
  const [shipments, setShipments] = useState<Shipment[]>([])

  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [filter, setFilter] = useState("ALL")

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)

  const [shipmentForm, setShipmentForm] = useState<{
    orderId: string
    carrier: string
    trackingNumber: string
  } | null>(null)

  const [error, setError] = useState("")

  const pageSize = 15

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")

      const [ordersData, shipmentsData] = await Promise.all([
        getAllOrders(page, pageSize, sortOrder),
        getAllShipments(0, 100),
      ])

      const visibleOrders = ordersData.content.filter(
        (order: Order) => order.orderStatus !== "CART",
      )

      setOrders(visibleOrders)

      setTotalPages(ordersData.totalPages)

      setTotalOrders(ordersData.totalElements)

      setShipments(shipmentsData.content)
    } catch (error) {
      console.error(error)

      setError(t("admin.orders.loadError"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [page, sortOrder])

  const handleFilterChange = (value: string) => {
    setFilter(value)
    setPage(0)
  }

  const handlePrepare = async (orderId: string) => {
    try {
      setActionLoading(orderId)
      setError("")

      const updatedOrder = await prepareOrder(orderId)

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order,
        ),
      )
    } catch (error) {
      console.error(error)

      setError(t("admin.orders.actionError"))
    } finally {
      setActionLoading(null)
    }
  }

  const handleCreateShipment = async () => {
    if (!shipmentForm) {
      return
    }

    try {
      setActionLoading(shipmentForm.orderId)
      setError("")

      const savedShipment = await createShipment({
        carrier: shipmentForm.carrier,
        trackingNumber: shipmentForm.trackingNumber,
        order: shipmentForm.orderId,
      })

      await updateShipmentStatus(savedShipment.id, "SHIPPED")

      setShipmentForm(null)

      await loadData()
    } catch (error) {
      console.error(error)

      setError(t("admin.orders.actionError"))
    } finally {
      setActionLoading(null)
    }
  }

  const handleShipmentStatus = async (
    shipment: Shipment,
    status: "SHIPPED" | "DELIVERED",
  ) => {
    try {
      setActionLoading(shipment.id)
      setError("")

      await updateShipmentStatus(shipment.id, status)

      await loadData()
    } catch (error) {
      console.error(error)

      setError(t("admin.orders.actionError"))
    } finally {
      setActionLoading(null)
    }
  }

  const getShipmentForOrder = (orderId: string) => {
    return shipments.find((shipment) => shipment.order.id === orderId)
  }

  const handleStatusChange = async (order: Order, newStatus: string) => {
    if (!newStatus) {
      return
    }

    const shipment = getShipmentForOrder(order.id)

    /*
     * PAID → PREPARING
     */

    if (newStatus === "PREPARING") {
      await handlePrepare(order.id)
      return
    }

    /*
     * PREPARING → SHIPPED
     *
     * Se non esiste ancora una spedizione,
     * apriamo la modale per crearla.
     */

    if (newStatus === "SHIPPED") {
      if (!shipment) {
        setShipmentForm({
          orderId: order.id,
          carrier: "",
          trackingNumber: "",
        })

        return
      }

      await handleShipmentStatus(shipment, "SHIPPED")

      return
    }

    /*
     * SHIPPED → DELIVERED
     */

    if (newStatus === "DELIVERED") {
      if (!shipment) {
        return
      }

      await handleShipmentStatus(shipment, "DELIVERED")
    }
  }

  const goToPage = (newPage: number) => {
    if (newPage < 0 || newPage >= totalPages) {
      return
    }

    setPage(newPage)
  }

  const filteredOrders =
    filter === "ALL"
      ? orders
      : orders.filter((order) => order.orderStatus === filter)

  if (loading) {
    return <Loading />
  }

  return (
    <div>
      {/* HEADER */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1">
            {t("admin.orders.title")} ({totalOrders})
          </h1>

          <p className="text-muted mb-0">{t("admin.orders.subtitle")}</p>
        </div>
      </div>

      {/* ERROR */}

      {error && <div className="alert alert-danger">{error}</div>}

      {/* FILTRI */}

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            {/* FILTRO STATO */}

            <div className="col-12 col-md-4">
              <label className="form-label">{t("orderDetails.status")}</label>

              <select
                className="form-select"
                value={filter}
                onChange={(event) => handleFilterChange(event.target.value)}
              >
                <option value="ALL">{t("admin.orders.all")}</option>

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

            {/* ORDINAMENTO */}

            <div className="col-12 col-md-4">
              <label className="form-label">{t("admin.orders.sortBy")}</label>

              <select
                className="form-select"
                value={sortOrder}
                onChange={(event) =>
                  setSortOrder(event.target.value as "asc" | "desc")
                }
              >
                <option value="desc">{t("admin.orders.newest")}</option>

                <option value="asc">{t("admin.orders.oldest")}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* TABELLA */}

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>{t("admin.orders.id")}</th>

                <th>{t("admin.orders.customer")}</th>

                <th>{t("admin.orders.city")}</th>

                <th>{t("orderDetails.total")}</th>

                <th>{t("admin.orders.payment")}</th>

                <th>{t("orderDetails.status")}</th>

                <th>{t("orderDetails.orderDate")}</th>

                <th>{t("admin.orders.shipment")}</th>

                <th className="text-end">{t("admin.orders.actions")}</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => {
                const shipment = getShipmentForOrder(order.id)

                const isLoading =
                  actionLoading === order.id || actionLoading === shipment?.id

                return (
                  <tr key={order.id}>
                    {/* ID */}

                    <td>
                      <span className="fw-semibold" title={order.id}>
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>

                    {/* CLIENTE */}

                    <td>
                      <div className="fw-semibold">
                        {order.user.name} {order.user.surname}
                      </div>

                      <small className="text-muted">{order.user.email}</small>
                    </td>

                    {/* CITTÀ */}

                    <td>{order.address?.city ?? "—"}</td>

                    {/* TOTALE */}

                    <td>
                      <strong>€ {order.total.toFixed(2)}</strong>
                    </td>

                    {/* PAGAMENTO */}

                    <td>
                      <span className="badge text-bg-primary">Stripe</span>
                    </td>

                    {/* STATO */}

                    <td>
                      <select
                        className={`form-select form-select-sm status-select ${getStatusClass(
                          order.orderStatus,
                        )}`}
                        value={order.orderStatus}
                        disabled={isLoading}
                        onChange={(event) =>
                          handleStatusChange(order, event.target.value)
                        }
                      >
                        {/* CARRELLO */}

                        <option value="CART" disabled>
                          {t("orderStatus.CART")}
                        </option>

                        {/* PAGAMENTO */}

                        <option value="PENDING_PAYMENT" disabled>
                          {t("orderStatus.PENDING_PAYMENT")}
                        </option>

                        {/* PAGATO */}

                        <option value="PAID" disabled>
                          {t("orderStatus.PAID")}
                        </option>

                        {/* PREPARAZIONE */}

                        <option value="PREPARING">
                          {t("orderStatus.PREPARING")}
                        </option>

                        {/* SPEDITO */}

                        <option value="SHIPPED">
                          {t("orderStatus.SHIPPED")}
                        </option>

                        {/* CONSEGNATO */}

                        <option
                          value="DELIVERED"
                          disabled={!shipment || shipment.status !== "SHIPPED"}
                        >
                          {t("orderStatus.DELIVERED")}
                        </option>

                        {/* ANNULLATO */}

                        <option value="CANCELLED" disabled>
                          {t("orderStatus.CANCELLED")}
                        </option>
                      </select>
                    </td>

                    {/* DATA */}

                    <td>
                      <div>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>

                      <small className="text-muted">
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </small>
                    </td>

                    {/* SPEDIZIONE */}

                    <td>
                      {shipment ? (
                        <span
                          className={`badge ${getShipmentStatusClass(
                            shipment.status,
                          )}`}
                        >
                          {t(`shipmentStatus.${shipment.status}`)}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>

                    {/* AZIONI */}

                    <td>
                      <div className="d-flex justify-content-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                          title={t("admin.orders.details")}
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* NESSUN ORDINE */}

        {filteredOrders.length === 0 && (
          <div className="text-center py-5">
            <Package size={45} className="text-muted mb-3" />

            <p className="text-muted mb-0">{t("admin.orders.empty")}</p>
          </div>
        )}

        {/* PAGINAZIONE */}

        {totalPages > 0 && (
          <div className="card-footer bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">
                {t("admin.orders.page")} {page + 1} / {totalPages}
              </small>

              <nav>
                <ul className="pagination pagination-sm mb-0">
                  {/* PRECEDENTE */}

                  <li className={`page-item ${page === 0 ? "disabled" : ""}`}>
                    <button
                      type="button"
                      className="page-link"
                      disabled={page === 0}
                      onClick={() => goToPage(page - 1)}
                    >
                      ‹
                    </button>
                  </li>

                  {/* PAGINE */}

                  {Array.from(
                    {
                      length: totalPages,
                    },
                    (_, index) => index,
                  )
                    .filter(
                      (pageNumber) =>
                        pageNumber >= page - 2 && pageNumber <= page + 2,
                    )
                    .map((pageNumber) => (
                      <li
                        key={pageNumber}
                        className={`page-item ${
                          pageNumber === page ? "active" : ""
                        }`}
                      >
                        <button
                          type="button"
                          className="page-link"
                          onClick={() => goToPage(pageNumber)}
                        >
                          {pageNumber + 1}
                        </button>
                      </li>
                    ))}

                  {/* SUCCESSIVA */}

                  <li
                    className={`page-item ${
                      page === totalPages - 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="page-link"
                      disabled={page === totalPages - 1}
                      onClick={() => goToPage(page + 1)}
                    >
                      ›
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* MODALE CREAZIONE SPEDIZIONE */}

      {shipmentForm && (
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
                  {t("admin.orders.createShipment")}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShipmentForm(null)}
                />
              </div>

              <div className="modal-body">
                {/* CORRIERE */}

                <div className="mb-3">
                  <label className="form-label">
                    {t("admin.orders.carrier")}
                  </label>

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
                  />
                </div>

                {/* TRACKING */}

                <div>
                  <label className="form-label">
                    {t("admin.orders.trackingNumber")}
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
                  onClick={() => setShipmentForm(null)}
                >
                  {t("admin.orders.cancel")}
                </button>

                <button
                  type="button"
                  className="btn btn-dark"
                  disabled={
                    !shipmentForm.carrier ||
                    !shipmentForm.trackingNumber ||
                    actionLoading === shipmentForm.orderId
                  }
                  onClick={handleCreateShipment}
                >
                  {t("admin.orders.confirmShipment")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getStatusClass(status: string) {
  switch (status) {
    case "PAID":
      return "text-bg-success"

    case "PREPARING":
      return "text-bg-warning"

    case "SHIPPED":
      return "text-bg-info"

    case "DELIVERED":
      return "text-bg-success"

    case "PENDING_PAYMENT":
      return "text-bg-secondary"

    case "CANCELLED":
      return "text-bg-danger"

    default:
      return "text-bg-secondary"
  }
}

function getShipmentStatusClass(status: string) {
  switch (status) {
    case "PENDING":
      return "text-bg-secondary"

    case "SHIPPED":
      return "text-bg-info"

    case "DELIVERED":
      return "text-bg-success"

    default:
      return "text-bg-secondary"
  }
}

export default AdminOrders
