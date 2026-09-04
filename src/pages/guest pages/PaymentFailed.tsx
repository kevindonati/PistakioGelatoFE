import { Link, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ArrowLeft, CreditCard, RefreshCcw, X } from "lucide-react"
import { useEffect, useState } from "react"

import "../../styles/PaymentSuccess.css"

import {
  createStripeCheckout,
  createPaypalOrder,
  failPayment,
} from "../../services/orderApi"
import { Paypal } from "react-bootstrap-icons"

function PaymentFailed() {
  const { t } = useTranslation()

  const [searchParams] = useSearchParams()

  const orderId = searchParams.get("orderId")
  const provider = searchParams.get("provider")

  const [paymentLoading, setPaymentLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!orderId) {
      return
    }

    const markPaymentAsFailed = async () => {
      try {
        await failPayment(orderId)
      } catch (error) {
        console.error(error)
      }
    }

    markPaymentAsFailed()
  }, [orderId])

  const handleStripePayment = async () => {
    if (!orderId) {
      setError(t("orderDetails.paymentError"))
      return
    }

    try {
      setPaymentLoading(true)
      setError("")

      const response = await createStripeCheckout(orderId)

      window.location.href = response.url
    } catch (error) {
      console.error(error)

      setError(t("orderDetails.paymentError"))

      setPaymentLoading(false)
    }
  }

  const handlePaypalPayment = async () => {
    if (!orderId) {
      setError(t("orderDetails.paymentError"))
      return
    }

    try {
      setPaymentLoading(true)
      setError("")

      const response = await createPaypalOrder(orderId)

      window.location.href = response.approvalUrl
    } catch (error) {
      console.error(error)

      setError(t("orderDetails.paymentError"))

      setPaymentLoading(false)
    }
  }

  return (
    <main className="pistakio-payment">
      <div className="container">
        <div className="pistakio-payment-wrapper">
          <section className="pistakio-payment-hero is-failed">
            <div className="pistakio-payment-check">
              <X size={40} />
            </div>

            <h1>{t("paymentFailed.title")}</h1>

            <p>{t("paymentFailed.message")}</p>
          </section>

          <section className="pistakio-payment-card">
            <div className="pistakio-payment-card-header">
              <div className="pistakio-payment-section-icon">
                <CreditCard size={20} />
              </div>

              <div>
                <h2>{t("paymentFailed.payment")}</h2>

                <p>{t("paymentFailed.paymentDescription")}</p>
              </div>
            </div>

            <div className="pistakio-payment-pending-alert">
              {t("paymentFailed.warning")}
            </div>

            {orderId && (
              <div className="pistakio-payment-order-id">
                <span>{t("paymentFailed.orderId")}</span>

                <strong>{orderId}</strong>
              </div>
            )}
          </section>

          <div className="pistakio-payment-actions">
            {orderId && (
              <Link
                to={`/checkout?orderId=${orderId}`}
                className="pistakio-payment-primary-button"
              >
                <RefreshCcw size={17} />

                {t("paymentFailed.choosePayment")}
              </Link>
            )}

            {orderId && provider === "STRIPE" && (
              <button
                type="button"
                className="pistakio-payment-secondary-button"
                onClick={handleStripePayment}
                disabled={paymentLoading}
              >
                <CreditCard
                  size={17}
                  className={paymentLoading ? "spin" : ""}
                />

                {paymentLoading
                  ? t("paymentFailed.processing")
                  : t("paymentFailed.retryStripe")}
              </button>
            )}

            {orderId && provider === "PAYPAL" && (
              <button
                type="button"
                className="pistakio-payment-secondary-button"
                onClick={handlePaypalPayment}
                disabled={paymentLoading}
              >
                <Paypal size={17} className={paymentLoading ? "spin" : ""} />

                {paymentLoading
                  ? t("paymentFailed.processing")
                  : t("paymentFailed.retryPaypal")}
              </button>
            )}

            {error && (
              <div className="pistakio-order-error-message">{error}</div>
            )}

            <Link to="/catalog" className="pistakio-payment-secondary-button">
              <ArrowLeft size={17} />
              {t("paymentFailed.backToCatalog")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default PaymentFailed
