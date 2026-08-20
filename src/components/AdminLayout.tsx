import { Outlet, NavLink, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  ShoppingBag,
  IceCreamBowl,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Truck,
  CreditCard,
} from "lucide-react"
import { useState } from "react"
import { useAuth } from "../context/useAuth"
import { useTranslation } from "react-i18next"
import "../styles/Admin.css"

function AdminLayout() {
  const { logout } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div
      className={`admin-layout ${collapsed ? "admin-layout-collapsed" : ""}`}
    >
      {/* SIDEBAR */}

      <aside className="admin-sidebar">
        {/* LOGO */}

        <div className="admin-sidebar-header">
          {!collapsed && (
            <div className="admin-logo">
              <span className="admin-logo-pistakio">Pistakio</span>
              <span className="admin-logo-gelato">Gelato</span>
            </div>
          )}

          <button
            type="button"
            className="admin-collapse-button"
            onClick={() => setCollapsed((current) => !current)}
            title={collapsed ? "Apri menu" : "Chiudi menu"}
          >
            {collapsed ? <ChevronRight size={19} /> : <ChevronLeft size={19} />}
          </button>
        </div>

        {/* MENU */}

        <nav className="admin-nav">
          <AdminNavItem
            to="/admin"
            icon={<LayoutDashboard size={19} />}
            label={t("admin.sidebar.dashboard")}
            collapsed={collapsed}
            end
          />

          <div className="admin-section-title">
            {!collapsed && t("admin.sidebar.management")}
          </div>

          <AdminNavItem
            to="/admin/orders"
            icon={<ShoppingBag size={19} />}
            label={t("admin.sidebar.orders")}
            collapsed={collapsed}
          />

          <AdminNavItem
            to="/admin/catalog"
            icon={<IceCreamBowl size={19} />}
            label={t("admin.sidebar.catalog")}
            collapsed={collapsed}
          />

          <AdminNavItem
            to="/admin/customers"
            icon={<Users size={19} />}
            label={t("admin.sidebar.customers")}
            collapsed={collapsed}
          />

          <div className="admin-section-title">
            {!collapsed && t("admin.sidebar.store")}
          </div>

          <AdminNavItem
            to="/admin/shipments"
            icon={<Truck size={19} />}
            label={t("admin.sidebar.shipments")}
            collapsed={collapsed}
          />

          <AdminNavItem
            to="/admin/payments"
            icon={<CreditCard size={19} />}
            label={t("admin.sidebar.payments")}
            collapsed={collapsed}
          />

          <AdminNavItem
            to="/admin/settings"
            icon={<Settings size={19} />}
            label={t("admin.sidebar.settings")}
            collapsed={collapsed}
          />
        </nav>

        {/* LOGOUT */}

        <div className="admin-sidebar-footer">
          <button
            type="button"
            className="admin-logout"
            onClick={handleLogout}
            title={t("admin.sidebar.logout")}
          >
            <LogOut size={19} />

            {!collapsed && <span>{t("admin.sidebar.logout")}</span>}
          </button>
        </div>
      </aside>

      {/* CONTENUTO */}

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}

interface AdminNavItemProps {
  to: string
  icon: React.ReactNode
  label: string
  collapsed: boolean
  end?: boolean
}

function AdminNavItem({
  to,
  icon,
  label,
  collapsed,
  end = false,
}: AdminNavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
      title={collapsed ? label : undefined}
    >
      {icon}

      {!collapsed && <span>{label}</span>}
    </NavLink>
  )
}

export default AdminLayout
