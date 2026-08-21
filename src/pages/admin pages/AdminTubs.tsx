import { Edit, Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import { deleteTub, getTubs, type Tub } from "../../services/tubApi"

function AdminTubs() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [tubs, setTubs] = useState<Tub[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const size = 10

  const loadTubs = async () => {
    try {
      setLoading(true)
      setError("")

      const data = await getTubs(page, size, "weight")

      setTubs(data.content)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error(error)

      setError(t("admin.tubs.loadError"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTubs()
  }, [page])

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(t("admin.tubs.deleteConfirm"))

    if (!confirmed) {
      return
    }

    try {
      await deleteTub(id)

      /*
       * Se eliminiamo l'ultimo elemento
       * della pagina, torniamo alla pagina
       * precedente.
       */

      if (tubs.length === 1 && page > 0) {
        setPage((current) => current - 1)
      } else {
        await loadTubs()
      }
    } catch (error) {
      console.error(error)

      setError(t("admin.tubs.deleteError"))
    }
  }

  if (loading) {
    return <div className="text-center py-5">{t("common.loading")}</div>
  }

  return (
    <div>
      {/* HEADER */}

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="mb-1">{t("admin.tubs.title")}</h1>

          <p className="text-muted mb-0">{t("admin.tubs.subtitle")}</p>
        </div>

        <button
          type="button"
          className="btn btn-dark d-flex align-items-center gap-2"
          onClick={() => navigate("/admin/catalog/tubs/new")}
        >
          <Plus size={18} />

          {t("admin.tubs.newTub")}
        </button>
      </div>

      {/* ERROR */}

      {error && <div className="alert alert-danger">{error}</div>}

      {/* TABELLA */}

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {tubs.length === 0 ? (
            <div className="text-center py-5 text-muted">
              {t("admin.tubs.empty")}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>{t("admin.tubs.image")}</th>

                    <th>{t("admin.tubs.name")}</th>

                    <th>{t("admin.tubs.weight")}</th>

                    <th>{t("admin.tubs.price")}</th>

                    <th>{t("admin.tubs.available")}</th>

                    <th className="text-end">{t("admin.tubs.actions")}</th>
                  </tr>
                </thead>

                <tbody>
                  {tubs.map((tub) => (
                    <tr key={tub.id}>
                      {/* IMMAGINE */}

                      <td>
                        {tub.image ? (
                          <img
                            src={tub.image}
                            alt={tub.name}
                            style={{
                              width: 55,
                              height: 55,
                              objectFit: "cover",
                              borderRadius: 10,
                            }}
                          />
                        ) : (
                          <div
                            className="d-flex align-items-center justify-content-center bg-light text-muted"
                            style={{
                              width: 55,
                              height: 55,
                              borderRadius: 10,
                              fontSize: "0.75rem",
                            }}
                          >
                            —
                          </div>
                        )}
                      </td>

                      {/* NOME */}

                      <td>
                        <div className="fw-semibold">{tub.name}</div>

                        {tub.description && (
                          <div className="text-muted small">
                            {tub.description}
                          </div>
                        )}
                      </td>

                      {/* PESO */}

                      <td>{tub.weight} g</td>

                      {/* PREZZO */}

                      <td>{tub.price.toFixed(2)} €</td>

                      {/* DISPONIBILITÀ */}

                      <td>
                        {tub.available ? (
                          <span className="badge text-bg-success">
                            {t("admin.tubs.available")}
                          </span>
                        ) : (
                          <span className="badge text-bg-secondary">
                            {t("admin.tubs.unavailable")}
                          </span>
                        )}
                      </td>

                      {/* AZIONI */}

                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            title={t("admin.tubs.edit")}
                            onClick={() =>
                              navigate(`/admin/catalog/tubs/${tub.id}/edit`)
                            }
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            title={t("admin.tubs.delete")}
                            onClick={() => handleDelete(tub.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* PAGINAZIONE */}

      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            disabled={page === 0}
            onClick={() => setPage((current) => current - 1)}
          >
            ‹
          </button>

          {Array.from(
            {
              length: totalPages,
            },
            (_, index) => (
              <button
                key={index}
                type="button"
                className={`btn btn-sm ${
                  page === index ? "btn-dark" : "btn-outline-secondary"
                }`}
                onClick={() => setPage(index)}
              >
                {index + 1}
              </button>
            ),
          )}

          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            disabled={page === totalPages - 1}
            onClick={() => setPage((current) => current + 1)}
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminTubs
