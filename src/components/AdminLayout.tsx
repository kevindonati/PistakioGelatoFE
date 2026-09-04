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
  Box,
  Tags,
  Home,
  Languages,
  Bell,
} from "lucide-react"

import { useEffect, useRef, useState } from "react"

import { useAuth } from "../context/useAuth"

import { useTranslation } from "react-i18next"

import {
  getAdminNotifications,
  markAdminOrderNotificationsAsRead,
  markAdminCustomerNotificationsAsRead,
  type AdminNotifications,
} from "../services/orderApi"

import "../styles/Admin.css"

import logo from "../assets/LOGO CON SCRITTA PIST DEF NOBG.png"

function AdminLayout() {
  const { logout } = useAuth()

  const { t, i18n } = useTranslation()

  const navigate = useNavigate()

  const location = useLocation()

  const [collapsed, setCollapsed] = useState(false)

  const isCatalogActive = location.pathname.startsWith("/admin/catalog")

  const [catalogOpen, setCatalogOpen] = useState(isCatalogActive)

  const [notifications, setNotifications] = useState<AdminNotifications | null>(
    null,
  )

  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const [notificationTab, setNotificationTab] = useState<
    "orders" | "customers"
  >("orders")

  const notificationsRef = useRef<HTMLDivElement>(null)

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

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const language = event.target.value

    i18n.changeLanguage(language)

    localStorage.setItem("language", language)
  }

  const loadNotifications = async () => {
    try {
      const data = await getAdminNotifications()

      setNotifications(data)
    } catch (error) {
      console.error("Errore caricamento notifiche admin:", error)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNotifications()

    const interval = setInterval(() => {
      loadNotifications()
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleNotificationsToggle = () => {
    setNotificationsOpen((current) => !current)
  }

  const handleOrdersNotifications = async () => {
    try {
      await markAdminOrderNotificationsAsRead()

      setNotifications((current) =>
        current
          ? {
              ...current,
              ordersCount: 0,
            }
          : current,
      )
    } catch (error) {
      console.error("Errore aggiornamento notifiche ordini:", error)
    }
  }

  const handleCustomersNotifications = async () => {
    try {
      await markAdminCustomerNotificationsAsRead()

      setNotifications((current) =>
        current
          ? {
              ...current,
              customersCount: 0,
            }
          : current,
      )
    } catch (error) {
      console.error("Errore aggiornamento notifiche clienti:", error)
    }
  }

  const handleNotificationTabChange = async (tab: "orders" | "customers") => {
    setNotificationTab(tab)

    if (tab === "orders") {
      await handleOrdersNotifications()
    } else {
      await handleCustomersNotifications()
    }
  }

  const totalNotifications = notifications
    ? notifications.ordersCount + notifications.customersCount
    : 0

  return (
    <div
      className={`admin-layout ${collapsed ? "admin-layout-collapsed" : ""}`}
    >
      <aside className="admin-sidebar">
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

        <nav className="admin-nav">
          <AdminNavItem
            to="/admin"
            icon={<LayoutDashboard size={19} />}
            label={t("admin.sidebar.dashboard")}
            collapsed={collapsed}
            end
          />

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

          <AdminNavItem
            to="/admin/customers"
            icon={<Users size={19} />}
            label={t("admin.sidebar.customers")}
            collapsed={collapsed}
          />

          {!collapsed && (
            <div className="admin-section-title">
              {t("admin.sidebar.store")}
            </div>
          )}

          <AdminNavItem
            to="/admin/settings"
            icon={<Settings size={19} />}
            label={t("admin.sidebar.settings")}
            collapsed={collapsed}
          />

          <AdminNavItem
            to="/"
            icon={<Home size={19} />}
            label={t("admin.sidebar.home")}
            collapsed={collapsed}
          />
        </nav>

        <div className="admin-sidebar-footer">
          <div
            className={`admin-language ${
              collapsed ? "admin-language-collapsed" : ""
            }`}
            title={t("admin.sidebar.language")}
          >
            <Languages size={19} />

            {!collapsed && (
              <select
                value={i18n.language}
                onChange={handleLanguageChange}
                aria-label={t("admin.sidebar.language")}
              >
                <option value="IT">Italiano</option>
                <option value="EN">English</option>
                <option value="FR">Français</option>
                <option value="DE">Deutsch</option>
              </select>
            )}
          </div>

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

      <main className="admin-content">
        <div className="admin-notifications" ref={notificationsRef}>
          <button
            type="button"
            className={`admin-notifications-button ${
              notificationsOpen ? "active" : ""
            }`}
            onClick={handleNotificationsToggle}
            aria-label={t("admin.notifications.title")}
            aria-expanded={notificationsOpen}
          >
            <Bell size={20} />

            {totalNotifications > 0 && (
              <span className="admin-notifications-badge">
                {Math.min(totalNotifications, 99)}
              </span>
            )}
          </button>

          {notificationsOpen && notifications && (
            <div className="admin-notifications-dropdown">
              <div className="admin-notifications-tabs">
                <button
                  type="button"
                  className={`admin-notifications-tab ${
                    notificationTab === "orders" ? "active" : ""
                  }`}
                  onClick={() => handleNotificationTabChange("orders")}
                >
                  <span>{t("admin.notifications.orders")}</span>

                  {notifications.ordersCount > 0 && (
                    <span className="admin-notifications-tab-count">
                      ({notifications.ordersCount})
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  className={`admin-notifications-tab ${
                    notificationTab === "customers" ? "active" : ""
                  }`}
                  onClick={() => handleNotificationTabChange("customers")}
                >
                  <span>{t("admin.notifications.customers")}</span>

                  {notifications.customersCount > 0 && (
                    <span className="admin-notifications-tab-count">
                      ({notifications.customersCount})
                    </span>
                  )}
                </button>
              </div>

              <div className="admin-notifications-list">
                {notificationTab === "orders" ? (
                  notifications.orders.length > 0 ? (
                    notifications.orders.map((order) => (
                      <button
                        key={order.id}
                        type="button"
                        className="admin-notification-item"
                        onClick={() => {
                          setNotificationsOpen(false)
                          navigate(`/admin/orders/${order.id}`)
                        }}
                      >
                        <span className="admin-notification-id">
                          #{order.id.slice(0, 8)}
                        </span>

                        <span className="admin-notification-text">
                          <strong>
                            {order.user?.name} {order.user?.surname}
                          </strong>

                          <span>
                            {" "}
                            -{" "}
                            {new Date(order.createdAt).toLocaleDateString(
                              "it-IT",
                            )}
                          </span>
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="admin-notifications-empty">
                      {t("admin.notifications.noNewOrders")}
                    </div>
                  )
                ) : notifications.customers.length > 0 ? (
                  notifications.customers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      className="admin-notification-item"
                      onClick={() => {
                        setNotificationsOpen(false)
                        navigate(`/admin/customers/${customer.id}`)
                      }}
                    >
                      <span className="admin-notification-id">
                        #{customer.id.slice(0, 8)}
                      </span>

                      <span className="admin-notification-text">
                        <strong>
                          {customer.name} {customer.surname}
                        </strong>

                        <span>
                          {" "}
                          - {t("admin.notifications.registered")}{" "}
                          {new Date(customer.createdAt).toLocaleDateString(
                            "it-IT",
                          )}
                        </span>
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="admin-notifications-empty">
                    {t("admin.notifications.noNewCustomers")}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

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
