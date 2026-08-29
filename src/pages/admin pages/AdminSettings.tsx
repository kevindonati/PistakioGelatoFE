import { useEffect, useState } from "react"

import { useTranslation } from "react-i18next"

import { Save, Truck } from "lucide-react"

import {
  getShippingSettings,
  updateShippingSettings,
  type ShippingSettings,
} from "../../services/settingsApi"

function AdminSettings() {
  const { t } = useTranslation()

  const [settings, setSettings] = useState<ShippingSettings>({
    weight1: 5,
    cost1: 5,
    weight2: 10,
    cost2: 7,
    weight3: 20,
    cost3: 10,
    costOver: 15,
  })

  const [loading, setLoading] = useState(true)

  const [saving, setSaving] = useState(false)

  const [success, setSuccess] = useState(false)

  const [error, setError] = useState("")

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true)
        setError("")

        const data = await getShippingSettings()

        setSettings(data)
      } catch (error) {
        console.error(error)

        setError(t("admin.settings.loadError"))
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [t])

  const handleChange = (field: keyof ShippingSettings, value: string) => {
    setSettings((current) => ({
      ...current,
      [field]: Number(value),
    }))

    setSuccess(false)
    setError("")
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setSuccess(false)
      setError("")

      const updated = await updateShippingSettings(settings)

      setSettings(updated)

      setSuccess(true)
    } catch (error) {
      console.error(error)

      setError(t("admin.settings.saveError"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div>
        <div className="mb-4">
          <h1 className="mb-1">{t("admin.settings.title")}</h1>

          <p className="text-muted mb-0">{t("admin.settings.subtitle")}</p>
        </div>

        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <p className="text-muted mb-0">{t("admin.settings.loading")}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="mb-1">{t("admin.settings.title")}</h1>

        <p className="text-muted mb-0">{t("admin.settings.subtitle")}</p>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-3 mb-4">
            <div>
              <Truck size={28} className="text-muted" />
            </div>

            <div>
              <h2 className="h5 mb-1">{t("admin.settings.shipping.title")}</h2>

              <p className="text-muted mb-0">
                {t("admin.settings.shipping.description")}
              </p>
            </div>
          </div>

          {/* FASCIA 1 */}

          <div className="border rounded p-3 mb-3">
            <h3 className="h6 mb-3">{t("admin.settings.shipping.tier1")}</h3>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">
                  {t("admin.settings.shipping.maxWeight")}
                </label>

                <div className="input-group">
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    className="form-control"
                    value={settings.weight1}
                    onChange={(event) =>
                      handleChange("weight1", event.target.value)
                    }
                  />

                  <span className="input-group-text">kg</span>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">
                  {t("admin.settings.shipping.cost")}
                </label>

                <div className="input-group">
                  <span className="input-group-text">€</span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    value={settings.cost1}
                    onChange={(event) =>
                      handleChange("cost1", event.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* FASCIA 2 */}

          <div className="border rounded p-3 mb-3">
            <h3 className="h6 mb-3">{t("admin.settings.shipping.tier2")}</h3>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">
                  {t("admin.settings.shipping.maxWeight")}
                </label>

                <div className="input-group">
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    className="form-control"
                    value={settings.weight2}
                    onChange={(event) =>
                      handleChange("weight2", event.target.value)
                    }
                  />

                  <span className="input-group-text">kg</span>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">
                  {t("admin.settings.shipping.cost")}
                </label>

                <div className="input-group">
                  <span className="input-group-text">€</span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    value={settings.cost2}
                    onChange={(event) =>
                      handleChange("cost2", event.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* FASCIA 3 */}

          <div className="border rounded p-3 mb-3">
            <h3 className="h6 mb-3">{t("admin.settings.shipping.tier3")}</h3>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">
                  {t("admin.settings.shipping.maxWeight")}
                </label>

                <div className="input-group">
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    className="form-control"
                    value={settings.weight3}
                    onChange={(event) =>
                      handleChange("weight3", event.target.value)
                    }
                  />

                  <span className="input-group-text">kg</span>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">
                  {t("admin.settings.shipping.cost")}
                </label>

                <div className="input-group">
                  <span className="input-group-text">€</span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    value={settings.cost3}
                    onChange={(event) =>
                      handleChange("cost3", event.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* OLTRE */}

          <div className="border rounded p-3 mb-4">
            <h3 className="h6 mb-3">{t("admin.settings.shipping.over")}</h3>

            <div className="row">
              <div className="col-12 col-md-6">
                <label className="form-label">
                  {t("admin.settings.shipping.cost")}
                </label>

                <div className="input-group">
                  <span className="input-group-text">€</span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    value={settings.costOver}
                    onChange={(event) =>
                      handleChange("costOver", event.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* MESSAGGI */}

          {error && <div className="alert alert-danger mb-3">{error}</div>}

          {success && (
            <div className="alert alert-success mb-3">
              {t("admin.settings.saved")}
            </div>
          )}

          {/* SALVA */}

          <div className="d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={17} />

              {saving ? t("admin.settings.saving") : t("admin.settings.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
