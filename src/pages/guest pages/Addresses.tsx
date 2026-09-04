import { useEffect, useState } from "react"
import { ArrowLeft, MapPin, Pencil, Plus, Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { deleteAddress, getAddresses } from "../../services/addressApi"
import type { Address } from "../../types/Address"
import "../../styles/Addresses.css"

function Addresses() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState("")

  const loadAddresses = async () => {
    try {
      setLoading(true)
      setError("")

      const data = await getAddresses()

      setAddresses(data)
    } catch (error) {
      console.error(error)
      setError(t("addresses.loadError"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAddresses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(t("addresses.deleteConfirm"))

    if (!confirmed) {
      return
    }

    try {
      setDeletingId(id)
      setError("")

      await deleteAddress(id)

      setAddresses((current) => current.filter((address) => address.id !== id))
    } catch (error) {
      console.error(error)
      setError(t("addresses.deleteError"))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="pistakio-addresses bg-body-tertiary">
      <div className="container">
        {/* HEADER */}

        <section className="pistakio-addresses-header">
          <div>
            <button
              type="button"
              className="pistakio-addresses-back"
              onClick={() => navigate("/account")}
            >
              <ArrowLeft size={17} />
              {t("addresses.backToAccount")}
            </button>
            <h1>{t("addresses.title")}</h1>

            <p>{t("addresses.subtitle")}</p>
          </div>

          <button
            type="button"
            className="pistakio-addresses-new-button"
            onClick={() => navigate("/account/addresses/new")}
          >
            <Plus size={18} />
            {t("addresses.new")}
          </button>
        </section>

        {/* ERROR */}

        {error && <div className="pistakio-addresses-alert">{error}</div>}

        {/* LOADING */}

        {loading && (
          <div className="pistakio-addresses-loading">
            <div className="pistakio-addresses-loading-icon">
              <MapPin size={25} />
            </div>

            <p>{t("common.loading")}</p>
          </div>
        )}

        {/* EMPTY */}

        {!loading && addresses.length === 0 && (
          <section className="pistakio-addresses-empty">
            <div className="pistakio-addresses-empty-icon">
              <MapPin size={30} />
            </div>

            <h2>{t("addresses.empty")}</h2>

            <p>{t("addresses.emptyDescription")}</p>

            <button
              type="button"
              className="pistakio-addresses-new-button"
              onClick={() => navigate("/account/addresses/new")}
            >
              <Plus size={18} />
              {t("addresses.new")}
            </button>
          </section>
        )}

        {/* ADDRESSES */}

        {!loading && addresses.length > 0 && (
          <section className="pistakio-addresses-grid">
            {addresses.map((address) => (
              <article key={address.id} className="pistakio-address-card">
                {/* CARD HEADER */}

                <div className="pistakio-address-card-header">
                  <div className="pistakio-address-card-icon">
                    <MapPin size={20} />
                  </div>

                  <div>
                    <span>{t("addresses.address")}</span>

                    <h2>{address.city}</h2>
                  </div>
                </div>

                {/* ADDRESS */}

                <div className="pistakio-address-content">
                  <strong>{address.addressLine1}</strong>

                  {address.addressLine2 && <span>{address.addressLine2}</span>}

                  <span>
                    {address.postalCode} {address.city}
                  </span>

                  <span>{address.country}</span>
                </div>

                {/* ACTIONS */}

                <div className="pistakio-address-actions">
                  <button
                    type="button"
                    className="pistakio-address-edit"
                    onClick={() =>
                      navigate(`/account/addresses/${address.id}/edit`)
                    }
                  >
                    <Pencil size={16} />
                    {t("addresses.edit")}
                  </button>

                  <button
                    type="button"
                    className="pistakio-address-delete"
                    disabled={deletingId === address.id}
                    onClick={() => handleDelete(address.id)}
                    title={t("addresses.delete")}
                    aria-label={t("addresses.delete")}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}

export default Addresses
