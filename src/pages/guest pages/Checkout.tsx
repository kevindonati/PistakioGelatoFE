import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { useTranslation } from "react-i18next"

import {
  ArrowLeft,
  Check,
  CreditCard,
  MapPin,
  Plus,
  ShoppingBag,
  Truck,
} from "lucide-react"

import { useCart } from "../../context/CartContext"

import { getAddresses } from "../../services/addressApi"

import {
  checkoutOrder,
  getShippingCost,
  createStripeCheckout,
  createPaypalOrder,
  getOrderById,
  getMyOrderItems,
} from "../../services/orderApi"

import type { Address } from "../../types/Address"
import type { Order } from "../../types/Order"
import type { CartItem } from "../../context/CartContext"

import Loading from "../../components/Loading"

import "../../styles/Checkout.css"
import { getFlavorById, getTubById } from "../../services/catalogApi"
import { Paypal } from "react-bootstrap-icons"

function Checkout() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [searchParams] = useSearchParams()
  const orderId = searchParams.get("orderId")

  const { items: cartItems, order: cartOrder, loading: cartLoading } = useCart()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [shippingCost, setShippingCost] = useState(0)

  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<CartItem[]>([])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [paymentMethod, setPaymentMethod] = useState<"STRIPE" | "PAYPAL">(
    "STRIPE",
  )

  /*
   * =========================================
   * LOAD CHECKOUT DATA
   * =========================================
   */

  useEffect(() => {
    const loadCheckoutData = async () => {
      try {
        setLoading(true)
        setError("")

        const [addressesData, shippingCostData] = await Promise.all([
          getAddresses(),
          getShippingCost(),
        ])

        setAddresses(addressesData)
        setShippingCost(shippingCostData)

        if (addressesData.length > 0) {
          setSelectedAddress(addressesData[0].id)
        }

        /*
         * Se arriva orderId dalla URL,
         * stiamo riprovando un ordine già esistente.
         *
         * In questo caso NON usiamo il carrello.
         */

        if (orderId) {
          const [orderData, orderItemsData] = await Promise.all([
            getOrderById(orderId),
            getMyOrderItems(0, 50),
          ])

          const filteredItems = orderItemsData.filter(
            (item) => item.order.id === orderId,
          )

          const checkoutItems = await Promise.all(
            filteredItems.map(async (item) => {
              const [flavor, tub] = await Promise.all([
                getFlavorById(item.flavor.id),
                getTubById(item.tub.id),
              ])

              return {
                id: item.id,
                flavor,
                tub,
                quantity: item.quantity,
              }
            }),
          )

          setOrder(orderData)
          setItems(checkoutItems)

          return
        }

        /*
         * Checkout normale:
         * usiamo il carrello corrente.
         */

        setOrder(cartOrder)
        setItems(cartItems)
      } catch (error) {
        console.error(error)

        setError(t("checkout.loadAddressesError"))
      } finally {
        setLoading(false)
      }
    }

    /*
     * Per il checkout normale aspettiamo che il CartContext
     * abbia finito di caricarsi.
     *
     * Se invece abbiamo orderId possiamo caricare
     * direttamente l'ordine.
     */

    if (orderId || !cartLoading) {
      loadCheckoutData()
    }
  }, [orderId, cartLoading, cartOrder, cartItems, t])

  /*
   * =========================================
   * LOADING
   * =========================================
   */

  if (cartLoading && !orderId) {
    return <Loading />
  }

  if (loading) {
    return <Loading />
  }

  /*
   * =========================================
   * EMPTY
   * =========================================
   */

  if (!order || items.length === 0) {
    return (
      <main className="pistakio-checkout">
        <div className="container">
          <div className="pistakio-checkout-empty">
            <div className="pistakio-checkout-empty-icon">
              <ShoppingBag size={30} />
            </div>

            <h1>{t("checkout.title")}</h1>

            <p>{t("checkout.emptyCart")}</p>

            <button
              type="button"
              className="pistakio-checkout-secondary-button"
              onClick={() => navigate("/cart")}
            >
              <ArrowLeft size={17} />

              {t("checkout.backToCart")}
            </button>
          </div>
        </div>
      </main>
    )
  }

  /*
   * =========================================
   * TOTALS
   * =========================================
   */

  const subtotal = items.reduce(
    (total, item) => total + item.tub.price * item.quantity,
    0,
  )

  /*
   * Per un ordine PENDING_PAYMENT il totale
   * è già stato calcolato dal backend.
   *
   * Per il checkout normale calcoliamo:
   * subtotal + shipping.
   */

  const totalPrice =
    order.orderStatus === "PENDING_PAYMENT"
      ? order.total
      : subtotal + shippingCost

  /*
   * =========================================
   * SUBMIT
   * =========================================
   */

  const handleSubmit = async (
    event: React.FormEvent,
    selectedPaymentMethod?: "STRIPE" | "PAYPAL",
  ) => {
    event.preventDefault()

    const method = selectedPaymentMethod ?? paymentMethod

    if (!selectedAddress) {
      setError(t("checkout.addressRequired"))
      return
    }

    if (!order) {
      return
    }

    try {
      setSubmitting(true)
      setError("")

      /*
       * SOLO un ordine CART può essere checkoutato.
       *
       * Se siamo arrivati qui con un ordine
       * PENDING_PAYMENT, saltiamo completamente
       * checkoutOrder().
       */

      if (order.orderStatus === "CART") {
        await checkoutOrder(order.id, {
          address: selectedAddress,
          notes: notes.trim() || undefined,
        })
      }

      /*
       * STRIPE
       */

      if (method === "STRIPE") {
        setPaymentMethod("STRIPE")

        const stripeResponse = await createStripeCheckout(order.id)

        window.location.href = stripeResponse.url

        return
      }

      /*
       * PAYPAL
       */

      setPaymentMethod("PAYPAL")

      const paypalResponse = await createPaypalOrder(order.id)

      window.location.href = paypalResponse.approvalUrl
    } catch (error) {
      console.error(error)

      setError(t("checkout.error"))
      setSubmitting(false)
    }
  }

  return (
    <main className="pistakio-checkout">
      <div className="container">
        {/* HEADER */}

        <section className="pistakio-checkout-header">
          <button
            type="button"
            className="pistakio-checkout-back"
            onClick={() => navigate("/cart")}
          >
            <ArrowLeft size={17} />

            {t("checkout.backToCart")}
          </button>

          <h1>{t("checkout.title")}</h1>
        </section>

        {/* ERROR */}

        {error && <div className="pistakio-checkout-alert">{error}</div>}

        <form onSubmit={(event) => handleSubmit(event)}>
          <div className="pistakio-checkout-layout">
            {/* =========================================
                LEFT
            ========================================= */}

            <div className="pistakio-checkout-main">
              {/* ADDRESS */}

              <section className="pistakio-checkout-card">
                <div className="pistakio-checkout-card-header">
                  <div className="pistakio-checkout-section-icon">
                    <MapPin size={20} />
                  </div>

                  <div>
                    <h2>{t("checkout.deliveryAddress")}</h2>

                    <p>{t("checkout.deliveryAddressDescription")}</p>
                  </div>

                  <button
                    type="button"
                    className="pistakio-checkout-add-button"
                    onClick={() => navigate("/account/addresses/new")}
                  >
                    <Plus size={16} />

                    <span>{t("checkout.newAddress")}</span>
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="pistakio-checkout-no-addresses">
                    <MapPin size={38} strokeWidth={1.5} />

                    <p>{t("checkout.noAddresses")}</p>

                    <button
                      type="button"
                      className="pistakio-checkout-primary-button"
                      onClick={() => navigate("/account/addresses/new")}
                    >
                      <Plus size={17} />

                      {t("checkout.addAddress")}
                    </button>
                  </div>
                ) : (
                  <div className="pistakio-checkout-addresses">
                    {addresses.map((address) => {
                      const selected = selectedAddress === address.id

                      return (
                        <button
                          key={address.id}
                          type="button"
                          className={`pistakio-checkout-address ${
                            selected ? "selected" : ""
                          }`}
                          onClick={() => setSelectedAddress(address.id)}
                        >
                          <div className="pistakio-checkout-address-radio">
                            {selected && <Check size={14} />}
                          </div>

                          <div className="pistakio-checkout-address-content">
                            <div className="pistakio-checkout-address-title">
                              {address.addressLine1}
                            </div>

                            {address.addressLine2 && (
                              <div>{address.addressLine2}</div>
                            )}

                            <div>
                              {address.postalCode} {address.city}
                            </div>

                            <div>{address.country}</div>
                          </div>

                          {selected && (
                            <div className="pistakio-checkout-selected-label">
                              <Check size={14} />

                              <span>{t("checkout.selected")}</span>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </section>

              {/* NOTES */}

              <section className="pistakio-checkout-card">
                <div className="pistakio-checkout-card-header">
                  <div className="pistakio-checkout-section-icon pistakio-checkout-section-icon-pink">
                    <ShoppingBag size={20} />
                  </div>

                  <div>
                    <h2>{t("checkout.notes")}</h2>

                    <p>{t("checkout.notesDescription")}</p>
                  </div>
                </div>

                <textarea
                  className="pistakio-checkout-notes"
                  rows={5}
                  maxLength={500}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder={t("checkout.notesPlaceholder")}
                />

                <div className="pistakio-checkout-character-count">
                  {notes.length}/500
                </div>
              </section>
            </div>

            {/* =========================================
                RIGHT - SUMMARY
            ========================================= */}

            <aside className="pistakio-checkout-summary">
              <div className="pistakio-checkout-summary-card">
                <div className="pistakio-checkout-summary-header">
                  <div className="pistakio-checkout-summary-icon">
                    <ShoppingBag size={19} />
                  </div>

                  <div>
                    <h2>{t("checkout.summary")}</h2>

                    <span>
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                  </div>
                </div>

                {/* ITEMS */}

                <div className="pistakio-checkout-items">
                  {items.map((item) => (
                    <div key={item.id} className="pistakio-checkout-item">
                      <div className="pistakio-checkout-item-image">
                        {item.flavor.image ? (
                          <img src={item.flavor.image} alt={item.flavor.name} />
                        ) : (
                          <ShoppingBag size={20} />
                        )}
                      </div>

                      <div className="pistakio-checkout-item-info">
                        <strong>{item.flavor.name}</strong>

                        <span>
                          {item.tub.weight} g × {item.quantity}
                        </span>
                      </div>

                      <strong className="pistakio-checkout-item-price">
                        €{(item.tub.price * item.quantity).toFixed(2)}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="pistakio-checkout-divider" />

                {/* SUBTOTAL */}

                <div className="pistakio-checkout-price-row">
                  <span>{t("checkout.subtotal")}</span>

                  <strong>€ {subtotal.toFixed(2)}</strong>
                </div>

                {/* SHIPPING */}

                <div className="pistakio-checkout-price-row">
                  <span className="d-flex align-items-center gap-2">
                    <Truck size={15} />

                    {t("checkout.shipping")}
                  </span>

                  <strong>
                    {shippingCost === 0
                      ? t("checkout.free")
                      : `€ ${shippingCost.toFixed(2)}`}
                  </strong>
                </div>

                <div className="pistakio-checkout-divider" />

                {/* TOTAL */}

                <div className="pistakio-checkout-total">
                  <span>{t("cart.total")}</span>

                  <strong>€ {totalPrice.toFixed(2)}</strong>
                </div>

                {/* PAYMENT BUTTONS */}

                <div className="d-flex gap-2 mt-3">
                  <button
                    type="button"
                    className="pistakio-checkout-confirm flex-grow-1"
                    disabled={
                      submitting || addresses.length === 0 || !selectedAddress
                    }
                    onClick={(event) => handleSubmit(event, "STRIPE")}
                  >
                    <CreditCard size={18} />

                    {submitting && paymentMethod === "STRIPE"
                      ? t("checkout.processing")
                      : t("checkout.payWithStripe")}
                  </button>

                  <button
                    type="button"
                    className="pistakio-checkout-confirm flex-grow-1"
                    disabled={
                      submitting || addresses.length === 0 || !selectedAddress
                    }
                    onClick={(event) => handleSubmit(event, "PAYPAL")}
                  >
                    <Paypal size={18}></Paypal>

                    {submitting && paymentMethod === "PAYPAL"
                      ? t("checkout.processing")
                      : t("checkout.payWithPaypal")}
                  </button>
                </div>

                <p className="pistakio-checkout-secure">
                  <Check size={14} />

                  {t("checkout.securePayment")}
                </p>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </main>
  )
}

export default Checkout
