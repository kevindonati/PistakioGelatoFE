import { useEffect, useState } from "react"
import { ArrowLeft, Home, MapPin, Save } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import {
  getAddressById,
  updateAddress,
  type AddressData,
} from "../../services/addressApi"
import "../../styles/EditAddress.css"

function EditAddress() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [form, setForm] = useState<AddressData>({
    addressLine1: "",
    addressLine2: "",
    postalCode: "",
    city: "",
    country: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(t("addresses.notFound"))
      setLoading(false)
      return
    }

    const loadAddress = async () => {
      try {
        setLoading(true)
        setError("")

        const address = await getAddressById(id)

        setForm({
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 ?? "",
          postalCode: address.postalCode,
          city: address.city,
          country: address.country,
        })
      } catch (error) {
        console.error(error)

        setError(t("addresses.loadAddressError"))
      } finally {
        setLoading(false)
      }
    }

    loadAddress()
  }, [id, t])

  const handleChange = (field: keyof AddressData, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))

    setError("")
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!id) {
      return
    }

    try {
      setSaving(true)
      setError("")

      await updateAddress(id, form)

      navigate("/account/addresses")
    } catch (error) {
      console.error(error)

      setError(t("addresses.updateError"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="pistakio-edit-address bg-body-tertiary">
        <div className="container">
          <div className="pistakio-edit-address-loading">
            <div className="pistakio-edit-address-loading-icon">
              <MapPin size={25} />
            </div>

            <p>{t("common.loading")}</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="pistakio-edit-address">
      <div className="container">
        {/* HEADER */}

        <section className="pistakio-edit-address-header">
          <div>
            <button
              type="button"
              className="pistakio-edit-address-back"
              onClick={() => navigate("/account/addresses")}
            >
              <ArrowLeft size={17} />

              {t("addresses.backToAddresses")}
            </button>

            <h1>{t("addresses.editTitle")}</h1>

            <p>{t("addresses.editSubtitle")}</p>
          </div>
        </section>

        {/* ERROR */}

        {error && <div className="pistakio-edit-address-alert">{error}</div>}

        {/* CONTENT */}

        <div className="pistakio-edit-address-layout">
          {/* FORM */}

          <section className="pistakio-edit-address-card">
            <div className="pistakio-edit-address-card-heading">
              <div className="pistakio-edit-address-icon">
                <MapPin size={20} />
              </div>

              <div>
                <h2>{t("address.addressInformation")}</h2>

                <span>{t("address.addressInformationDescription")}</span>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="pistakio-edit-address-form"
            >
              {/* ADDRESS */}

              <div className="pistakio-edit-address-field">
                <label htmlFor="edit-addressLine1">
                  {t("address.addressLine1")}
                </label>

                <div className="pistakio-edit-address-input">
                  <Home size={17} />

                  <input
                    id="edit-addressLine1"
                    type="text"
                    value={form.addressLine1}
                    onChange={(event) =>
                      handleChange("addressLine1", event.target.value)
                    }
                    placeholder={t("address.addressLine1Placeholder")}
                    autoComplete="street-address"
                    required
                  />
                </div>
              </div>

              {/* ADDRESS LINE 2 */}

              <div className="pistakio-edit-address-field">
                <label htmlFor="edit-addressLine2">
                  {t("address.addressLine2")}
                </label>

                <div className="pistakio-edit-address-input">
                  <MapPin size={17} />

                  <input
                    id="edit-addressLine2"
                    type="text"
                    value={form.addressLine2}
                    onChange={(event) =>
                      handleChange("addressLine2", event.target.value)
                    }
                    placeholder={t("address.addressLine2Placeholder")}
                    autoComplete="address-line2"
                  />
                </div>
              </div>

              {/* POSTAL CODE + CITY */}

              <div className="pistakio-edit-address-row">
                <div className="pistakio-edit-address-field">
                  <label htmlFor="edit-postalCode">
                    {t("address.postalCode")}
                  </label>

                  <input
                    id="edit-postalCode"
                    type="text"
                    value={form.postalCode}
                    onChange={(event) =>
                      handleChange("postalCode", event.target.value)
                    }
                    placeholder={t("address.postalCodePlaceholder")}
                    autoComplete="postal-code"
                    required
                  />
                </div>

                <div className="pistakio-edit-address-field">
                  <label htmlFor="edit-city">{t("address.city")}</label>

                  <input
                    id="edit-city"
                    type="text"
                    value={form.city}
                    onChange={(event) =>
                      handleChange("city", event.target.value)
                    }
                    placeholder={t("address.cityPlaceholder")}
                    autoComplete="address-level2"
                    required
                  />
                </div>
              </div>

              {/* COUNTRY */}

              <div className="pistakio-edit-address-field">
                <label htmlFor="edit-country">{t("address.country")}</label>

                <input
                  id="edit-country"
                  type="text"
                  value={form.country}
                  onChange={(event) =>
                    handleChange("country", event.target.value)
                  }
                  placeholder={t("address.countryPlaceholder")}
                  autoComplete="country-name"
                  required
                />
              </div>

              {/* ACTIONS */}

              <div className="pistakio-edit-address-actions">
                <button
                  type="button"
                  className="pistakio-edit-address-cancel"
                  onClick={() => navigate("/account/addresses")}
                  disabled={saving}
                >
                  {t("address.cancel")}
                </button>

                <button
                  type="submit"
                  className="pistakio-edit-address-save"
                  disabled={saving}
                >
                  <Save size={17} />

                  {saving ? t("address.saving") : t("address.saveChanges")}
                </button>
              </div>
            </form>
          </section>

          {/* SIDE INFO */}

          <aside className="pistakio-edit-address-info">
            <div className="pistakio-edit-address-info-icon">
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

export default EditAddress
