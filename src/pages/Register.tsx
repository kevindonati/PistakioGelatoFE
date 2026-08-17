import { useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import axios from "axios"

function Register() {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [surname, setSurname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [language, setLanguage] = useState("IT")
  const [error, setError] = useState("")

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")

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
          setError("Questa email è già registrata.")
        } else {
          setError("Registrazione non riuscita. Riprova.")
        }
      } else {
        setError("Registrazione non riuscita. Riprova.")
      }
    }
  }

  return (
    <div className="container mt-5">
      <h1>Registrati</h1>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-3">
          <label className="form-label">Nome</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Cognome</label>
          <input
            type="text"
            className="form-control"
            value={surname}
            onChange={(event) => setSurname(event.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Telefono</label>
          <input
            type="tel"
            className="form-control"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Lingua</label>

          <select
            className="form-select"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            <option value="IT">Italiano</option>
            <option value="EN">English</option>
            <option value="FR">Français</option>
            <option value="DE">Deutsch</option>
          </select>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <button type="submit" className="btn btn-dark">
          Registrati
        </button>
      </form>
    </div>
  )
}

export default Register
