import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ArrowLeft, Save } from "lucide-react"

import api from "../../services/api"

function NewAddress() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [addressLine1, setAddressLine1] = useState("")
  const [addressLine2, setAddressLine2] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [city, setCity] = useState("")
  const [country, setCountry] = useState("Italy")

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      setLoading(true)
      setError("")

      await api.post("/addresses", {
        addressLine1,
        addressLine2: addressLine2 || null,
        postalCode,
        city,
        country,
      })

      navigate("/account/addresses")
    } catch (error) {
      console.error(error)
      setError(t("address.createError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container py-5">
      <div className="mb-4">
        <button
          type="button"
          className="btn btn-outline-dark mb-3"
          onClick={() => navigate("/checkout")}
        >
          <ArrowLeft size={17} className="me-1" />
          {t("address.backToCheckout")}
        </button>

        <h1>{t("address.title")}</h1>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* INDIRIZZO */}

                <div className="mb-3">
                  <label htmlFor="addressLine1" className="form-label">
                    {t("address.addressLine1")}
                  </label>

                  <input
                    id="addressLine1"
                    type="text"
                    className="form-control"
                    value={addressLine1}
                    onChange={(event) => setAddressLine1(event.target.value)}
                    required
                  />
                </div>

                {/* INTERNO / CITOFONO */}

                <div className="mb-3">
                  <label htmlFor="addressLine2" className="form-label">
                    {t("address.addressLine2")}
                  </label>

                  <input
                    id="addressLine2"
                    type="text"
                    className="form-control"
                    value={addressLine2}
                    onChange={(event) => setAddressLine2(event.target.value)}
                  />
                </div>

                {/* CAP */}

                <div className="mb-3">
                  <label htmlFor="postalCode" className="form-label">
                    {t("address.postalCode")}
                  </label>

                  <input
                    id="postalCode"
                    type="text"
                    className="form-control"
                    value={postalCode}
                    onChange={(event) => setPostalCode(event.target.value)}
                    required
                  />
                </div>

                {/* CITTÀ */}

                <div className="mb-3">
                  <label htmlFor="city" className="form-label">
                    {t("address.city")}
                  </label>

                  <input
                    id="city"
                    type="text"
                    className="form-control"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    required
                  />
                </div>

                {/* PAESE */}

                <div className="mb-4">
                  <label htmlFor="country" className="form-label">
                    {t("address.country")}
                  </label>

                  <input
                    id="country"
                    type="text"
                    className="form-control"
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    required
                  />
                </div>

                {/* BUTTONS */}

                <div className="pistakio-new-address-actions">
                  <button
                    type="button"
                    className="pistakio-new-address-cancel"
                    onClick={() => navigate("/account/addresses")}
                    disabled={loading}
                  >
                    {t("address.cancel")}
                  </button>

                  <button
                    type="submit"
                    className="btn btn-dark w-100"
                    disabled={loading}
                  >
                    <Save size={17} className="me-2" />

                    {loading ? t("address.saving") : t("address.save")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default NewAddress
