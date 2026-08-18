import { Link } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import { useTranslation } from "react-i18next"
import { setLanguage } from "../services/language"
import type { Language } from "../types/Language"
import { CartFill } from "react-bootstrap-icons"
import { useCart } from "../context/CartContext"

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const { t, i18n } = useTranslation()
  const { totalItems } = useCart()

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom">
      <div className="container">
        <Link to="/" className="navbar-brand fw-bold">
          <span className="verde-pistakio">Pistakio</span>
          <span className="rosa-pistakio">Gelato</span>
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
              <>
                <Link to="/account" className="nav-link">
                  {user?.name}
                </Link>

                {user?.role === "ADMIN" && (
                  <Link to="/admin" className="nav-link">
                    {t("navbar.admin")}
                  </Link>
                )}

                <button className="btn btn-outline-danger" onClick={logout}>
                  {t("navbar.logout")}
                </button>
              </>
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
