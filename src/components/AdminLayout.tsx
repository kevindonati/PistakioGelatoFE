import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  ShoppingBag,
  IceCreamBowl,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Truck,
  CreditCard,
  Box,
  Tags,
} from "lucide-react"
import { useState } from "react"
import { useAuth } from "../context/useAuth"
import { useTranslation } from "react-i18next"
import "../styles/Admin.css"
import logo from "../assets/LOGO CON SCRITTA PIST DEF NOBG.png"

function AdminLayout() {
  const { logout } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const [collapsed, setCollapsed] = useState(false)

  const isCatalogActive = location.pathname.startsWith("/admin/catalog")

  const [catalogOpen, setCatalogOpen] = useState(isCatalogActive)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleCatalogClick = () => {
    if (collapsed) {
      setCollapsed(false)
      setCatalogOpen(true)
      return
    }

    setCatalogOpen((current) => !current)
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
            <img src={logo} alt="logo pistakio gelato" className="admin-logo" />
          )}

          <button
            type="button"
            className="admin-collapse-button"
            onClick={() => setCollapsed((current) => !current)}
            title={
              collapsed
                ? t("admin.sidebar.openMenu")
                : t("admin.sidebar.closeMenu")
            }
          >
            {collapsed ? <ChevronRight size={19} /> : <ChevronLeft size={19} />}
          </button>
        </div>

        {/* MENU */}

        <nav className="admin-nav">
          {/* DASHBOARD */}

          <AdminNavItem
            to="/admin"
            icon={<LayoutDashboard size={19} />}
            label={t("admin.sidebar.dashboard")}
            collapsed={collapsed}
            end
          />

          {/* GESTIONE */}

          {!collapsed && (
            <div className="admin-section-title">
              {t("admin.sidebar.management")}
            </div>
          )}

          <AdminNavItem
            to="/admin/orders"
            icon={<ShoppingBag size={19} />}
            label={t("admin.sidebar.orders")}
            collapsed={collapsed}
          />

          {/* CATALOGO */}

          {!collapsed && (
            <button
              type="button"
              className={`admin-nav-item admin-catalog-button ${
                isCatalogActive ? "active" : ""
              }`}
              onClick={handleCatalogClick}
            >
              <IceCreamBowl size={19} />

              <span className="flex-grow-1 text-start">
                {t("admin.sidebar.catalog")}
              </span>

              <ChevronDown
                size={17}
                className={catalogOpen ? "admin-chevron-open" : ""}
              />
            </button>
          )}

          {/* CATALOGO COLLAPSED */}

          {collapsed && (
            <button
              type="button"
              className={`admin-nav-item admin-catalog-button ${
                isCatalogActive ? "active" : ""
              }`}
              onClick={handleCatalogClick}
              title={t("admin.sidebar.catalog")}
            >
              <IceCreamBowl size={19} />
            </button>
          )}

          {/* SOTTO MENU CATALOGO */}

          {!collapsed && catalogOpen && (
            <div className="admin-submenu">
              <AdminSubNavItem
                to="/admin/catalog/flavors"
                icon={<IceCreamBowl size={16} />}
                label={t("admin.sidebar.flavors")}
              />

              <AdminSubNavItem
                to="/admin/catalog/tubs"
                icon={<Box size={16} />}
                label={t("admin.sidebar.tubs")}
              />

              <AdminSubNavItem
                to="/admin/catalog/categories"
                icon={<Tags size={16} />}
                label={t("admin.sidebar.categories")}
              />
            </div>
          )}

          {/* CLIENTI */}

          <AdminNavItem
            to="/admin/customers"
            icon={<Users size={19} />}
            label={t("admin.sidebar.customers")}
            collapsed={collapsed}
          />

          {/* NEGOZIO */}

          {!collapsed && (
            <div className="admin-section-title">
              {t("admin.sidebar.store")}
            </div>
          )}

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

/* -------------------------------------------------------------------------- */
/* MAIN NAV ITEM */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* CATALOG SUB ITEM */
/* -------------------------------------------------------------------------- */

interface AdminSubNavItemProps {
  to: string
  icon: React.ReactNode
  label: string
}

function AdminSubNavItem({ to, icon, label }: AdminSubNavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `admin-subnav-item ${isActive ? "active" : ""}`
      }
    >
      {icon}

      <span>{label}</span>
    </NavLink>
  )
}

export default AdminLayout
