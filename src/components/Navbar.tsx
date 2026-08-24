import { Link } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import { useTranslation } from "react-i18next"
import { setLanguage } from "../services/language"
import type { Language } from "../types/Language"
import { CartFill } from "react-bootstrap-icons"
import { useCart } from "../context/CartContext"
import { useState, useRef, useEffect } from "react"
import "../styles/Logo.css"

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const { t, i18n } = useTranslation()
  const { totalItems } = useCart()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const getInitials = () => {
    if (!user) return ""

    const firstName = user.name?.trim() || ""

    const parts = firstName.split(" ").filter(Boolean)

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }

    return firstName.slice(0, 2).toUpperCase()
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

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom">
      <div className="container">
        <Link to="/" className="navbar-brand fw-bold">
          {/* <span className="verde-pistakio">Pistakio</span>
          <span className="rosa-pistakio">Gelato</span> */}
          <div className="logo">
            <div className="top">
              <div className="circle-logo pink"></div>
              <div className="top-green">
                <div className="circle-logo green"></div>
                <div className="circle-logo green"></div>
                <div className="circle-logo green"></div>
              </div>
            </div>

            <div className="bottom">
              <div className="triangle pink">
                <div></div>
              </div>

              <div className="triangle green">
                <div></div>
              </div>
            </div>
          </div>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link to="/" className="nav-link">
                {t("navbar.home")}
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/catalog" className="nav-link">
                {t("navbar.catalog")}
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            {/* CARRELLO */}

            <Link
              to="/cart"
              className="btn btn-outline-dark position-relative d-flex align-items-center gap-2"
            >
              <CartFill />

              {t("navbar.cart")}

              {totalItems > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-danger">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* LINGUA */}

            <select
              value={i18n.language}
              onChange={(event) => {
                setLanguage(event.target.value as Language)
              }}
              className="form-select form-select-sm"
            >
              <option value="IT">IT</option>
              <option value="EN">EN</option>
              <option value="FR">FR</option>
              <option value="DE">DE</option>
            </select>

            {/* UTENTE */}

            {isAuthenticated ? (
              <div className="position-relative" ref={dropdownRef}>
                <button
                  type="button"
                  className="btn p-0 border-0"
                  onClick={() => setDropdownOpen((current) => !current)}
                  aria-expanded={dropdownOpen}
                >
                  <div
                    className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center fw-semibold"
                    style={{
                      width: "42px",
                      height: "42px",
                    }}
                  >
                    {getInitials()}
                  </div>
                </button>

                {dropdownOpen && (
                  <div
                    className="dropdown-menu dropdown-menu-end show"
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      minWidth: "210px",
                    }}
                  >
                    <div className="px-3 py-2">
                      <div className="fw-semibold">{user?.name}</div>

                      <small className="text-muted">{user?.email}</small>
                    </div>

                    <div className="dropdown-divider"></div>

                    <Link
                      to="/orders"
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      {t("navbar.orders")}
                    </Link>

                    <Link
                      to="/account"
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      {t("navbar.account")}
                    </Link>

                    {user?.role === "ADMIN" && (
                      <>
                        <div className="dropdown-divider"></div>

                        <Link
                          to="/admin"
                          className="dropdown-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          {t("navbar.admin")}
                        </Link>
                      </>
                    )}

                    <div className="dropdown-divider"></div>

                    <button
                      type="button"
                      className="dropdown-item text-danger"
                      onClick={() => {
                        setDropdownOpen(false)
                        logout()
                      }}
                    >
                      {t("navbar.logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-dark">
                  {t("navbar.login")}
                </Link>

                <Link to="/register" className="btn btn-dark">
                  {t("navbar.register")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
