import { useEffect, useMemo, useState } from "react"
import { Edit, Plus, Search, Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { deleteFlavor, getFlavors, type Flavor } from "../../services/flavorApi"
import { getCategories, type Category } from "../../services/categoryApi"
import "../../styles/AdminFlavor.css"

function AdminFlavors() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const [flavors, setFlavors] = useState<Flavor[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [error, setError] = useState("")

  const [page, setPage] = useState(0)
  const [pageSize] = useState(15)

  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [orderBy, setOrderBy] = useState("referralCode")

  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [availabilityFilter, setAvailabilityFilter] = useState("ALL")

  const [searchInput, setSearchInput] = useState("")

  const language = i18n.language.substring(0, 2).toUpperCase() as
    | "IT"
    | "EN"
    | "FR"
    | "DE"

  const loadFlavors = async () => {
    try {
      setLoading(true)
      setError("")

      const data = await getFlavors({
        page,
        size: pageSize,
        orderBy,
        language,
      })

      setFlavors(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (error) {
      console.error(error)
      setError(t("admin.flavors.loadError"))
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await getCategories({
        page: 0,
        size: 50,
        language,
      })

      setCategories(data.content)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFlavors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, orderBy, language])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language])

  const filteredFlavors = useMemo(() => {
    return flavors.filter((flavor) => {
      const searchValue = search.toLowerCase()

      const matchesSearch =
        flavor.name.toLowerCase().includes(searchValue) ||
        flavor.referralCode.toLowerCase().includes(searchValue)

      const matchesCategory =
        categoryFilter === "ALL" || flavor.category === categoryFilter

      const matchesAvailability =
        availabilityFilter === "ALL" ||
        (availabilityFilter === "AVAILABLE" && flavor.available) ||
        (availabilityFilter === "UNAVAILABLE" && !flavor.available)

      return matchesSearch && matchesCategory && matchesAvailability
    })
  }, [flavors, search, categoryFilter, availabilityFilter])

  const handleSearch = () => {
    setPage(0)
    setSearch(searchInput)
  }

  const handleReset = () => {
    setSearchInput("")
    setSearch("")
    setCategoryFilter("ALL")
    setAvailabilityFilter("ALL")
    setPage(0)
  }

  const handleDelete = async (flavor: Flavor) => {
    const confirmed = window.confirm(
      t("admin.flavors.deleteConfirm", {
        name: flavor.name,
      }),
    )

    if (!confirmed) {
      return
    }

    try {
      setDeleteLoading(true)
      setError("")

      await deleteFlavor(flavor.id)

      if (flavors.length === 1 && page > 0) {
        setPage((currentPage) => currentPage - 1)
      } else {
        await loadFlavors()
      }
    } catch (error) {
      console.error(error)
      setError(t("admin.flavors.deleteError"))
    } finally {
      setDeleteLoading(false)
    }
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((item) => item.id === categoryId)

    return category?.name ?? "—"
  }

  return (
    <div className="admin-flavors-page">
      <div className="admin-flavors-container">
        <header className="admin-flavors-header">
          <div>
            <h1>{t("admin.flavors.title")}</h1>
            <p>{t("admin.flavors.subtitle")}</p>
          </div>

          <button
            type="button"
            className="admin-flavors-primary-button"
            onClick={() => navigate("/admin/catalog/flavors/new")}
          >
            <Plus size={18} />
            {t("admin.flavors.newFlavor")}
          </button>
        </header>

        {error && <div className="admin-flavors-error">{error}</div>}

        <section className="admin-flavors-filters">
          <div className="admin-flavors-field admin-flavors-search-field">
            <label>{t("admin.flavors.search")}</label>

            <div className="admin-flavors-input-wrapper">
              <Search size={17} />

              <input
                type="text"
                placeholder={t("admin.flavors.searchPlaceholder")}
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearch()
                  }
                }}
              />
            </div>
          </div>

          <div className="admin-flavors-field">
            <label>{t("admin.flavors.category")}</label>

            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value)
                setPage(0)
              }}
            >
              <option value="ALL">{t("admin.flavors.allCategories")}</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-flavors-field">
            <label>{t("admin.flavors.availability")}</label>

            <select
              value={availabilityFilter}
              onChange={(event) => {
                setAvailabilityFilter(event.target.value)
                setPage(0)
              }}
            >
              <option value="ALL">{t("admin.flavors.all")}</option>

              <option value="AVAILABLE">{t("admin.flavors.available")}</option>

              <option value="UNAVAILABLE">
                {t("admin.flavors.unavailable")}
              </option>
            </select>
          </div>

          <div className="admin-flavors-filter-actions">
            <button
              type="button"
              className="admin-flavors-search-button"
              onClick={handleSearch}
            >
              <Search size={16} />
              {t("admin.flavors.searchButton")}
            </button>

            <button
              type="button"
              className="admin-flavors-reset-button"
              onClick={handleReset}
            >
              {t("admin.flavors.reset")}
            </button>
          </div>
        </section>

        <div className="admin-flavors-toolbar">
          <span>
            {totalElements} {t("admin.flavors.total")}
          </span>

          <select
            value={orderBy}
            onChange={(event) => {
              setOrderBy(event.target.value)
              setPage(0)
            }}
          >
            <option value="referralCode">{t("admin.flavors.sortCode")}</option>

            <option value="stockPortions">
              {t("admin.flavors.sortStock")}
            </option>
          </select>
        </div>

        <section className="admin-flavors-table-card">
          <div className="admin-flavors-table-wrapper">
            <table className="admin-flavors-table">
              <thead>
                <tr>
                  <th>{t("admin.flavors.image")}</th>
                  <th>{t("admin.flavors.name")}</th>
                  <th>{t("admin.flavors.category")}</th>
                  <th>{t("admin.flavors.stock")}</th>
                  <th>{t("admin.flavors.features")}</th>
                  <th>{t("admin.flavors.availability")}</th>
                  <th>{t("admin.flavors.actions")}</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="admin-flavors-empty">
                        {t("common.loading")}
                      </div>
                    </td>
                  </tr>
                ) : filteredFlavors.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="admin-flavors-empty">
                        {t("admin.flavors.empty")}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredFlavors.map((flavor) => (
                    <tr key={flavor.id}>
                      <td>
                        <div className="admin-flavors-image">
                          {flavor.image ? (
                            <img src={flavor.image} alt={flavor.name} />
                          ) : (
                            <div className="admin-flavors-image-placeholder">
                              🍦
                            </div>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="admin-flavors-name">{flavor.name}</div>

                        <small>{flavor.referralCode}</small>
                      </td>

                      <td>
                        <span className="admin-flavors-category">
                          {getCategoryName(flavor.category)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            flavor.stockPortions === 0
                              ? "admin-flavors-stock admin-flavors-stock-empty"
                              : "admin-flavors-stock"
                          }
                        >
                          {flavor.stockPortions}
                        </span>
                      </td>

                      <td>
                        <div className="admin-flavors-features">
                          {flavor.vegan && (
                            <span className="admin-flavors-feature vegan">
                              {t("catalog.vegan")}
                            </span>
                          )}

                          {flavor.lactoseFree && (
                            <span className="admin-flavors-feature lactose">
                              {t("catalog.lactoseFree")}
                            </span>
                          )}

                          {flavor.glutenFree && (
                            <span className="admin-flavors-feature gluten">
                              {t("catalog.glutenFree")}
                            </span>
                          )}

                          {flavor.sugarFree && (
                            <span className="admin-flavors-feature sugar">
                              {t("catalog.sugarFree")}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span
                          className={
                            flavor.available
                              ? "admin-flavors-availability available"
                              : "admin-flavors-availability unavailable"
                          }
                        >
                          {flavor.available
                            ? t("admin.flavors.available")
                            : t("admin.flavors.unavailable")}
                        </span>
                      </td>

                      <td>
                        <div className="admin-flavors-actions">
                          <button
                            type="button"
                            className="admin-flavors-action edit"
                            title={t("admin.flavors.edit")}
                            onClick={() =>
                              navigate(
                                `/admin/catalog/flavors/${flavor.id}/edit`,
                              )
                            }
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            type="button"
                            className="admin-flavors-action delete"
                            title={t("admin.flavors.delete")}
                            disabled={deleteLoading}
                            onClick={() => handleDelete(flavor)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {totalPages > 1 && (
          <div className="admin-flavors-pagination">
            <button
              type="button"
              disabled={page === 0 || loading}
              onClick={() => setPage((currentPage) => currentPage - 1)}
            >
              ‹
            </button>

            <span>
              {page + 1} / {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages - 1 || loading}
              onClick={() => setPage((currentPage) => currentPage + 1)}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminFlavors
