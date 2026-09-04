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
import "../../styles/AdminDashboard.css"

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
    <div className="admin-dashboard">
      {/* HEADER */}
      <div className="admin-dashboard-header">
        <div>
          <h1>{t("admin.dashboard.title")}</h1>
          <p>{t("admin.dashboard.subtitle")}</p>
        </div>
      </div>

      {/* PERIODO */}
      <div className="admin-period-card">
        <div className="admin-period-content">
          <div className="admin-period-icon">
            <CalendarDays size={19} strokeWidth={1.7} />
          </div>

          <div className="admin-period-buttons">
            <button
              type="button"
              className={`admin-period-button ${
                period === "DAY" && offset === 0 ? "active" : ""
              }`}
              onClick={() => handlePeriodChange("DAY")}
            >
              {t("admin.dashboard.day")}
            </button>

            <button
              type="button"
              className={`admin-period-button ${
                period === "WEEK" && offset === 0 ? "active" : ""
              }`}
              onClick={() => handlePeriodChange("WEEK")}
            >
              {t("admin.dashboard.week")}
            </button>

            <button
              type="button"
              className={`admin-period-button ${
                period === "MONTH" && offset === 0 ? "active" : ""
              }`}
              onClick={() => handlePeriodChange("MONTH")}
            >
              {t("admin.dashboard.month")}
            </button>

            <button
              type="button"
              className={`admin-period-button ${
                period === "YEAR" && offset === 0 ? "active" : ""
              }`}
              onClick={() => handlePeriodChange("YEAR")}
            >
              {t("admin.dashboard.year")}
            </button>
          </div>

          <div className="admin-period-divider" />

          <div className="admin-period-buttons">
            <button
              type="button"
              className={`admin-period-button secondary ${
                period === "DAY" && offset === -1 ? "active" : ""
              }`}
              onClick={() => handlePreviousPeriod("DAY")}
            >
              {t("admin.dashboard.dayPrevious")}
            </button>

            <button
              type="button"
              className={`admin-period-button secondary ${
                period === "WEEK" && offset === -1 ? "active" : ""
              }`}
              onClick={() => handlePreviousPeriod("WEEK")}
            >
              {t("admin.dashboard.weekPrevious")}
            </button>

            <button
              type="button"
              className={`admin-period-button secondary ${
                period === "MONTH" && offset === -1 ? "active" : ""
              }`}
              onClick={() => handlePreviousPeriod("MONTH")}
            >
              {t("admin.dashboard.monthPrevious")}
            </button>

            <button
              type="button"
              className={`admin-period-button secondary ${
                period === "YEAR" && offset === -1 ? "active" : ""
              }`}
              onClick={() => handlePreviousPeriod("YEAR")}
            >
              {t("admin.dashboard.yearPrevious")}
            </button>
          </div>

          <span className="admin-period-label">{getPeriodLabel()}</span>
        </div>
      </div>

      {/* STATISTICHE PRINCIPALI */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div>
            <p>{t("admin.dashboard.orders")}</p>
            <h2>{loading ? "..." : (stats?.totalOrders ?? 0)}</h2>
          </div>

          <div className="admin-stat-icon">
            <ShoppingBag size={25} strokeWidth={1.6} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <p>{t("admin.dashboard.customers")}</p>
            <h2>{loading ? "..." : (stats?.newCustomers ?? 0)}</h2>
          </div>

          <div className="admin-stat-icon">
            <Users size={25} strokeWidth={1.6} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <p>{t("admin.dashboard.revenue")}</p>
            <h2>{loading ? "..." : formatRevenue(stats?.revenue ?? 0)}</h2>
          </div>

          <div className="admin-stat-icon">
            <Euro size={25} strokeWidth={1.6} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <p>{t("admin.dashboard.averageOrder")}</p>
            <h2>
              {loading ? "..." : formatRevenue(stats?.averageOrderValue ?? 0)}
            </h2>
          </div>

          <div className="admin-stat-icon">
            <Euro size={25} strokeWidth={1.6} />
          </div>
        </div>
      </div>

      {/* STATO ORDINI */}
      <div className="admin-stats-grid admin-status-grid">
        <div className="admin-stat-card">
          <div>
            <p>{t("admin.dashboard.pendingPayments")}</p>
            <h2>{loading ? "..." : (stats?.pendingPayments ?? 0)}</h2>
          </div>

          <div className="admin-stat-icon">
            <Clock size={25} strokeWidth={1.6} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <p>{t("admin.dashboard.preparingOrders")}</p>
            <h2>{loading ? "..." : (stats?.preparingOrders ?? 0)}</h2>
          </div>

          <div className="admin-stat-icon">
            <ChefHat size={25} strokeWidth={1.6} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <p>{t("admin.dashboard.shippedOrders")}</p>
            <h2>{loading ? "..." : (stats?.shippedOrders ?? 0)}</h2>
          </div>

          <div className="admin-stat-icon">
            <Truck size={25} strokeWidth={1.6} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <p>{t("admin.dashboard.deliveredOrders")}</p>
            <h2>{loading ? "..." : (stats?.deliveredOrders ?? 0)}</h2>
          </div>

          <div className="admin-stat-icon">
            <CheckCircle size={25} strokeWidth={1.6} />
          </div>
        </div>
      </div>

      {/* VENDITE RECENTI */}
      <div className="admin-sales-card">
        <div className="admin-sales-header">
          <div>
            <div className="admin-sales-title">
              <ChartLineIcon size={20} />
              <h2>{t("admin.dashboard.recentSales")}</h2>
            </div>

            <p>{t("admin.dashboard.last10Sales")}</p>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-sales-table">
            <thead>
              <tr>
                <th>{t("admin.dashboard.customer")}</th>
                <th>{t("admin.dashboard.date")}</th>
                <th>{t("admin.dashboard.order")}</th>
                <th>{t("admin.dashboard.status")}</th>
                <th className="admin-table-total">
                  {t("admin.dashboard.total")}
                </th>
              </tr>
            </thead>

            <tbody>
              {recentSales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-empty-sales">
                    {t("admin.dashboard.noSales")}
                  </td>
                </tr>
              ) : (
                recentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      <Link
                        to={`/admin/customers/${sale.user.id}`}
                        className="admin-customer-link"
                      >
                        <strong>
                          {sale.user.name} {sale.user.surname}
                        </strong>
                      </Link>

                      <small>{sale.user.email}</small>
                    </td>

                    <td className="admin-nowrap">
                      {new Date(sale.createdAt).toLocaleString(
                        i18n.language === "IT"
                          ? "it-IT"
                          : i18n.language === "EN"
                            ? "en-GB"
                            : i18n.language === "FR"
                              ? "fr-FR"
                              : "de-DE",
                      )}
                    </td>

                    <td>
                      <span className="admin-order-id">
                        #{sale.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>

                    <td>
                      <span className="admin-status-badge">
                        {sale.orderStatus}
                      </span>
                    </td>

                    <td className="admin-table-total">
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
  )
}

export default AdminDashboard
