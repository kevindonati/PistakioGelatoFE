import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ArrowLeft, CheckCircle, Lock, Eye, EyeOff } from "lucide-react"
import { resetPassword } from "../../services/userApi"
import "../../styles/Login.css"

function ResetPassword() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    setError("")

    if (!token) {
      setError(t("resetPassword.invalidToken"))

      return
    }

    if (password.length < 8) {
      setError(t("resetPassword.passwordTooShort"))

      return
    }

    if (password !== confirmPassword) {
      setError(t("resetPassword.passwordMismatch"))

      return
    }

    try {
      setLoading(true)

      await resetPassword(token, password)

      setSuccess(true)
    } catch (error) {
      console.error(error)

      setError(t("resetPassword.error"))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="login-page">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <img src="/logo.png" alt="Pistakio Gelato" />
            </div>

            <CheckCircle size={50} color="#8bbf2c" />

            <h1>{t("resetPassword.successTitle")}</h1>

            <p>{t("resetPassword.successMessage")}</p>

            <div className="forgot-password">
              <Link to="/login" className="forgot-text">
                {t("resetPassword.goToLogin")}
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <img src="/logo.png" alt="Pistakio Gelato" />
          </div>

          <h1>{t("resetPassword.title")}</h1>

          <p>{t("resetPassword.description")}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* PASSWORD */}

          <div className="login-field">
            <label htmlFor="password">{t("resetPassword.password")}</label>

            <div className="input-wrapper">
              <Lock className="input-icon" />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t("resetPassword.passwordPlaceholder")}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}

          <div className="login-field">
            <label htmlFor="confirmPassword">
              {t("resetPassword.confirmPassword")}
            </label>

            <div className="input-wrapper">
              <Lock className="input-icon" />

              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder={t("resetPassword.confirmPasswordPlaceholder")}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword((current) => !current)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? t("resetPassword.saving") : t("resetPassword.submit")}
          </button>
        </form>

        <div className="forgot-password">
          <Link to="/login" className="forgot-text">
            <ArrowLeft size={15} />

            {t("resetPassword.backToLogin")}
          </Link>
        </div>
      </div>
    </main>
  )
}

export default ResetPassword
