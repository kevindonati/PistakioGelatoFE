import { Edit, Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import {
  deleteCategory,
  getCategories,
  type Category,
} from "../../services/categoryApi"

function AdminCategories() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState("")

  const [page, setPage] = useState(0)

  const [totalPages, setTotalPages] = useState(0)

  const size = 10

  const loadCategories = async () => {
    try {
      setLoading(true)
      setError("")

      const data = await getCategories({
        page,
        size,
        orderBy: "image",
        language: "IT",
      })

      setCategories(data.content)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error(error)

      setError(t("admin.categories.loadError"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCategories()
  }, [page])

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(t("admin.categories.deleteConfirm"))

    if (!confirmed) {
      return
    }

    try {
      await deleteCategory(id)

      if (categories.length === 1 && page > 0) {
        setPage((current) => current - 1)
      } else {
        await loadCategories()
      }
    } catch (error) {
      console.error(error)

      setError(t("admin.categories.deleteError"))
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
          <h1 className="mb-1">{t("admin.categories.title")}</h1>

          <p className="text-muted mb-0">{t("admin.categories.subtitle")}</p>
        </div>

        <button
          type="button"
          className="btn btn-dark d-flex align-items-center gap-2"
          onClick={() => navigate("/admin/catalog/categories/new")}
        >
          <Plus size={18} />

          {t("admin.categories.newCategory")}
        </button>
      </div>

      {/* ERROR */}

      {error && <div className="alert alert-danger">{error}</div>}

      {/* TABELLA */}

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {categories.length === 0 ? (
            <div className="text-center py-5 text-muted">
              {t("admin.categories.empty")}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>{t("admin.categories.image")}</th>

                    <th>{t("admin.categories.name")}</th>

                    <th>{t("admin.categories.description")}</th>

                    <th className="text-end">
                      {t("admin.categories.actions")}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      {/* IMMAGINE */}

                      <td>
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
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
                            }}
                          >
                            —
                          </div>
                        )}
                      </td>

                      {/* NOME */}

                      <td>
                        <span className="fw-semibold">{category.name}</span>
                      </td>

                      {/* DESCRIZIONE */}

                      <td>
                        <span className="text-muted">
                          {category.description}
                        </span>
                      </td>

                      {/* AZIONI */}

                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            title={t("admin.categories.edit")}
                            onClick={() =>
                              navigate(
                                `/admin/catalog/categories/${category.id}/edit`,
                              )
                            }
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            title={t("admin.categories.delete")}
                            onClick={() => handleDelete(category.id)}
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

export default AdminCategories
