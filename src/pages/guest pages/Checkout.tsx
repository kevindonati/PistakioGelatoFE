import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ArrowLeft, Check, MapPin, Plus } from "lucide-react"

import { useCart } from "../../context/CartContext"

import { getAddresses } from "../../services/addressApi"
import {
  checkoutOrder,
  getShippingCost,
  createStripeCheckout,
} from "../../services/orderApi"

import type { Address } from "../../types/Address"

import Loading from "../../components/Loading"

function Checkout() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { items, order, loading: cartLoading } = useCart()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)

  const [notes, setNotes] = useState("")
  const [shippingCost, setShippingCost] = useState(0)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

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
      } catch (error) {
        console.error(error)
        setError(t("checkout.loadAddressesError"))
      } finally {
        setLoading(false)
      }
    }

    loadCheckoutData()
  }, [t])

  if (cartLoading || loading) {
    return <Loading />
  }

  if (!order || items.length === 0) {
    return (
      <main className="container py-5 text-center">
        <h1 className="mb-3">{t("checkout.title")}</h1>

        <p className="text-muted">{t("checkout.emptyCart")}</p>

        <button className="btn btn-dark" onClick={() => navigate("/cart")}>
          <ArrowLeft size={17} className="me-1" />
          {t("checkout.backToCart")}
        </button>
      </main>
    )
  }

  const subtotal = items.reduce(
    (total, item) => total + item.tub.price * item.quantity,
    0,
  )

  const totalPrice = subtotal + shippingCost

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

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

      await checkoutOrder(order.id, {
        address: selectedAddress,
        notes: notes.trim() || undefined,
      })

      const stripeResponse = await createStripeCheckout(order.id)

      window.location.href = stripeResponse.url
    } catch (error) {
      console.error(error)

      setError(t("checkout.error"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="container py-5">
      {/* HEADER */}

      <div className="mb-4">
        <button
          type="button"
          className="btn btn-outline-dark mb-3"
          onClick={() => navigate("/cart")}
        >
          <ArrowLeft size={17} className="me-1" />

          {t("checkout.backToCart")}
        </button>

        <h1>{t("checkout.title")}</h1>
      </div>

      {/* ERROR */}

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* LEFT */}

          <div className="col-12 col-lg-8">
            {/* DELIVERY ADDRESS */}

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="h5 mb-0">
                    <MapPin size={19} className="me-2" />

                    {t("checkout.deliveryAddress")}
                  </h2>

                  <button
                    type="button"
                    className="btn btn-outline-dark btn-sm"
                    onClick={() => navigate("/account/addresses/new")}
                  >
                    <Plus size={16} className="me-1" />

                    {t("checkout.newAddress")}
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">{t("checkout.noAddresses")}</p>

                    <button
                      type="button"
                      className="btn btn-dark"
                      onClick={() => navigate("/account/addresses/new")}
                    >
                      <Plus size={17} className="me-1" />

                      {t("checkout.addAddress")}
                    </button>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {addresses.map((address) => {
                      const selected = selectedAddress === address.id

                      return (
                        <button
                          key={address.id}
                          type="button"
                          className={`text-start btn p-3 ${
                            selected ? "btn-dark" : "btn-outline-dark"
                          }`}
                          onClick={() => setSelectedAddress(address.id)}
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <div className="fw-semibold mb-1">
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

                            {selected && <Check size={20} />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* NOTES */}

            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h2 className="h5 mb-3">{t("checkout.notes")}</h2>

                <textarea
                  className="form-control"
                  rows={5}
                  maxLength={500}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder={t("checkout.notesPlaceholder")}
                />

                <div className="text-end text-muted small mt-2">
                  {notes.length}/500
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}

          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h2 className="h5 mb-4">{t("checkout.summary")}</h2>

                {/* ITEMS */}

                <div className="d-flex flex-column gap-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="d-flex justify-content-between gap-3"
                    >
                      <div>
                        <div className="fw-semibold">{item.flavor.name}</div>

                        <small className="text-muted">
                          {item.tub.weight} g × {item.quantity}
                        </small>
                      </div>

                      <div className="text-nowrap">
                        €{(item.tub.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <hr />

                {/* SUBTOTAL */}

                <div className="d-flex justify-content-between mb-2">
                  <span>{t("checkout.subtotal")}</span>

                  <span>€ {subtotal.toFixed(2)}</span>
                </div>

                {/* SHIPPING */}

                <div className="d-flex justify-content-between mb-3">
                  <span>{t("checkout.shipping")}</span>

                  <span>
                    {shippingCost === 0
                      ? t("checkout.free")
                      : `€ ${shippingCost.toFixed(2)}`}
                  </span>
                </div>

                <hr />

                {/* TOTAL */}

                <div className="d-flex justify-content-between fw-bold fs-5 mb-4">
                  <span>{t("cart.total")}</span>

                  <span>€ {totalPrice.toFixed(2)}</span>
                </div>

                {/* CONFIRM */}

                <button
                  type="submit"
                  className="btn btn-dark w-100"
                  disabled={
                    submitting || addresses.length === 0 || !selectedAddress
                  }
                >
                  {submitting
                    ? t("checkout.processing")
                    : t("checkout.confirm")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </main>
  )
}

export default Checkout
