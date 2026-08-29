import { Link } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import { useTranslation } from "react-i18next"
import { setLanguage } from "../services/language"
import type { Language } from "../types/Language"
import {
  ShoppingCart,
  Menu,
  X,
  Package,
  Settings,
  LogOut,
  Shield,
  MapPin,
} from "lucide-react"
import { useCart } from "../context/CartContext"
import { useState, useRef, useEffect } from "react"
import "../styles/Logo.css"
import "../styles/Navbar.css"
import logo from "../assets/LOGO CON SCRITTA PIST DEF.png"

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const { t, i18n } = useTranslation()
  const { totalItems } = useCart()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const getInitials = () => {
    if (!user) {
      return ""
    }
    const firstLetter = user.name?.charAt(0).toUpperCase() ?? ""
    const lastLetter = user.surname?.charAt(0).toUpperCase() ?? ""
    return `${firstLetter}${lastLetter}`
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const handleLogout = () => {
    setDropdownOpen(false)
    closeMobileMenu()
    logout()
  }

  return (
    <nav className="navbar navbar-pistakio">
      <div className="container">
        {/* LOGO */}
        <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
          <img src={logo} alt="Logo Pistakio Gelato" className="logo" />
        </Link>

        {/* MOBILE ACTIONS */}
        <div className="navbar-mobile-actions">
          {/* CART */}

          {isAuthenticated && (
            <Link
              to="/cart"
              className="navbar-icon-button"
              aria-label={t("navbar.cart")}
            >
              <ShoppingCart size={22} />

              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </Link>
          )}

          {/* Avatar mobile */}
          {isAuthenticated && (
            <div className="navbar-user-mobile" ref={dropdownRef}>
              <button
                type="button"
                className="navbar-avatar-button"
                onClick={() => setDropdownOpen((current) => !current)}
                aria-expanded={dropdownOpen}
              >
                <div className="navbar-avatar">{getInitials()}</div>
              </button>

              {dropdownOpen && (
                <div className="navbar-user-dropdown">
                  <div className="navbar-user-info">
                    <div className="navbar-user-name">{user?.name}</div>

                    <small>{user?.email}</small>
                  </div>

                  <div className="navbar-dropdown-divider" />

                  <Link
                    to="/orders"
                    className="navbar-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Package size={17} />
                    {t("navbar.orders")}
                  </Link>

                  <Link
                    to="/account"
                    className="navbar-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Settings size={17} />
                    {t("navbar.account")}
                  </Link>

                  {user?.role === "ADMIN" && (
                    <>
                      <div className="navbar-dropdown-divider" />

                      <Link
                        to="/admin"
                        className="navbar-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Shield size={17} />
                        {t("navbar.admin")}
                      </Link>
                    </>
                  )}

                  <div className="navbar-dropdown-divider" />

                  <button
                    type="button"
                    className="navbar-dropdown-item logout"
                    onClick={handleLogout}
                  >
                    <LogOut size={17} />
                    {t("navbar.logout")}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Hamburger */}
          <button
            type="button"
            className="navbar-menu-button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            aria-label={t("navbar.menu")}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>

        {/* NAVBAR CONTENT */}
        <div
          className={`navbar-collapse-custom ${mobileMenuOpen ? "open" : ""}`}
        >
          {/* LINKS */}
          <ul className="navbar-nav-custom">
            <li>
              <Link to="/" onClick={closeMobileMenu}>
                {t("navbar.home")}
              </Link>
            </li>

            <li>
              <Link to="/catalog" onClick={closeMobileMenu}>
                {t("navbar.catalog")}
              </Link>
            </li>
          </ul>

          {/* DESKTOP ACTIONS */}
          <div className="navbar-desktop-actions">
            {/* CART */}
            {isAuthenticated && (
              <Link to="/cart" className="navbar-cart-button">
                <ShoppingCart size={19} />

                <span>{t("navbar.cart")}</span>

                {totalItems > 0 && (
                  <span className="cart-badge">{totalItems}</span>
                )}
              </Link>
            )}

            {/* LANGUAGE */}
            <select
              value={i18n.language}
              onChange={(event) => {
                setLanguage(event.target.value as Language)
              }}
              className="navbar-language-select"
              aria-label={t("navbar.language")}
            >
              <option value="IT">IT</option>
              <option value="EN">EN</option>
              <option value="FR">FR</option>
              <option value="DE">DE</option>
            </select>

            {/* USER */}
            {isAuthenticated ? (
              <div className="navbar-user-desktop" ref={dropdownRef}>
                <button
                  type="button"
                  className="navbar-avatar-button"
                  onClick={() => setDropdownOpen((current) => !current)}
                  aria-expanded={dropdownOpen}
                >
                  <div className="navbar-avatar">{getInitials()}</div>
                </button>

                {dropdownOpen && (
                  <div className="navbar-user-dropdown">
                    <div className="navbar-user-info">
                      <div className="navbar-user-name">{user?.name}</div>

                      <small>{user?.email}</small>
                    </div>

                    <div className="navbar-dropdown-divider" />

                    <Link
                      to="/orders"
                      className="navbar-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Package size={17} />
                      {t("navbar.orders")}
                    </Link>

                    <Link
                      to="/account"
                      className="navbar-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Settings size={17} />
                      {t("navbar.account")}
                    </Link>

                    <Link
                      to="/account/addresses"
                      className="navbar-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <MapPin size={17} />
                      {t("navbar.addresses")}
                    </Link>

                    {user?.role === "ADMIN" && (
                      <>
                        <div className="navbar-dropdown-divider" />

                        <Link
                          to="/admin"
                          className="navbar-dropdown-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Shield size={17} />
                          {t("navbar.admin")}
                        </Link>
                      </>
                    )}

                    <div className="navbar-dropdown-divider" />

                    <button
                      type="button"
                      className="navbar-dropdown-item logout"
                      onClick={handleLogout}
                    >
                      <LogOut size={17} />
                      {t("navbar.logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="navbar-auth-desktop">
                <Link to="/login" className="navbar-login-button">
                  {t("navbar.login")}
                </Link>

                <Link to="/register" className="navbar-register-button">
                  {t("navbar.register")}
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE CONTENT */}
          <div className="navbar-mobile-content">
            {/* LANGUAGE */}
            <div className="navbar-language">
              <label>{t("navbar.language")}</label>

              <select
                value={i18n.language}
                onChange={(event) => {
                  setLanguage(event.target.value as Language)
                }}
              >
                <option value="IT">Italiano</option>
                <option value="EN">English</option>
                <option value="FR">Français</option>
                <option value="DE">Deutsch</option>
              </select>
            </div>

            {/* Login / Register */}
            {!isAuthenticated && (
              <div className="navbar-auth-mobile">
                <Link
                  to="/login"
                  className="navbar-login-button"
                  onClick={closeMobileMenu}
                >
                  {t("navbar.login")}
                </Link>

                <Link
                  to="/register"
                  className="navbar-register-button"
                  onClick={closeMobileMenu}
                >
                  {t("navbar.register")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
