import { Edit, Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import { deleteTub, getTubs, type Tub } from "../../services/tubApi"

import "../../styles/AdminTubs.css"

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
      setError("")

      await deleteTub(id)

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
    return (
      <div className="admin-tubs-loading">
        <div className="admin-tubs-spinner" />
        <span>{t("common.loading")}</span>
      </div>
    )
  }

  return (
    <div className="admin-tubs-page">
      <div className="admin-tubs-header">
        <div>
          <h1>{t("admin.tubs.title")}</h1>
          <p>{t("admin.tubs.subtitle")}</p>
        </div>

        <button
          type="button"
          className="admin-tubs-new-button"
          onClick={() => navigate("/admin/catalog/tubs/new")}
        >
          <Plus size={18} />
          {t("admin.tubs.newTub")}
        </button>
      </div>

      {error && <div className="admin-tubs-error">{error}</div>}

      <div className="admin-tubs-card">
        {tubs.length === 0 ? (
          <div className="admin-tubs-empty">
            <div className="admin-tubs-empty-icon">
              <PackageIcon />
            </div>

            <h2>{t("admin.tubs.empty")}</h2>
          </div>
        ) : (
          <div className="admin-tubs-table-wrapper">
            <table className="admin-tubs-table">
              <thead>
                <tr>
                  <th>{t("admin.tubs.image")}</th>
                  <th>{t("admin.tubs.name")}</th>
                  <th>{t("admin.tubs.weight")}</th>
                  <th>{t("admin.tubs.price")}</th>
                  <th>{t("admin.tubs.available")}</th>
                  <th className="admin-tubs-actions-heading">
                    {t("admin.tubs.actions")}
                  </th>
                </tr>
              </thead>

              <tbody>
                {tubs.map((tub) => (
                  <tr key={tub.id}>
                    <td>
                      {tub.image ? (
                        <img
                          src={tub.image}
                          alt={tub.name}
                          className="admin-tubs-image"
                        />
                      ) : (
                        <div className="admin-tubs-no-image">—</div>
                      )}
                    </td>

                    <td>
                      <div className="admin-tubs-name">{tub.name}</div>

                      {tub.description && (
                        <div className="admin-tubs-description">
                          {tub.description}
                        </div>
                      )}
                    </td>

                    <td>
                      <span className="admin-tubs-value">{tub.weight} g</span>
                    </td>

                    <td>
                      <span className="admin-tubs-price">
                        {tub.price.toFixed(2)} €
                      </span>
                    </td>

                    <td>
                      {tub.available ? (
                        <span className="admin-tubs-status admin-tubs-status-available">
                          {t("admin.tubs.available")}
                        </span>
                      ) : (
                        <span className="admin-tubs-status admin-tubs-status-unavailable">
                          {t("admin.tubs.unavailable")}
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="admin-tubs-actions">
                        <button
                          type="button"
                          className="admin-tubs-edit-button"
                          title={t("admin.tubs.edit")}
                          onClick={() =>
                            navigate(`/admin/catalog/tubs/${tub.id}/edit`)
                          }
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          type="button"
                          className="admin-tubs-delete-button"
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

      {totalPages > 1 && (
        <div className="admin-tubs-pagination">
          <button
            type="button"
            className="admin-tubs-page-button"
            disabled={page === 0}
            onClick={() => setPage((current) => current - 1)}
          >
            ‹
          </button>

          <div className="admin-tubs-page-numbers">
            {Array.from(
              {
                length: totalPages,
              },
              (_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`admin-tubs-page-number ${
                    page === index ? "admin-tubs-page-number-active" : ""
                  }`}
                  onClick={() => setPage(index)}
                >
                  {index + 1}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            className="admin-tubs-page-button"
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

function PackageIcon() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m16.5 9.4-9-5.19" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.27 6.96 12 12.01l8.73-5.05" />
      <path d="M12 22.08V12" />
    </svg>
  )
}

export default AdminTubs
