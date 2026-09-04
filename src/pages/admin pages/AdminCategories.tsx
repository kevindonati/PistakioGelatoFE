import { Edit, Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import {
  deleteCategory,
  getCategories,
  type Category,
} from "../../services/categoryApi"

import "../../styles/AdminCategories.css"

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
    return <div className="admin-categories-loading">{t("common.loading")}</div>
  }

  return (
    <div className="admin-categories-page">
      <div className="admin-categories-header">
        <div>
          <h1>{t("admin.categories.title")}</h1>
          <p>{t("admin.categories.subtitle")}</p>
        </div>

        <button
          type="button"
          className="admin-categories-primary-button"
          onClick={() => navigate("/admin/catalog/categories/new")}
        >
          <Plus size={18} />
          {t("admin.categories.newCategory")}
        </button>
      </div>

      {error && <div className="admin-categories-error">{error}</div>}

      <div className="admin-categories-table-card">
        {categories.length === 0 ? (
          <div className="admin-categories-empty">
            {t("admin.categories.empty")}
          </div>
        ) : (
          <div className="admin-categories-table-wrapper">
            <table className="admin-categories-table">
              <thead>
                <tr>
                  <th>{t("admin.categories.image")}</th>
                  <th>{t("admin.categories.name")}</th>
                  <th>{t("admin.categories.description")}</th>
                  <th>{t("admin.categories.actions")}</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      {category.image ? (
                        <div className="admin-categories-image">
                          <img src={category.image} alt={category.name} />
                        </div>
                      ) : (
                        <div className="admin-categories-image-placeholder">
                          —
                        </div>
                      )}
                    </td>

                    <td>
                      <span className="admin-categories-name">
                        {category.name}
                      </span>
                    </td>

                    <td>
                      <span className="admin-categories-description">
                        {category.description}
                      </span>
                    </td>

                    <td>
                      <div className="admin-categories-actions">
                        <button
                          type="button"
                          className="admin-categories-action edit"
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
                          className="admin-categories-action delete"
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

      {totalPages > 1 && (
        <div className="admin-categories-pagination">
          <button
            type="button"
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
                className={page === index ? "active" : ""}
                onClick={() => setPage(index)}
              >
                {index + 1}
              </button>
            ),
          )}

          <button
            type="button"
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
