import { useEffect, useState } from "react"
import { ArrowLeft, MapPin, Pencil, Plus, Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import { deleteAddress, getAddresses } from "../../services/addressApi"

import type { Address } from "../../types/Address"

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
    <main className="container py-5">
      {/* HEADER */}

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <button
            type="button"
            className="btn btn-link text-dark p-0 mb-2"
            onClick={() => navigate("/account")}
          >
            <ArrowLeft size={16} className="me-1" />
            {t("addresses.backToAccount")}
          </button>

          <h1 className="mb-1">{t("addresses.title")}</h1>

          <p className="text-muted mb-0">{t("addresses.subtitle")}</p>
        </div>

        <button
          type="button"
          className="btn btn-dark"
          onClick={() => navigate("/account/addresses/new")}
        >
          <Plus size={17} className="me-2" />
          {t("addresses.new")}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* LOADING */}

      {loading && <div className="text-center py-5">{t("common.loading")}</div>}

      {/* VUOTO */}

      {!loading && addresses.length === 0 && (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <MapPin size={50} strokeWidth={1.5} className="text-muted mb-3" />

            <h2 className="h5 mb-2">{t("addresses.empty")}</h2>

            <p className="text-muted mb-4">{t("addresses.emptyDescription")}</p>

            <button
              type="button"
              className="btn btn-dark"
              onClick={() => navigate("/account/addresses/new")}
            >
              <Plus size={17} className="me-2" />

              {t("addresses.new")}
            </button>
          </div>
        </div>
      )}

      {/* INDIRIZZI */}

      {!loading && addresses.length > 0 && (
        <div className="row g-4">
          {addresses.map((address) => (
            <div key={address.id} className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <div className="bg-light rounded p-2">
                      <MapPin size={20} />
                    </div>

                    <h2 className="h6 mb-0">{t("addresses.address")}</h2>
                  </div>

                  <div className="mb-4">
                    <div className="fw-semibold">{address.addressLine1}</div>

                    {address.addressLine2 && <div>{address.addressLine2}</div>}

                    <div>
                      {address.postalCode} {address.city}
                    </div>

                    <div>{address.country}</div>
                  </div>

                  <div className="mt-auto d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-dark flex-grow-1"
                      onClick={() =>
                        navigate(`/account/addresses/${address.id}/edit`)
                      }
                    >
                      <Pencil size={16} className="me-1" />

                      {t("addresses.edit")}
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      disabled={deletingId === address.id}
                      onClick={() => handleDelete(address.id)}
                      title={t("addresses.delete")}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

export default Addresses
