import { useState } from "react"
import type { FormEvent } from "react"

import { useNavigate } from "react-router-dom"

import api from "../../services/api"
import axios from "axios"

import { useTranslation } from "react-i18next"

import logo from "../../assets/LOGO CON SCRITTA PIST DEF.png"

import "../../styles/Register.css"
import { Eye, EyeOff } from "lucide-react"

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

          <p>Crea il tuo account Pistakio</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Nome + Cognome */}
          <div className="register-row">
            <div className="register-field">
              <label htmlFor="name">{t("auth.name")}</label>

              <div className="register-input-wrapper">
                <span className="register-input-icon">
                  <i className="bi bi-person"></i>
                </span>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Nome"
                  autoComplete="given-name"
                  required
                />
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="surname">{t("auth.surname")}</label>

              <div className="register-input-wrapper">
                <span className="register-input-icon">
                  <i className="bi bi-person"></i>
                </span>

                <input
                  id="surname"
                  type="text"
                  value={surname}
                  onChange={(event) => setSurname(event.target.value)}
                  placeholder="Cognome"
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
              <span className="register-input-icon">
                <i className="bi bi-envelope"></i>
              </span>

              <input
                id="register-email"
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
          <div className="register-field">
            <label htmlFor="register-password">{t("auth.password")}</label>

            <div className="register-input-wrapper">
              <span className="register-input-icon">
                <i className="bi bi-lock"></i>
              </span>

              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="La tua password"
                autoComplete="new-password"
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

          {/* Telefono */}
          <div className="register-field">
            <label htmlFor="phone">{t("auth.phone")}</label>

            <div className="register-input-wrapper">
              <span className="register-input-icon">
                <i className="bi bi-telephone"></i>
              </span>

              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Il tuo numero di telefono"
                autoComplete="tel"
                required
              />
            </div>
          </div>

          {/* Lingua */}
          <div className="register-field">
            <label htmlFor="language">{t("auth.language")}</label>

            <div className="register-input-wrapper">
              <span className="register-input-icon">
                <i className="bi bi-globe"></i>
              </span>

              <select
                id="language"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
              >
                <option value="IT">🇮🇹 Italiano</option>
                <option value="EN">🇬🇧 English</option>
                <option value="FR">🇫🇷 Français</option>
                <option value="DE">🇩🇪 Deutsch</option>
              </select>
            </div>
          </div>

          {/* Errore */}
          {error && (
            <div className="register-error" role="alert">
              <i className="bi bi-exclamation-circle"></i>
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
                ></span>
                Registrazione in corso...
              </>
            ) : (
              <>
                {t("auth.register")}
                <i className="bi bi-arrow-right"></i>
              </>
            )}
          </button>
        </form>

        {/* Login */}
        <div className="register-login">
          <span>Hai già un account?</span>

          <button type="button" onClick={() => navigate("/login")}>
            Accedi
          </button>
        </div>
      </div>
    </div>
  )
}

export default Register
