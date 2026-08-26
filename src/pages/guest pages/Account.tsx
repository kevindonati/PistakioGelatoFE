import { useEffect, useMemo, useState } from "react"
import { ArrowRight, LogOut, MapPin, Package, Save } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import { useAuth } from "../../context/useAuth"
import {
  getMe,
  updateMe,
  type UserProfile,
  type UpdateUserData,
} from "../../services/userApi"

function Account() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { logout, updateUser } = useAuth()

  const [user, setUser] = useState<UserProfile | null>(null)

  const [form, setForm] = useState<UpdateUserData>({
    name: "",
    surname: "",
    email: "",
    phone: "",
    language: "IT",
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        setError("")

        const profile = await getMe()

        setUser(profile)

        setForm({
          name: profile.name,
          surname: profile.surname,
          email: profile.email,
          phone: profile.phone ?? "",
          language: profile.language,
        })
      } catch (error) {
        console.error(error)
        setError(t("account.loadError"))
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [t])

  const initials = useMemo(() => {
    if (!user) {
      return ""
    }

    const firstLetter = user.name?.charAt(0).toUpperCase() ?? ""

    const lastLetter = user.surname?.charAt(0).toUpperCase() ?? ""

    return `${firstLetter}${lastLetter}`
  }, [user])

  const handleChange = (field: keyof UpdateUserData, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))

    setSuccess(false)
    setError("")
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!user) {
      return
    }

    try {
      setSaving(true)
      setError("")
      setSuccess(false)

      const updatedUser = await updateMe(user.id, form)

      updateUser(updatedUser)

      setUser(updatedUser)

      setForm({
        name: updatedUser.name,
        surname: updatedUser.surname,
        email: updatedUser.email,
        phone: updatedUser.phone ?? "",
        language: updatedUser.language,
      })

      setSuccess(true)
    } catch (error) {
      console.error(error)
      setError(t("account.updateError"))
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  if (loading) {
    return (
      <main className="container py-5">
        <div className="text-center">{t("common.loading")}</div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="container py-5">
        <div className="alert alert-danger">
          {error || t("account.loadError")}
        </div>
      </main>
    )
  }

  return (
    <main className="container py-5">
      {/* HEADER */}

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-5">
        <div>
          <h1 className="mb-1">{t("account.title")}</h1>

          <p className="text-muted mb-0">{t("account.subtitle")}</p>
        </div>

        <button
          type="button"
          className="btn btn-outline-danger"
          onClick={handleLogout}
        >
          <LogOut size={17} className="me-2" />
          {t("navbar.logout")}
        </button>
      </div>

      {/* PROFILO */}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle bg-dark text-white fw-semibold"
              style={{
                width: "72px",
                height: "72px",
                fontSize: "24px",
              }}
            >
              {initials}
            </div>

            <div>
              <h2 className="h4 mb-1">
                {user.name} {user.surname}
              </h2>

              <p className="text-muted mb-1">{user.email}</p>

              <span className="badge bg-light text-dark border">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {success && (
        <div className="alert alert-success">{t("account.updateSuccess")}</div>
      )}

      <div className="row g-4">
        {/* DATI PERSONALI */}

        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h2 className="h5 mb-4">{t("account.personalInfo")}</h2>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label">{t("auth.name")}</label>

                    <input
                      type="text"
                      className="form-control"
                      value={form.name}
                      onChange={(event) =>
                        handleChange("name", event.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">{t("auth.surname")}</label>

                    <input
                      type="text"
                      className="form-control"
                      value={form.surname}
                      onChange={(event) =>
                        handleChange("surname", event.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">{t("auth.email")}</label>

                    <input
                      type="email"
                      className="form-control"
                      value={form.email}
                      onChange={(event) =>
                        handleChange("email", event.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">{t("auth.phone")}</label>

                    <input
                      type="tel"
                      className="form-control"
                      value={form.phone}
                      onChange={(event) =>
                        handleChange("phone", event.target.value)
                      }
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">{t("auth.language")}</label>

                    <select
                      className="form-select"
                      value={form.language}
                      onChange={(event) =>
                        handleChange("language", event.target.value)
                      }
                    >
                      <option value="IT">Italiano</option>

                      <option value="EN">English</option>

                      <option value="FR">Français</option>

                      <option value="DE">Deutsch</option>
                    </select>
                  </div>
                </div>

                <div className="d-flex justify-content-end mt-4">
                  <button
                    type="submit"
                    className="btn btn-dark"
                    disabled={saving}
                  >
                    <Save size={17} className="me-2" />

                    {saving ? t("account.saving") : t("account.save")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* COLONNA DESTRA */}

        <div className="col-12 col-lg-4">
          <div className="d-flex flex-column gap-3">
            {/* ORDINI */}

            <button
              type="button"
              className="card border-0 shadow-sm text-start w-100"
              onClick={() => navigate("/orders")}
              style={{
                cursor: "pointer",
              }}
            >
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-light rounded p-3">
                      <Package size={22} />
                    </div>

                    <div>
                      <h2 className="h6 mb-1">{t("account.orders")}</h2>

                      <p className="text-muted small mb-0">
                        {t("account.ordersDescription")}
                      </p>
                    </div>
                  </div>

                  <ArrowRight size={19} />
                </div>
              </div>
            </button>

            {/* INDIRIZZI */}

            <button
              type="button"
              className="card border-0 shadow-sm text-start w-100"
              onClick={() => navigate("/account/addresses")}
              style={{
                cursor: "pointer",
              }}
            >
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-light rounded p-3">
                      <MapPin size={22} />
                    </div>

                    <div>
                      <h2 className="h6 mb-1">{t("account.addresses")}</h2>

                      <p className="text-muted small mb-0">
                        {t("account.addressesDescription")}
                      </p>
                    </div>
                  </div>

                  <ArrowRight size={19} />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Account
