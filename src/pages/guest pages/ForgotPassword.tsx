import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ArrowLeft, CheckCircle, Mail } from "lucide-react"
import { forgotPassword } from "../../services/userApi"
import "../../styles/Login.css"
import logo from "../../assets/LOGO CON SCRITTA PIST DEF.png"

function ForgotPassword() {
  const { t } = useTranslation()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      setLoading(true)
      setError("")
      setSuccess(false)

      await forgotPassword(email)

      setSuccess(true)
    } catch (error) {
      console.error(error)

      setError(t("forgotPassword.error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-card">
        {!success ? (
          <>
            <div className="login-header">
              <div className="login-logo">
                <img src={logo} alt="Pistakio Gelato" />
              </div>

              <h1>{t("forgotPassword.title")}</h1>

              <p>{t("forgotPassword.description")}</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="login-field">
                <label htmlFor="email">{t("forgotPassword.email")}</label>

                <div className="input-wrapper">
                  <Mail className="input-icon" />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={t("forgotPassword.emailPlaceholder")}
                    required
                  />
                </div>
              </div>

              {error && <div className="login-error">{error}</div>}

              <button type="submit" className="login-button" disabled={loading}>
                {loading
                  ? t("forgotPassword.sending")
                  : t("forgotPassword.send")}
              </button>
            </form>

            <div className="forgot-password">
              <Link to="/login" className="forgot-text">
                <ArrowLeft size={15} />

                {t("forgotPassword.backToLogin")}
              </Link>
            </div>
          </>
        ) : (
          <div className="login-header">
            <div className="login-logo">
              <img src={logo} alt="Pistakio Gelato" />
            </div>

            <CheckCircle size={50} color="#8bbf2c" />

            <h1>{t("forgotPassword.successTitle")}</h1>

            <p>{t("forgotPassword.successMessage")}</p>

            <div className="forgot-password">
              <Link to="/login" className="forgot-text">
                <ArrowLeft size={15} />

                {t("forgotPassword.backToLogin")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default ForgotPassword
