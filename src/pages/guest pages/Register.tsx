import { useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"
import axios from "axios"
import { useTranslation } from "react-i18next"
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Phone,
  Globe,
  ArrowRight,
  AlertCircle,
} from "lucide-react"
import logo from "../../assets/LOGO CON SCRITTA PIST DEF.png"
import "../../styles/Register.css"

function Register() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [name, setName] = useState("")
  const [surname, setSurname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [language, setLanguage] = useState("IT")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    setError("")
    setIsLoading(true)

    try {
      await api.post("/auth/register", {
        name,
        surname,
        email,
        password,
        phone,
        language,
      })

      navigate("/login")
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status

        if (status === 400) {
          setError(t("auth.emailAlreadyRegistered"))
        } else {
          setError(t("auth.registerError"))
        }
      } else {
        setError(t("auth.registerError"))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="register-page">
      <div className="register-card">
        {/* Logo */}
        <div className="register-logo">
          <img src={logo} alt="Pistakio Gelato" />
        </div>

        {/* Header */}
        <div className="register-header">
          <h1>{t("auth.register")}</h1>
          <p>{t("auth.registerSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name + Surname */}
          <div className="register-row">
            <div className="register-field">
              <label htmlFor="name">{t("auth.name")}</label>

              <div className="register-input-wrapper">
                <User className="register-input-icon" size={18} />

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={t("auth.namePlaceholder")}
                  autoComplete="given-name"
                  required
                />
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="surname">{t("auth.surname")}</label>

              <div className="register-input-wrapper">
                <User className="register-input-icon" size={18} />

                <input
                  id="surname"
                  type="text"
                  value={surname}
                  onChange={(event) => setSurname(event.target.value)}
                  placeholder={t("auth.surnamePlaceholder")}
                  autoComplete="family-name"
                  required
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="register-field">
            <label htmlFor="register-email">{t("auth.email")}</label>

            <div className="register-input-wrapper">
              <Mail className="register-input-icon" size={18} />

              <input
                id="register-email"
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
          <div className="register-field">
            <label htmlFor="register-password">{t("auth.password")}</label>

            <div className="register-input-wrapper">
              <Lock className="register-input-icon" size={18} />

              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t("auth.passwordPlaceholder")}
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="register-password-toggle"
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

          {/* Phone */}
          <div className="register-field">
            <label htmlFor="phone">{t("auth.phone")}</label>

            <div className="register-input-wrapper">
              <Phone className="register-input-icon" size={18} />

              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder={t("auth.phonePlaceholder")}
                autoComplete="tel"
                required
              />
            </div>
          </div>

          {/* Language */}
          <div className="register-field">
            <label htmlFor="language">{t("auth.language")}</label>

            <div className="register-input-wrapper">
              <Globe className="register-input-icon" size={18} />

              <select
                id="language"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
              >
                <option value="IT">Italiano</option>
                <option value="EN">English</option>
                <option value="FR">Français</option>
                <option value="DE">Deutsch</option>
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="register-error" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="register-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  aria-hidden="true"
                />

                {t("auth.registering")}
              </>
            ) : (
              <>
                {t("auth.register")}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Login */}
        <div className="register-login">
          <span>{t("auth.hasAccount")}</span>

          <button type="button" onClick={() => navigate("/login")}>
            {t("auth.login")}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Register
