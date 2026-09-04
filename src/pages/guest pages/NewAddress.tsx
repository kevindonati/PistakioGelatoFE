import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ArrowLeft, Home, MapPin, Save } from "lucide-react"
import api from "../../services/api"
import "../../styles/NewAddresses.css"

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
    <main className="pistakio-new-address">
      <div className="container">
        {/* HEADER */}

        <section className="pistakio-new-address-header">
          <div>
            <button
              type="button"
              className="pistakio-new-address-back"
              onClick={() => navigate("/checkout")}
            >
              <ArrowLeft size={17} />

              {t("address.backToCheckout")}
            </button>
            <h1>{t("address.title")}</h1>

            <p>{t("address.subtitle")}</p>
          </div>
        </section>

        {/* ERROR */}

        {error && <div className="pistakio-new-address-alert">{error}</div>}

        {/* CONTENT */}

        <div className="pistakio-new-address-layout">
          {/* FORM */}

          <section className="pistakio-new-address-card">
            <div className="pistakio-new-address-card-heading">
              <div className="pistakio-new-address-icon">
                <MapPin size={20} />
              </div>

              <div>
                <h2>{t("address.addressInformation")}</h2>

                <span>{t("address.addressInformationDescription")}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="pistakio-new-address-form">
              {/* ADDRESS */}

              <div className="pistakio-new-address-field">
                <label htmlFor="addressLine1">
                  {t("address.addressLine1")}
                </label>

                <div className="pistakio-new-address-input">
                  <Home size={17} />

                  <input
                    id="addressLine1"
                    type="text"
                    value={addressLine1}
                    onChange={(event) => setAddressLine1(event.target.value)}
                    placeholder={t("address.addressLine1Placeholder")}
                    autoComplete="street-address"
                    required
                  />
                </div>
              </div>

              {/* INTERNO */}

              <div className="pistakio-new-address-field">
                <label htmlFor="addressLine2">
                  {t("address.addressLine2")}
                </label>

                <div className="pistakio-new-address-input">
                  <MapPin size={17} />

                  <input
                    id="addressLine2"
                    type="text"
                    value={addressLine2}
                    onChange={(event) => setAddressLine2(event.target.value)}
                    placeholder={t("address.addressLine2Placeholder")}
                    autoComplete="address-line2"
                  />
                </div>
              </div>

              {/* CAP + CITY' */}

              <div className="pistakio-new-address-row">
                <div className="pistakio-new-address-field">
                  <label htmlFor="postalCode">{t("address.postalCode")}</label>

                  <input
                    id="postalCode"
                    type="text"
                    value={postalCode}
                    onChange={(event) => setPostalCode(event.target.value)}
                    placeholder={t("address.postalCodePlaceholder")}
                    autoComplete="postal-code"
                    required
                  />
                </div>

                <div className="pistakio-new-address-field">
                  <label htmlFor="city">{t("address.city")}</label>

                  <input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    placeholder={t("address.cityPlaceholder")}
                    autoComplete="address-level2"
                    required
                  />
                </div>
              </div>

              {/* NATION */}

              <div className="pistakio-new-address-field">
                <label htmlFor="country">{t("address.country")}</label>

                <input
                  id="country"
                  type="text"
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  placeholder={t("address.countryPlaceholder")}
                  autoComplete="country-name"
                  required
                />
              </div>

              {/* BUTTONS */}

              <div className="pistakio-new-address-actions">
                <button
                  type="button"
                  className="pistakio-new-address-cancel"
                  onClick={() => navigate("/checkout")}
                  disabled={loading}
                >
                  {t("address.cancel")}
                </button>

                <button
                  type="submit"
                  className="pistakio-new-address-save"
                  disabled={loading}
                >
                  <Save size={17} />

                  {loading ? t("address.saving") : t("address.save")}
                </button>
              </div>
            </form>
          </section>

          {/* SIDE INFO */}

          <aside className="pistakio-new-address-info">
            <div className="pistakio-new-address-info-icon">
              <MapPin size={22} />
            </div>

            <h2>{t("address.deliveryTitle")}</h2>

            <p>{t("address.deliveryDescription")}</p>
          </aside>
        </div>
      </div>
    </main>
  )
}

export default NewAddress
