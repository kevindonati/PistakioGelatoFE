import { useEffect, useState } from "react"
import { ArrowLeft, Save } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"

import {
  getAddressById,
  updateAddress,
  type AddressData,
} from "../../services/addressApi"

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
      <main className="container py-5">
        <div className="text-center">{t("common.loading")}</div>
      </main>
    )
  }

  return (
    <main className="container py-5">
      <div className="mx-auto" style={{ maxWidth: "720px" }}>
        <button
          type="button"
          className="btn btn-link text-dark p-0 mb-3"
          onClick={() => navigate("/account/addresses")}
        >
          <ArrowLeft size={16} className="me-1" />
          {t("addresses.backToAddresses")}
        </button>

        <div className="mb-4">
          <h1 className="mb-1">{t("addresses.editTitle")}</h1>

          <p className="text-muted mb-0">{t("addresses.editSubtitle")}</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">
                    {t("address.addressLine1")}
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={form.addressLine1}
                    onChange={(event) =>
                      handleChange("addressLine1", event.target.value)
                    }
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">
                    {t("address.addressLine2")}
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={form.addressLine2}
                    onChange={(event) =>
                      handleChange("addressLine2", event.target.value)
                    }
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label">
                    {t("address.postalCode")}
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={form.postalCode}
                    onChange={(event) =>
                      handleChange("postalCode", event.target.value)
                    }
                    required
                  />
                </div>

                <div className="col-12 col-md-8">
                  <label className="form-label">{t("address.city")}</label>

                  <input
                    type="text"
                    className="form-control"
                    value={form.city}
                    onChange={(event) =>
                      handleChange("city", event.target.value)
                    }
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">{t("address.country")}</label>

                  <input
                    type="text"
                    className="form-control"
                    value={form.country}
                    onChange={(event) =>
                      handleChange("country", event.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => navigate("/account/addresses")}
                  disabled={saving}
                >
                  {t("address.cancel")}
                </button>

                <button
                  type="submit"
                  className="btn btn-dark"
                  disabled={saving}
                >
                  <Save size={17} className="me-2" />

                  {saving ? t("address.saving") : t("address.saveChanges")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}

export default EditAddress
