import {
  ShoppingBag,
  Users,
  Euro,
  Clock,
  ChefHat,
  Truck,
  CheckCircle,
  CalendarDays,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"
import api from "../../services/api"
import { ChartLineIcon } from "@phosphor-icons/react/dist/ssr"
import { Link } from "react-router-dom"

interface SalesPoint {
  label: string
  revenue: number
  orders: number
}

interface DashboardStats {
  totalOrders: number
  totalCustomers: number
  revenue: number
  averageOrderValue: number
  pendingPayments: number
  preparingOrders: number
  shippedOrders: number
  deliveredOrders: number
  newCustomers: number
  salesChart: SalesPoint[]
}

interface RecentSale {
  id: string
  createdAt: string
  total: number
  user: {
    name: string
    surname: string
    email: string
    id: string
  }
  orderStatus: string
}

type Period = "DAY" | "WEEK" | "MONTH" | "YEAR"

function AdminDashboard() {
  const { t, i18n } = useTranslation()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>("MONTH")
  const [offset, setOffset] = useState(0)
  const [recentSales, setRecentSales] = useState<RecentSale[]>([])

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)

        const response = await api.get<DashboardStats>(
          "/admin/dashboard/stats",
          {
            params: {
              period,
              offset,
            },
          },
        )

        setStats(response.data)
      } catch (error) {
        console.error("Error loading dashboard statistics:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [period, offset])

  useEffect(() => {
    const loadRecentSales = async () => {
      try {
        const response = await api.get("/orders", {
          params: {
            page: 0,
            size: 20,
            orderBy: "createdAt",
            direction: "desc",
          },
        })

        const sales = response.data.content
          .filter((order: RecentSale) => order.orderStatus !== "CART")
          .slice(0, 10)

        setRecentSales(sales)
        console.log(sales)
      } catch (error) {
        console.error("Error loading recent sales:", error)
      }
    }

    loadRecentSales()
  }, [])

  const formatRevenue = (value: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(value)
  }

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod)
    setOffset(0)
  }

  const handlePreviousPeriod = (newPeriod: Period) => {
    setPeriod(newPeriod)
    setOffset(-1)
  }

  const getPeriodLabel = () => {
    const now = new Date()

    const localeMap: Record<string, string> = {
      IT: "it-IT",
      EN: "en-GB",
      FR: "fr-FR",
      DE: "de-DE",
    }

    const locale = localeMap[i18n.language] || "it-IT"

    if (period === "DAY") {
      const date = new Date(now)
      date.setDate(date.getDate() + offset)

      return date.toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    }

    if (period === "WEEK") {
      const date = new Date(now)
      date.setDate(date.getDate() + offset * 7)

      const day = date.getDay()
      const diff = day === 0 ? -6 : 1 - day

      const monday = new Date(date)
      monday.setDate(date.getDate() + diff)

      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)

      const mondayText = monday.toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
      })

      const sundayText = sunday.toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })

      return `${mondayText} - ${sundayText}`
    }

    if (period === "MONTH") {
      const date = new Date(now.getFullYear(), now.getMonth() + offset, 1)

      return date.toLocaleDateString(locale, {
        month: "long",
        year: "numeric",
      })
    }

    const year = now.getFullYear() + offset

    return year.toString()
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="mb-1">{t("admin.dashboard.title")}</h1>

        <p className="text-muted mb-0">{t("admin.dashboard.subtitle")}</p>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <CalendarDays size={20} className="text-muted me-1" />

            <button
              type="button"
              className={`btn ${
                period === "DAY" && offset === 0
                  ? "btn-dark"
                  : "btn-outline-secondary"
              }`}
              onClick={() => handlePeriodChange("DAY")}
            >
              {t("admin.dashboard.day")}
            </button>

            <button
              type="button"
              className={`btn ${
                period === "WEEK" && offset === 0
                  ? "btn-dark"
                  : "btn-outline-secondary"
              }`}
              onClick={() => handlePeriodChange("WEEK")}
            >
              {t("admin.dashboard.week")}
            </button>

            <button
              type="button"
              className={`btn ${
                period === "MONTH" && offset === 0
                  ? "btn-dark"
                  : "btn-outline-secondary"
              }`}
              onClick={() => handlePeriodChange("MONTH")}
            >
              {t("admin.dashboard.month")}
            </button>

            <button
              type="button"
              className={`btn ${
                period === "YEAR" && offset === 0
                  ? "btn-dark"
                  : "btn-outline-secondary"
              }`}
              onClick={() => handlePeriodChange("YEAR")}
            >
              {t("admin.dashboard.year")}
            </button>

            <div className="vr mx-1 d-none d-md-block" />

            <button
              type="button"
              className={`btn ${
                period === "DAY" && offset === -1
                  ? "btn-dark"
                  : "btn-outline-secondary"
              }`}
              onClick={() => handlePreviousPeriod("DAY")}
            >
              {t("admin.dashboard.dayPrevious")}
            </button>

            <button
              type="button"
              className={`btn ${
                period === "WEEK" && offset === -1
                  ? "btn-dark"
                  : "btn-outline-secondary"
              }`}
              onClick={() => handlePreviousPeriod("WEEK")}
            >
              {t("admin.dashboard.weekPrevious")}
            </button>

            <button
              type="button"
              className={`btn ${
                period === "MONTH" && offset === -1
                  ? "btn-dark"
                  : "btn-outline-secondary"
              }`}
              onClick={() => handlePreviousPeriod("MONTH")}
            >
              {t("admin.dashboard.monthPrevious")}
            </button>

            <button
              type="button"
              className={`btn ${
                period === "YEAR" && offset === -1
                  ? "btn-dark"
                  : "btn-outline-secondary"
              }`}
              onClick={() => handlePreviousPeriod("YEAR")}
            >
              {t("admin.dashboard.yearPrevious")}
            </button>

            <span className="text-muted ms-auto">{getPeriodLabel()}</span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-md-6 col-xl-3">
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

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">
                    {t("admin.dashboard.customers")}
                  </p>

                  <h2 className="mb-0">
                    {loading ? "..." : (stats?.newCustomers ?? 0)}
                  </h2>
                </div>

                <Users size={32} className="text-muted" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
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

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">
                    {t("admin.dashboard.averageOrder")}
                  </p>

                  <h2 className="mb-0">
                    {loading
                      ? "..."
                      : formatRevenue(stats?.averageOrderValue ?? 0)}
                  </h2>
                </div>

                <Euro size={32} className="text-muted" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-1">
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

      <div className="card border-0 shadow-sm mt-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <div className="d-flex">
                <ChartLineIcon size={20} className="text-muted me-1" />
                <h5 className="mb-1">{t("admin.dashboard.recentSales")}</h5>
              </div>
              <p className="text-muted mb-0">
                {t("admin.dashboard.last10Sales")}
              </p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>{t("admin.dashboard.customer")}</th>
                  <th>{t("admin.dashboard.date")}</th>
                  <th>{t("admin.dashboard.order")}</th>
                  <th>{t("admin.dashboard.status")}</th>
                  <th className="text-end">{t("admin.dashboard.total")}</th>
                </tr>
              </thead>

              <tbody>
                {recentSales.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-4">
                      {t("admin.dashboard.noSales")}
                    </td>
                  </tr>
                ) : (
                  recentSales.map((sale) => (
                    <tr key={sale.id}>
                      <td>
                        <Link to={`/admin/customers/${sale.user.id}`}>
                          <strong>
                            {sale.user.name} {sale.user.surname}
                          </strong>
                        </Link>

                        <small className="d-block text-muted">
                          {sale.user.email}
                        </small>
                      </td>

                      <td>
                        {new Date(sale.createdAt).toLocaleString("it-IT")}
                      </td>

                      <td>#{sale.id.slice(0, 8).toUpperCase()}</td>

                      <td>{sale.orderStatus}</td>

                      <td className="text-end">
                        <strong>{formatRevenue(sale.total)}</strong>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
