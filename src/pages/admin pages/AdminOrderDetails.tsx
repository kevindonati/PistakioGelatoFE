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
import "../../styles/AdminOrderDetails.css"

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleStatusChange = async (newStatus: string) => {
    if (!order || !newStatus) {
      return
    }

    if (newStatus === order.orderStatus) {
      return
    }

    try {
      setActionLoading(true)
      setError("")

      if (newStatus === "PREPARING" && order.orderStatus === "PAID") {
        const updatedOrder = await prepareOrder(order.id)

        setOrder(updatedOrder)

        return
      }

      if (newStatus === "SHIPPED" && order.orderStatus === "PREPARING") {
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

      if (newStatus === "DELIVERED" && order.orderStatus === "SHIPPED") {
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

  if (loading) {
    return <Loading />
  }

  if (error && !order) {
    return (
      <main className="admin-order-details-page">
        <div className="admin-order-details-container">
          <button
            type="button"
            className="admin-order-details-back"
            onClick={() => navigate("/admin/orders")}
          >
            <ArrowLeft size={18} />
            {t("admin.orderDetails.backToOrders")}
          </button>

          <div className="admin-order-details-error">{error}</div>
        </div>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="admin-order-details-page">
        <div className="admin-order-details-container">
          <div className="admin-order-details-not-found">
            <div className="admin-order-details-not-found-icon">
              <Package size={46} strokeWidth={1.5} />
            </div>

            <h2>{t("admin.orderDetails.orderNotFound")}</h2>

            <button
              type="button"
              className="admin-order-details-primary-button"
              onClick={() => navigate("/admin/orders")}
            >
              {t("admin.orderDetails.backToOrders")}
            </button>
          </div>
        </div>
      </main>
    )
  }

  const subtotal = order.total - order.shippingCost

  return (
    <main className="admin-order-details-page">
      <div className="admin-order-details-container">
        <header className="admin-order-details-header">
          <div className="admin-order-details-header-left">
            <button
              type="button"
              className="admin-order-details-back"
              onClick={() => navigate("/admin/orders")}
            >
              <ArrowLeft size={18} />
              {t("admin.orderDetails.backToOrders")}
            </button>

            <h1>
              {t("admin.orderDetails.title")}{" "}
              <span>#{order.id.slice(0, 8).toUpperCase()}</span>
            </h1>

            <p>{new Date(order.createdAt).toLocaleString()}</p>
          </div>

          <div className="admin-order-details-status">
            <label>{t("admin.orderDetails.status")}</label>

            <select
              value={order.orderStatus}
              disabled={actionLoading}
              onChange={(event) => handleStatusChange(event.target.value)}
              style={getStatusStyle(order.orderStatus)}
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
        </header>

        {error && <div className="admin-order-details-error">{error}</div>}

        <div className="admin-order-details-grid">
          <section className="admin-order-details-card admin-order-details-customer-card">
            <div className="admin-order-details-card-header">
              <div className="admin-order-details-card-icon">
                <User size={20} />
              </div>

              <h2>{t("admin.orderDetails.customer")}</h2>
            </div>

            <div className="admin-order-details-customer-info">
              <div className="admin-order-details-customer-name">
                {order.user.name} {order.user.surname}
              </div>

              <div>{order.user.email}</div>

              {order.user.phone && <div>{order.user.phone}</div>}
            </div>

            {order.address && (
              <div className="admin-order-details-address">
                <div className="admin-order-details-section-divider" />

                <div className="admin-order-details-subtitle">
                  <MapPin size={18} />
                  {t("admin.orderDetails.address")}
                </div>

                <div className="admin-order-details-address-text">
                  <div>{order.address.addressLine1}</div>

                  {order.address.addressLine2 && (
                    <div>{order.address.addressLine2}</div>
                  )}

                  <div>
                    {order.address.postalCode} {order.address.city}
                  </div>

                  <div>{order.address.country}</div>
                </div>
              </div>
            )}
          </section>

          <section className="admin-order-details-card admin-order-details-products-card">
            <div className="admin-order-details-card-header">
              <div className="admin-order-details-card-icon">
                <Package size={20} />
              </div>

              <h2>{t("admin.orderDetails.products")}</h2>
            </div>

            {orderItems.length === 0 ? (
              <p className="admin-order-details-empty">
                {t("admin.orderDetails.noProducts")}
              </p>
            ) : (
              <div className="admin-order-details-products">
                {orderItems.map((item) => (
                  <OrderProduct key={item.id} item={item} />
                ))}
              </div>
            )}

            <div className="admin-order-details-summary">
              <div>
                <span>{t("admin.orderDetails.subtotal")}</span>

                <span>€ {subtotal.toFixed(2)}</span>
              </div>

              <div>
                <span>{t("admin.orderDetails.shipping")}</span>

                <span>
                  {order.shippingCost > 0
                    ? `€ ${order.shippingCost.toFixed(2)}`
                    : t("admin.orderDetails.free")}
                </span>
              </div>

              <div className="admin-order-details-total">
                <strong>{t("admin.orderDetails.total")}</strong>

                <strong>€ {order.total.toFixed(2)}</strong>
              </div>
            </div>
          </section>

          <section className="admin-order-details-card">
            <div className="admin-order-details-card-header">
              <div className="admin-order-details-card-icon">
                <CreditCard size={20} />
              </div>

              <h2>{t("admin.orderDetails.payment")}</h2>
            </div>

            {payment ? (
              <div className="admin-order-details-info-list">
                <InfoRow
                  label={t("admin.orderDetails.provider")}
                  value={payment.provider}
                />

                <InfoRow
                  label={t("admin.orderDetails.paymentStatus")}
                  value={t(`paymentStatus.${payment.status}`)}
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
              </div>
            ) : (
              <p className="admin-order-details-empty">
                {t("admin.orderDetails.noPayment")}
              </p>
            )}
          </section>

          <section className="admin-order-details-card">
            <div className="admin-order-details-card-header">
              <div className="admin-order-details-card-icon">
                <Truck size={20} />
              </div>

              <h2>{t("admin.orderDetails.shipment")}</h2>
            </div>

            {shipment ? (
              <div className="admin-order-details-info-list">
                <InfoRow
                  label={t("admin.orderDetails.carrier")}
                  value={shipment.carrier}
                />

                <InfoRow
                  label={t("admin.orderDetails.trackingNumber")}
                  value={shipment.trackingNumber}
                />

                <InfoRow
                  label={t("admin.orderDetails.shipmentStatus")}
                  value={t(`admin.shipmentStatus.${shipment.status}`)}
                />

                {shipment.deliveredAt && (
                  <InfoRow
                    label={t("admin.orderDetails.deliveredAt")}
                    value={new Date(shipment.deliveredAt).toLocaleDateString()}
                  />
                )}
              </div>
            ) : (
              <>
                <p className="admin-order-details-empty">
                  {t("admin.orderDetails.noShipment")}
                </p>

                {order.orderStatus === "PREPARING" && (
                  <button
                    type="button"
                    className="admin-order-details-primary-button"
                    disabled={actionLoading}
                    onClick={() => setShowShipmentForm(true)}
                  >
                    <Truck size={17} />
                    {t("admin.orders.createShipment")}
                  </button>
                )}
              </>
            )}
          </section>

          {order.notes && (
            <section className="admin-order-details-card admin-order-details-notes-card">
              <div className="admin-order-details-card-header">
                <div className="admin-order-details-card-icon">
                  <Package size={20} />
                </div>

                <h2>{t("admin.orderDetails.notes")}</h2>
              </div>

              <p className="admin-order-details-notes">{order.notes}</p>
            </section>
          )}
        </div>

        {showShipmentForm && (
          <div className="admin-order-details-modal-overlay">
            <div className="admin-order-details-modal">
              <div className="admin-order-details-modal-header">
                <div className="admin-order-details-modal-title">
                  <div className="admin-order-details-modal-icon">
                    <Truck size={20} />
                  </div>

                  <h2>{t("admin.orders.createShipment")}</h2>
                </div>

                <button
                  type="button"
                  className="admin-order-details-modal-close"
                  onClick={() => setShowShipmentForm(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="admin-order-details-modal-body">
                <div className="admin-order-details-field">
                  <label>{t("admin.orders.carrier")}</label>

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

                <div className="admin-order-details-field">
                  <label>{t("admin.orders.trackingNumber")}</label>

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

              <div className="admin-order-details-modal-footer">
                <button
                  type="button"
                  className="admin-order-details-modal-cancel"
                  disabled={actionLoading}
                  onClick={() => setShowShipmentForm(false)}
                >
                  {t("admin.orders.cancel")}
                </button>

                <button
                  type="button"
                  className="admin-order-details-modal-confirm"
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
        )}
      </div>
    </main>
  )
}

function OrderProduct({ item }: { item: OrderItem }) {
  const [flavorName, setFlavorName] = useState("")
  const [flavorImage, setFlavorImage] = useState("")

  const [tub, setTub] = useState<{
    weight: number
    price: number
  } | null>(null)

  const { t } = useTranslation()

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
    <div className="admin-order-details-product">
      <div className="admin-order-details-product-image">
        {flavorImage ? (
          <img src={flavorImage} alt={flavorName} />
        ) : (
          <div className="admin-order-details-product-placeholder">
            <Package size={25} />
          </div>
        )}
      </div>

      <div className="admin-order-details-product-info">
        <h3>{flavorName || "—"}</h3>

        {tub && (
          <div>
            {t("admin.orderDetails.tub")}: {tub.weight} g
          </div>
        )}

        <div>
          {item.quantity} × €{item.unitPrice.toFixed(2)}
        </div>
      </div>

      <strong className="admin-order-details-product-total">
        € {rowTotal.toFixed(2)}
      </strong>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="admin-order-details-info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export default AdminOrderDetails
