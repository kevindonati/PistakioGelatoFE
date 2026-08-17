import { Link } from "react-router-dom"
import { useAuth } from "../context/useAuth"

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom">
      <div className="container">
        <Link to="/" className="navbar-brand fw-bold">
          PistakioGelato
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
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/catalog" className="nav-link">
                Catalogo
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            <Link to="/cart" className="btn btn-outline-dark">
              🛒
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/account" className="nav-link">
                  {user?.name}
                </Link>

                {user?.role === "ADMIN" && (
                  <Link to="/admin" className="nav-link">
                    Admin
                  </Link>
                )}

                <button className="btn btn-outline-danger" onClick={logout}>
                  Esci
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-dark">
                  Accedi
                </Link>

                <Link to="/register" className="btn btn-dark">
                  Registrati
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
