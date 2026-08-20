import { useEffect, useState } from "react"
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Package,
  Truck,
  User,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"

import type { Order } from "../../types/Order"
import type { OrderItem } from "../../types/OrderItem"

import {
  createShipment,
  getMyOrderItems,
  getOrderById,
  getPaymentByOrderId,
  getAllShipments,
  prepareOrder,
  updateShipmentStatus,
  type Payment,
  type Shipment,
} from "../../services/orderApi"

import Loading from "../../components/Loading"
import { getFlavorById, getTubById } from "../../services/catalogApi"

function AdminOrderDetails() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const [order, setOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [payment, setPayment] = useState<Payment | null>(null)
  const [shipment, setShipment] = useState<Shipment | null>(null)

  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const [error, setError] = useState("")

  const [shipmentForm, setShipmentForm] = useState({
    carrier: "",
    trackingNumber: "",
  })

  const [showShipmentForm, setShowShipmentForm] = useState(false)

  const loadData = async () => {
    if (!id) {
      return
    }

    try {
      setLoading(true)
      setError("")

      const [orderData, orderItemsData, paymentData, shipmentsData] =
        await Promise.all([
          getOrderById(id),
          getMyOrderItems(0, 50),
          getPaymentByOrderId(id).catch(() => null),
          getAllShipments(0, 100),
        ])

      setOrder(orderData)

      const itemsForOrder = orderItemsData.filter(
        (item: OrderItem) => item.order.id === id,
      )

      setOrderItems(itemsForOrder)

      setPayment(paymentData)

      const orderShipment = shipmentsData.content.find(
        (shipment: Shipment) => shipment.order.id === id,
      )

      setShipment(orderShipment ?? null)
    } catch (error) {
      console.error(error)

      setError(t("admin.orderDetails.loadError"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [id])

  const handleStatusChange = async (newStatus: string) => {
    if (!order || !newStatus) {
      return
    }

    try {
      setActionLoading(true)
      setError("")

      /*
       * PAID → PREPARING
       */

      if (newStatus === "PREPARING") {
        const updatedOrder = await prepareOrder(order.id)

        setOrder(updatedOrder)

        return
      }

      /*
       * PREPARING → SHIPPED
       *
       * Se non abbiamo ancora una shipment,
       * apriamo il form.
       */

      if (newStatus === "SHIPPED") {
        if (!shipment) {
          setShowShipmentForm(true)
          return
        }

        const updatedShipment = await updateShipmentStatus(
          shipment.id,
          "SHIPPED",
        )

        setShipment(updatedShipment)

        await loadData()

        return
      }

      /*
       * SHIPPED → DELIVERED
       */

      if (newStatus === "DELIVERED") {
        if (!shipment) {
          return
        }

        const updatedShipment = await updateShipmentStatus(
          shipment.id,
          "DELIVERED",
        )

        setShipment(updatedShipment)

        await loadData()
      }
    } catch (error) {
      console.error(error)

      setError(t("admin.orderDetails.actionError"))
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateShipment = async () => {
    if (!order) {
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
        order: order.id,
      })

      /*
       * La shipment nasce PENDING.
       * La portiamo subito a SHIPPED perché
       * l'admin ha selezionato "Spedito".
       */

      const shippedShipment = await updateShipmentStatus(
        createdShipment.id,
        "SHIPPED",
      )

      setShipment(shippedShipment)

      setShowShipmentForm(false)

      setShipmentForm({
        carrier: "",
        trackingNumber: "",
      })

      await loadData()
    } catch (error) {
      console.error(error)

      setError(t("admin.orderDetails.actionError"))
    } finally {
      setActionLoading(false)
    }
  }

  const getShipmentForOrder = shipment

  if (loading) {
    return <Loading />
  }

  if (error && !order) {
    return (
      <div>
        <button
          type="button"
          className="btn btn-link px-0 mb-4"
          onClick={() => navigate("/admin/orders")}
        >
          <ArrowLeft size={18} className="me-1" />
          {t("admin.orderDetails.backToOrders")}
        </button>

        <div className="alert alert-danger">{error}</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-5">
        <Package size={50} className="text-muted mb-3" />

        <h2>{t("admin.orderDetails.orderNotFound")}</h2>

        <button
          type="button"
          className="btn btn-dark mt-3"
          onClick={() => navigate("/admin/orders")}
        >
          {t("admin.orderDetails.backToOrders")}
        </button>
      </div>
    )
  }

  const subtotal = order.total - order.shippingCost

  return (
    <div>
      {/* HEADER */}

      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <button
            type="button"
            className="btn btn-link px-0 mb-2"
            onClick={() => navigate("/admin/orders")}
          >
            <ArrowLeft size={18} className="me-1" />
            {t("admin.orderDetails.backToOrders")}
          </button>

          <h1 className="mb-1">
            {t("admin.orderDetails.title")}{" "}
            <span className="text-muted">
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
          </h1>

          <p className="text-muted mb-0">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        {/* STATO */}

        <div>
          <label className="form-label fw-semibold">
            {t("admin.orderDetails.status")}
          </label>

          <select
            className={`form-select status-select ${getStatusClass(
              order.orderStatus,
            )}`}
            value={order.orderStatus}
            disabled={actionLoading}
            onChange={(event) => handleStatusChange(event.target.value)}
          >
            <option value="CART" disabled>
              {t("orderStatus.CART")}
            </option>

            <option value="PENDING_PAYMENT" disabled>
              {t("orderStatus.PENDING_PAYMENT")}
            </option>

            <option value="PAID" disabled>
              {t("orderStatus.PAID")}
            </option>

            <option value="PREPARING">{t("orderStatus.PREPARING")}</option>

            <option value="SHIPPED">{t("orderStatus.SHIPPED")}</option>

            <option
              value="DELIVERED"
              disabled={!shipment || shipment.status !== "SHIPPED"}
            >
              {t("orderStatus.DELIVERED")}
            </option>

            <option value="CANCELLED" disabled>
              {t("orderStatus.CANCELLED")}
            </option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        {/* CLIENTE */}

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h2 className="h5 mb-4">
                <User size={20} className="me-2" />
                {t("admin.orderDetails.customer")}
              </h2>

              <div className="mb-3">
                <div className="fw-semibold">
                  {order.user.name} {order.user.surname}
                </div>

                <div className="text-muted">{order.user.email}</div>

                {order.user.phone && (
                  <div className="text-muted">{order.user.phone}</div>
                )}
              </div>

              {/* INDIRIZZO */}

              {order.address && (
                <>
                  <hr />

                  <h3 className="h6 mb-3">
                    <MapPin size={18} className="me-2" />
                    {t("admin.orderDetails.address")}
                  </h3>

                  <div>
                    <div>{order.address.addressLine1}</div>

                    {order.address.addressLine2 && (
                      <div>{order.address.addressLine2}</div>
                    )}

                    <div>
                      {order.address.postalCode} {order.address.city}
                    </div>

                    <div>{order.address.country}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* PRODOTTI */}

        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h2 className="h5 mb-4">
                <Package size={20} className="me-2" />
                {t("admin.orderDetails.products")}
              </h2>

              {orderItems.length === 0 ? (
                <p className="text-muted">
                  {t("admin.orderDetails.noProducts")}
                </p>
              ) : (
                <div>
                  {orderItems.map((item) => (
                    <OrderProduct key={item.id} item={item} />
                  ))}
                </div>
              )}

              <hr />

              <div className="d-flex justify-content-between mb-2">
                <span>{t("admin.orderDetails.subtotal")}</span>

                <span>€ {subtotal.toFixed(2)}</span>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span>{t("admin.orderDetails.shipping")}</span>

                <span>
                  {order.shippingCost > 0
                    ? `€ ${order.shippingCost.toFixed(2)}`
                    : t("admin.orderDetails.free")}
                </span>
              </div>

              <div className="d-flex justify-content-between pt-2 border-top">
                <strong>{t("admin.orderDetails.total")}</strong>

                <strong>€ {order.total.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* PAGAMENTO */}

        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h2 className="h5 mb-4">
                <CreditCard size={20} className="me-2" />
                {t("admin.orderDetails.payment")}
              </h2>

              {payment ? (
                <>
                  <InfoRow
                    label={t("admin.orderDetails.provider")}
                    value={payment.provider}
                  />

                  <InfoRow
                    label={t("admin.orderDetails.paymentStatus")}
                    value={payment.status}
                  />

                  <InfoRow
                    label={t("admin.orderDetails.amount")}
                    value={`€ ${payment.amount.toFixed(2)}`}
                  />

                  <InfoRow
                    label={t("admin.orderDetails.currency")}
                    value={payment.currency}
                  />

                  <InfoRow
                    label={t("admin.orderDetails.transaction")}
                    value={payment.idTransaction}
                  />

                  <InfoRow
                    label={t("admin.orderDetails.paymentDate")}
                    value={new Date(payment.paymentDate).toLocaleString()}
                  />

                  {payment.stripeEventId && (
                    <InfoRow
                      label={t("admin.orderDetails.stripeEvent")}
                      value={payment.stripeEventId}
                    />
                  )}
                </>
              ) : (
                <p className="text-muted mb-0">
                  {t("admin.orderDetails.noPayment")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SPEDIZIONE */}

        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h2 className="h5 mb-4">
                <Truck size={20} className="me-2" />
                {t("admin.orderDetails.shipment")}
              </h2>

              {getShipmentForOrder ? (
                <>
                  <InfoRow
                    label={t("admin.orderDetails.carrier")}
                    value={getShipmentForOrder.carrier}
                  />

                  <InfoRow
                    label={t("admin.orderDetails.trackingNumber")}
                    value={getShipmentForOrder.trackingNumber}
                  />

                  <InfoRow
                    label={t("admin.orderDetails.shipmentStatus")}
                    value={t(
                      `admin.shipmentStatus.${getShipmentForOrder.status}`,
                    )}
                  />

                  {getShipmentForOrder.deliveredAt && (
                    <InfoRow
                      label={t("admin.orderDetails.deliveredAt")}
                      value={new Date(
                        getShipmentForOrder.deliveredAt,
                      ).toLocaleDateString()}
                    />
                  )}
                </>
              ) : (
                <>
                  <p className="text-muted">
                    {t("admin.orderDetails.noShipment")}
                  </p>

                  {order.orderStatus === "PREPARING" && (
                    <button
                      type="button"
                      className="btn btn-dark"
                      disabled={actionLoading}
                      onClick={() => setShowShipmentForm(true)}
                    >
                      {t("admin.orders.createShipment")}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* NOTE */}

        {order.notes && (
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h2 className="h5 mb-3">{t("admin.orderDetails.notes")}</h2>

                <p className="mb-0">{order.notes}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODALE SPEDIZIONE */}

      {showShipmentForm && (
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
                  onClick={() => setShowShipmentForm(false)}
                />
              </div>

              <div className="modal-body">
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
                  onClick={() => setShowShipmentForm(false)}
                >
                  {t("admin.orders.cancel")}
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
                    : t("admin.orders.confirmShipment")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* PRODUCT                                                                      */
/* -------------------------------------------------------------------------- */

function OrderProduct({ item }: { item: OrderItem }) {
  const [flavorName, setFlavorName] = useState("")
  const [flavorImage, setFlavorImage] = useState("")
  const { t } = useTranslation()
  const [tub, setTub] = useState<{
    weight: number
    price: number
  } | null>(null)

  useEffect(() => {
    const loadProductData = async () => {
      try {
        const [flavorData, tubData] = await Promise.all([
          getFlavorById(item.flavor.id),
          getTubById(item.tub.id),
        ])

        setFlavorName(flavorData.name)
        setFlavorImage(flavorData.image ?? "")

        setTub({
          weight: tubData.weight,
          price: tubData.price,
        })
      } catch (error) {
        console.error(error)
      }
    }

    loadProductData()
  }, [item.flavor.id, item.tub.id])

  const rowTotal = item.unitPrice * item.quantity

  return (
    <div className="d-flex align-items-center gap-3 py-3 border-bottom">
      {/* FOTO */}

      <div
        style={{
          width: "80px",
          height: "80px",
          flexShrink: 0,
        }}
      >
        {flavorImage ? (
          <img
            src={flavorImage}
            alt={flavorName}
            className="img-fluid rounded"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div className="bg-light rounded w-100 h-100 d-flex align-items-center justify-content-center">
            <Package size={25} className="text-muted" />
          </div>
        )}
      </div>

      {/* PRODOTTO */}

      <div className="flex-grow-1">
        <h3 className="h6 mb-1">{flavorName || "—"}</h3>

        {tub && (
          <div className="text-muted small mb-1">
            {t("admin.orderDetails.tub")}: {tub.weight} g
          </div>
        )}

        <div className="text-muted small">
          {item.quantity} × €{item.unitPrice.toFixed(2)}
        </div>
      </div>

      {/* TOTALE */}

      <strong>€ {rowTotal.toFixed(2)}</strong>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* INFO ROW                                                                    */
/* -------------------------------------------------------------------------- */

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="d-flex justify-content-between gap-3 py-2 border-bottom">
      <span className="text-muted">{label}</span>

      <span className="text-end fw-semibold text-break">{value}</span>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* STATUS                                                                       */
/* -------------------------------------------------------------------------- */

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

export default AdminOrderDetails
