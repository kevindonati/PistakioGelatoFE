import { useState } from "react"
import type { FormEvent } from "react"

import { useAuth } from "../../context/useAuth"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import logo from "../../assets/LOGO CON SCRITTA PIST DEF.png"
import "../../styles/Login.css"
import { EyeOff } from "lucide-react"
import { Eye } from "react-bootstrap-icons"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    setError("")
    setIsLoading(true)

    try {
      await login(email, password)
      navigate("/")
    } catch (error) {
      console.error(error)
      setError(t("auth.loginError"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <img src={logo} alt="Pistakio Gelato" />
        </div>

        {/* Titolo */}
        <div className="login-header">
          <h1>{t("auth.login")}</h1>
          <p>Accedi al tuo account per continuare</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="login-field">
            <label htmlFor="email">{t("auth.email")}</label>

            <div className="input-wrapper">
              <span className="input-icon">
                <i className="bi bi-envelope"></i>
              </span>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="La tua email"
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="login-field">
            <div className="password-label">
              <label htmlFor="password">{t("auth.password")}</label>
            </div>

            <div className="input-wrapper">
              <span className="input-icon">
                <i className="bi bi-lock"></i>
              </span>

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="La tua password"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="register-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? "Nascondi password" : "Mostra password"
                }
              >
                {showPassword ? (
                  <EyeOff size={19} strokeWidth={2} />
                ) : (
                  <Eye size={19} strokeWidth={2} />
                )}
              </button>
            </div>
          </div>

          {/* Password dimenticata */}
          <div className="forgot-password">
            <button type="button" onClick={() => {}}>
              Hai dimenticato la password?
            </button>
          </div>

          {/* Errore */}
          {error && (
            <div className="login-error" role="alert">
              <i className="bi bi-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  aria-hidden="true"
                ></span>
                Accesso in corso...
              </>
            ) : (
              <>
                {t("auth.login")}
                <i className="bi bi-arrow-right"></i>
              </>
            )}
          </button>
        </form>

        {/* Register */}
        <div className="login-register">
          <span>Non hai ancora un account?</span>

          <button type="button" onClick={() => navigate("/register")}>
            Registrati
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
