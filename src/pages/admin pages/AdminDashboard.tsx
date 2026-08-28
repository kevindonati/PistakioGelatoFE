import {
  ShoppingBag,
  Users,
  Euro,
  Clock,
  ChefHat,
  Truck,
  CheckCircle,
} from "lucide-react"

import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"

import api from "../../services/api"

interface DashboardStats {
  totalOrders: number
  totalCustomers: number
  revenue: number
  pendingPayments: number
  preparingOrders: number
  shippedOrders: number
  deliveredOrders: number
}

function AdminDashboard() {
  const { t } = useTranslation()

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await api.get<DashboardStats>("/admin/dashboard/stats")

        setStats(response.data)
      } catch (error) {
        console.error("Error loading dashboard statistics:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const formatRevenue = (value: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(value)
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="mb-1">{t("admin.dashboard.title")}</h1>

        <p className="text-muted mb-0">{t("admin.dashboard.subtitle")}</p>
      </div>

      {/* STATISTICHE PRINCIPALI */}

      <div className="row g-4">
        {/* ORDINI */}

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">
                    {t("admin.dashboard.orders")}
                  </p>

                  <h2 className="mb-0">
                    {loading ? "..." : (stats?.totalOrders ?? 0)}
                  </h2>
                </div>

                <ShoppingBag size={32} className="text-muted" />
              </div>
            </div>
          </div>
        </div>

        {/* CLIENTI */}

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">
                    {t("admin.dashboard.customers")}
                  </p>

                  <h2 className="mb-0">
                    {loading ? "..." : (stats?.totalCustomers ?? 0)}
                  </h2>
                </div>

                <Users size={32} className="text-muted" />
              </div>
            </div>
          </div>
        </div>

        {/* FATTURATO */}

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">
                    {t("admin.dashboard.revenue")}
                  </p>

                  <h2 className="mb-0">
                    {loading ? "..." : formatRevenue(stats?.revenue ?? 0)}
                  </h2>
                </div>

                <Euro size={32} className="text-muted" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATISTICHE ORDINI */}

      <div className="row g-4 mt-1">
        {/* PAGAMENTI IN ATTESA */}

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">
                    {t("admin.dashboard.pendingPayments")}
                  </p>

                  <h2 className="mb-0">
                    {loading ? "..." : (stats?.pendingPayments ?? 0)}
                  </h2>
                </div>

                <Clock size={32} className="text-muted" />
              </div>
            </div>
          </div>
        </div>

        {/* IN PREPARAZIONE */}

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">
                    {t("admin.dashboard.preparingOrders")}
                  </p>

                  <h2 className="mb-0">
                    {loading ? "..." : (stats?.preparingOrders ?? 0)}
                  </h2>
                </div>

                <ChefHat size={32} className="text-muted" />
              </div>
            </div>
          </div>
        </div>

        {/* SPEDITI */}

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">
                    {t("admin.dashboard.shippedOrders")}
                  </p>

                  <h2 className="mb-0">
                    {loading ? "..." : (stats?.shippedOrders ?? 0)}
                  </h2>
                </div>

                <Truck size={32} className="text-muted" />
              </div>
            </div>
          </div>
        </div>

        {/* CONSEGNATI */}

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">
                    {t("admin.dashboard.deliveredOrders")}
                  </p>

                  <h2 className="mb-0">
                    {loading ? "..." : (stats?.deliveredOrders ?? 0)}
                  </h2>
                </div>

                <CheckCircle size={32} className="text-muted" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
