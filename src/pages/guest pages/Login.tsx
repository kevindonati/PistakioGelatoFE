import { useState } from "react"
import type { FormEvent } from "react"
import { useAuth } from "../../context/useAuth"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")

    try {
      await login(email, password)
      navigate("/")
    } catch (error) {
      console.error(error)
      setError(t("auth.loginError"))
    }
  }

  return (
    <div className="container mt-5">
      <h1>{t("auth.login")}</h1>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-3">
          <label className="form-label">{t("auth.email")}</label>

          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">{t("auth.password")}</label>

          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <button type="submit" className="btn btn-primary">
          {t("auth.login")}
        </button>
      </form>
    </div>
  )
}

export default Login
