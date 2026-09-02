import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Save, Truck } from "lucide-react"
import {
  getShippingSettings,
  updateShippingSettings,
  type ShippingSettings,
} from "../../services/settingsApi"
import "../../styles/AdminSettings.css"

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
      <div className="admin-settings">
        <div className="admin-settings-header">
          <div>
            <h1>{t("admin.settings.title")}</h1>
            <p>{t("admin.settings.subtitle")}</p>
          </div>
        </div>

        <div className="admin-settings-card">
          <div className="admin-settings-loading">
            <div className="admin-settings-loading-icon">
              <Truck size={24} />
            </div>

            <p>{t("admin.settings.loading")}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-settings">
      <div className="admin-settings-header">
        <div>
          <h1>{t("admin.settings.title")}</h1>
          <p>{t("admin.settings.subtitle")}</p>
        </div>
      </div>

      {error && <div className="admin-settings-error">{error}</div>}

      {success && (
        <div className="admin-settings-success">
          {t("admin.settings.saved")}
        </div>
      )}

      <div className="admin-settings-card">
        <div className="admin-settings-card-header">
          <div className="admin-settings-icon">
            <Truck size={24} />
          </div>

          <div>
            <h2>{t("admin.settings.shipping.title")}</h2>
            <p>{t("admin.settings.shipping.description")}</p>
          </div>
        </div>

        <div className="admin-settings-tiers">
          <div className="admin-settings-tier">
            <div className="admin-settings-tier-header">
              <div className="admin-settings-tier-number">1</div>

              <div>
                <h3>{t("admin.settings.shipping.tier1")}</h3>
                <p>{t("admin.settings.shipping.maxWeight")}</p>
              </div>
            </div>

            <div className="admin-settings-fields">
              <div className="admin-settings-field">
                <label htmlFor="weight1">
                  {t("admin.settings.shipping.maxWeight")}
                </label>

                <div className="admin-settings-input-wrapper">
                  <input
                    id="weight1"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={settings.weight1}
                    onChange={(event) =>
                      handleChange("weight1", event.target.value)
                    }
                  />

                  <span>kg</span>
                </div>
              </div>

              <div className="admin-settings-field">
                <label htmlFor="cost1">
                  {t("admin.settings.shipping.cost")}
                </label>

                <div className="admin-settings-input-wrapper currency">
                  <span>€</span>

                  <input
                    id="cost1"
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.cost1}
                    onChange={(event) =>
                      handleChange("cost1", event.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="admin-settings-tier">
            <div className="admin-settings-tier-header">
              <div className="admin-settings-tier-number">2</div>

              <div>
                <h3>{t("admin.settings.shipping.tier2")}</h3>
                <p>{t("admin.settings.shipping.maxWeight")}</p>
              </div>
            </div>

            <div className="admin-settings-fields">
              <div className="admin-settings-field">
                <label htmlFor="weight2">
                  {t("admin.settings.shipping.maxWeight")}
                </label>

                <div className="admin-settings-input-wrapper">
                  <input
                    id="weight2"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={settings.weight2}
                    onChange={(event) =>
                      handleChange("weight2", event.target.value)
                    }
                  />

                  <span>kg</span>
                </div>
              </div>

              <div className="admin-settings-field">
                <label htmlFor="cost2">
                  {t("admin.settings.shipping.cost")}
                </label>

                <div className="admin-settings-input-wrapper currency">
                  <span>€</span>

                  <input
                    id="cost2"
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.cost2}
                    onChange={(event) =>
                      handleChange("cost2", event.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="admin-settings-tier">
            <div className="admin-settings-tier-header">
              <div className="admin-settings-tier-number">3</div>

              <div>
                <h3>{t("admin.settings.shipping.tier3")}</h3>
                <p>{t("admin.settings.shipping.maxWeight")}</p>
              </div>
            </div>

            <div className="admin-settings-fields">
              <div className="admin-settings-field">
                <label htmlFor="weight3">
                  {t("admin.settings.shipping.maxWeight")}
                </label>

                <div className="admin-settings-input-wrapper">
                  <input
                    id="weight3"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={settings.weight3}
                    onChange={(event) =>
                      handleChange("weight3", event.target.value)
                    }
                  />

                  <span>kg</span>
                </div>
              </div>

              <div className="admin-settings-field">
                <label htmlFor="cost3">
                  {t("admin.settings.shipping.cost")}
                </label>

                <div className="admin-settings-input-wrapper currency">
                  <span>€</span>

                  <input
                    id="cost3"
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.cost3}
                    onChange={(event) =>
                      handleChange("cost3", event.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="admin-settings-tier admin-settings-tier-over">
            <div className="admin-settings-tier-header">
              <div className="admin-settings-tier-number">+</div>

              <div>
                <h3>{t("admin.settings.shipping.over")}</h3>
                <p>{t("admin.settings.shipping.cost")}</p>
              </div>
            </div>

            <div className="admin-settings-fields">
              <div className="admin-settings-field">
                <label htmlFor="costOver">
                  {t("admin.settings.shipping.cost")}
                </label>

                <div className="admin-settings-input-wrapper currency">
                  <span>€</span>

                  <input
                    id="costOver"
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.costOver}
                    onChange={(event) =>
                      handleChange("costOver", event.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-settings-footer">
          <button
            type="button"
            className="admin-settings-save-button"
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={17} />

            {saving ? t("admin.settings.saving") : t("admin.settings.save")}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
