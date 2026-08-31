import { useState } from "react"
import type { FormEvent } from "react"
import { useAuth } from "../../context/useAuth"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react"
import logo from "../../assets/LOGO CON SCRITTA PIST DEF.png"
import "../../styles/Login.css"

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
    <div className="login-page bg-body-tertiary">
      <div className="login-card">
        <div className="login-logo">
          <img src={logo} alt="Pistakio Gelato" />
        </div>

        <div className="login-header">
          <h1>{t("auth.login")}</h1>
          <p>{t("auth.loginSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="login-field">
            <label htmlFor="email">{t("auth.email")}</label>

            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t("auth.emailPlaceholder")}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="login-field">
            <label htmlFor="password">{t("auth.password")}</label>

            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t("auth.passwordPlaceholder")}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? t("auth.hidePassword") : t("auth.showPassword")
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

          {/* Forgot password */}
          <div className="forgot-password">
            <Link to="/forgot-password" className="forgot-text">
              {t("auth.forgotPassword")}
            </Link>
          </div>

          {/* Error */}
          {error && (
            <div className="login-error" role="alert">
              <AlertCircle size={18} />
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
                />

                {t("auth.loggingIn")}
              </>
            ) : (
              <>
                {t("auth.login")}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Register */}
        <div className="login-register">
          <span>{t("auth.noAccount")}</span>

          <button type="button" onClick={() => navigate("/register")}>
            {t("auth.register")}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
