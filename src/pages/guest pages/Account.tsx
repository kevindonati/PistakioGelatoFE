import { useEffect, useMemo, useState } from "react"
import {
  ArrowRight,
  AtSign,
  CheckCircle2,
  LogOut,
  MapPin,
  Package,
  Phone,
  Save,
  User,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/useAuth"
import {
  getMe,
  updateMe,
  type UserProfile,
  type UpdateUserData,
} from "../../services/userApi"
import Loading from "../../components/Loading"
import "../../styles/Account.css"

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
    return <Loading />
  }

  if (!user) {
    return (
      <main className="pistakio-account-error-page">
        <div className="container">
          <div className="pistakio-account-error">
            <div className="pistakio-account-error-icon">
              <User size={30} />
            </div>

            <h1>{t("account.loadError")}</h1>

            <p>{error || t("account.loadError")}</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="pistakio-account">
      <div className="container">
        {/* HEADER */}

        <section className="pistakio-account-header">
          <div>
            <h1>{t("account.title")}</h1>

            <p>{t("account.subtitle")}</p>
          </div>

          <button
            type="button"
            className="pistakio-account-logout"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            {t("navbar.logout")}
          </button>
        </section>

        {/* PROFILE CARD */}

        <section className="pistakio-account-profile">
          <div className="pistakio-account-avatar">{initials}</div>

          <div className="pistakio-account-profile-info">
            <h2>
              {user.name} {user.surname}
            </h2>

            <div className="pistakio-account-profile-email">
              <AtSign size={14} />
              {user.email}
            </div>

            <span className="pistakio-account-role">{user.role}</span>
          </div>
        </section>

        {/* FEEDBACK */}

        {error && (
          <div className="pistakio-account-alert pistakio-account-alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="pistakio-account-alert pistakio-account-alert-success">
            <CheckCircle2 size={18} />

            {t("account.updateSuccess")}
          </div>
        )}

        {/* CONTENT */}

        <div className="pistakio-account-grid">
          {/* PERSONAL INFO */}

          <section className="pistakio-account-form-card">
            <div className="pistakio-account-section-heading">
              <div className="pistakio-account-section-icon">
                <User size={19} />
              </div>

              <div>
                <h2>{t("account.personalInfo")}</h2>

                <span>{t("account.personalInfoDescription")}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="pistakio-account-form">
              <div className="pistakio-account-form-grid">
                {/* NAME */}

                <div className="pistakio-account-field">
                  <label htmlFor="account-name">{t("auth.name")}</label>

                  <div className="pistakio-account-input-wrapper">
                    <User size={17} />

                    <input
                      id="account-name"
                      type="text"
                      value={form.name}
                      onChange={(event) =>
                        handleChange("name", event.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                {/* SURNAME */}

                <div className="pistakio-account-field">
                  <label htmlFor="account-surname">{t("auth.surname")}</label>

                  <div className="pistakio-account-input-wrapper">
                    <User size={17} />

                    <input
                      id="account-surname"
                      type="text"
                      value={form.surname}
                      onChange={(event) =>
                        handleChange("surname", event.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                {/* EMAIL */}

                <div className="pistakio-account-field pistakio-account-field-full">
                  <label htmlFor="account-email">{t("auth.email")}</label>

                  <div className="pistakio-account-input-wrapper">
                    <AtSign size={17} />

                    <input
                      id="account-email"
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        handleChange("email", event.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                {/* PHONE */}

                <div className="pistakio-account-field">
                  <label htmlFor="account-phone">{t("auth.phone")}</label>

                  <div className="pistakio-account-input-wrapper">
                    <Phone size={17} />

                    <input
                      id="account-phone"
                      type="tel"
                      value={form.phone}
                      onChange={(event) =>
                        handleChange("phone", event.target.value)
                      }
                    />
                  </div>
                </div>

                {/* LANGUAGE */}

                <div className="pistakio-account-field">
                  <label htmlFor="account-language">{t("auth.language")}</label>

                  <select
                    id="account-language"
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

              <div className="pistakio-account-form-footer">
                <button
                  type="submit"
                  className="pistakio-account-save"
                  disabled={saving}
                >
                  <Save size={17} />

                  {saving ? t("account.saving") : t("account.save")}
                </button>
              </div>
            </form>
          </section>

          {/* SIDEBAR */}

          <aside className="pistakio-account-sidebar">
            {/* ORDERS */}

            <button
              type="button"
              className="pistakio-account-action-card"
              onClick={() => navigate("/orders")}
            >
              <div className="pistakio-account-action-icon pistakio-account-action-icon-green">
                <Package size={22} />
              </div>

              <div className="pistakio-account-action-content">
                <h2>{t("account.orders")}</h2>

                <p>{t("account.ordersDescription")}</p>
              </div>

              <ArrowRight size={19} className="pistakio-account-action-arrow" />
            </button>

            {/* ADDRESSES */}

            <button
              type="button"
              className="pistakio-account-action-card"
              onClick={() => navigate("/account/addresses")}
            >
              <div className="pistakio-account-action-icon pistakio-account-action-icon-pink">
                <MapPin size={22} />
              </div>

              <div className="pistakio-account-action-content">
                <h2>{t("account.addresses")}</h2>

                <p>{t("account.addressesDescription")}</p>
              </div>

              <ArrowRight size={19} className="pistakio-account-action-arrow" />
            </button>
          </aside>
        </div>
      </div>
    </main>
  )
}

export default Account
