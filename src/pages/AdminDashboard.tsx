import { ShoppingBag, Users, Euro } from "lucide-react"
import { useTranslation } from "react-i18next"

function AdminDashboard() {
  const { t } = useTranslation()

  return (
    <div>
      <div className="mb-4">
        <h1 className="mb-1">{t("admin.dashboard.title")}</h1>

        <p className="text-muted mb-0">{t("admin.dashboard.subtitle")}</p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">
                    {t("admin.dashboard.orders")}
                  </p>

                  <h2 className="mb-0">0</h2>
                </div>

                <ShoppingBag size={32} className="text-muted" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">
                    {t("admin.dashboard.customers")}
                  </p>

                  <h2 className="mb-0">0</h2>
                </div>

                <Users size={32} className="text-muted" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">
                    {t("admin.dashboard.revenue")}
                  </p>

                  <h2 className="mb-0">€ 0,00</h2>
                </div>

                <Euro size={32} className="text-muted" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
