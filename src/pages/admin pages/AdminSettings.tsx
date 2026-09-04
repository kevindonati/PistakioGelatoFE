import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Save, Truck, Wrench } from "lucide-react"
import {
  getShippingSettings,
  updateShippingSettings,
  getMaintenanceMode,
  updateMaintenanceMode,
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

  const [maintenanceMode, setMaintenanceMode] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingMaintenance, setSavingMaintenance] = useState(false)

  const [success, setSuccess] = useState(false)
  const [maintenanceSuccess, setMaintenanceSuccess] = useState(false)

  const [error, setError] = useState("")
  const [maintenanceError, setMaintenanceError] = useState("")

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true)
        setError("")

        const [shippingData, maintenanceData] = await Promise.all([
          getShippingSettings(),
          getMaintenanceMode(),
        ])

        setSettings(shippingData)
        setMaintenanceMode(maintenanceData)
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

  const handleMaintenanceToggle = async () => {
    const newValue = !maintenanceMode

    try {
      setSavingMaintenance(true)
      setMaintenanceSuccess(false)
      setMaintenanceError("")

      const updated = await updateMaintenanceMode(newValue)

      setMaintenanceMode(updated)
      setMaintenanceSuccess(true)
    } catch (error) {
      console.error(error)
      setMaintenanceError(t("admin.settings.maintenance.saveError"))
    } finally {
      setSavingMaintenance(false)
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

      <div className="admin-settings-maintenance">
        <div className="admin-settings-maintenance-header">
          <div className="admin-settings-maintenance-icon">
            <Wrench size={24} />
          </div>

          <div>
            <h2>{t("admin.settings.maintenance.title")}</h2>
            <p>{t("admin.settings.maintenance.description")}</p>
          </div>
        </div>

        {maintenanceError && (
          <div className="admin-settings-error">{maintenanceError}</div>
        )}

        {maintenanceSuccess && (
          <div className="admin-settings-success">
            {t("admin.settings.maintenance.saved")}
          </div>
        )}

        <div className="admin-settings-maintenance-content">
          <div className="admin-settings-maintenance-info">
            <div className="admin-settings-maintenance-status">
              <span
                className={`admin-settings-maintenance-status-dot ${
                  maintenanceMode ? "active" : ""
                }`}
              />

              {maintenanceMode
                ? t("admin.settings.maintenance.active")
                : t("admin.settings.maintenance.inactive")}
            </div>

            <p className="admin-settings-maintenance-description">
              {maintenanceMode
                ? t("admin.settings.maintenance.activeDescription")
                : t("admin.settings.maintenance.inactiveDescription")}
            </p>
          </div>

          <button
            type="button"
            className={`admin-settings-maintenance-toggle ${
              maintenanceMode ? "active" : ""
            }`}
            onClick={handleMaintenanceToggle}
            disabled={savingMaintenance}
            aria-label={
              maintenanceMode
                ? t("admin.settings.maintenance.disable")
                : t("admin.settings.maintenance.enable")
            }
            aria-pressed={maintenanceMode}
          />
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
