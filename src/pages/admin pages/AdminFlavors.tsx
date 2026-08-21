import { useEffect, useMemo, useState } from "react"
import { Edit, Plus, Search, Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import { deleteFlavor, getFlavors, type Flavor } from "../../services/flavorApi"

import { getCategories, type Category } from "../../services/categoryApi"

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
  }, [page, pageSize, orderBy, language])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCategories()
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

      /*
       * Se eliminiamo l'ultimo elemento
       * dell'ultima pagina, torniamo
       * automaticamente alla pagina
       * precedente.
       */

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
    <div>
      {/* HEADER */}

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="mb-1">{t("admin.flavors.title")}</h1>

          <p className="text-muted mb-0">{t("admin.flavors.subtitle")}</p>
        </div>

        <button
          type="button"
          className="btn btn-dark d-flex align-items-center"
          onClick={() => navigate("/admin/catalog/flavors/new")}
        >
          <Plus size={18} className="me-2" />

          {t("admin.flavors.newFlavor")}
        </button>
      </div>

      {/* ERROR */}

      {error && <div className="alert alert-danger">{error}</div>}

      {/* FILTRI */}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            {/* RICERCA */}

            <div className="col-12 col-md-6 col-lg-5">
              <label className="form-label">{t("admin.flavors.search")}</label>

              <div className="input-group">
                <span className="input-group-text">
                  <Search size={16} />
                </span>

                <input
                  type="text"
                  className="form-control"
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

            {/* CATEGORIA */}

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label">
                {t("admin.flavors.category")}
              </label>

              <select
                className="form-select"
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

            {/* DISPONIBILITÀ */}

            <div className="col-12 col-md-6 col-lg-2">
              <label className="form-label">
                {t("admin.flavors.availability")}
              </label>

              <select
                className="form-select"
                value={availabilityFilter}
                onChange={(event) => {
                  setAvailabilityFilter(event.target.value)
                  setPage(0)
                }}
              >
                <option value="ALL">{t("admin.flavors.all")}</option>

                <option value="AVAILABLE">
                  {t("admin.flavors.available")}
                </option>

                <option value="UNAVAILABLE">
                  {t("admin.flavors.unavailable")}
                </option>
              </select>
            </div>

            {/* CERCA / RESET */}

            <div className="col-12 col-md-6 col-lg-2 d-flex align-items-end gap-2">
              <button
                type="button"
                className="btn btn-dark"
                onClick={handleSearch}
              >
                <Search size={16} className="me-1" />

                {t("admin.flavors.searchButton")}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleReset}
              >
                {t("admin.flavors.reset")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ORDINAMENTO */}

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        <span className="text-muted">
          {totalElements} {t("admin.flavors.total")}
        </span>

        <select
          className="form-select"
          style={{
            width: "220px",
          }}
          value={orderBy}
          onChange={(event) => {
            setOrderBy(event.target.value)
            setPage(0)
          }}
        >
          <option value="referralCode">{t("admin.flavors.sortCode")}</option>

          <option value="stockPortions">{t("admin.flavors.sortStock")}</option>
        </select>
      </div>

      {/* TABELLA */}

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>{t("admin.flavors.image")}</th>

                  <th>{t("admin.flavors.name")}</th>

                  <th>{t("admin.flavors.category")}</th>

                  <th>{t("admin.flavors.stock")}</th>

                  <th>{t("admin.flavors.features")}</th>

                  <th>{t("admin.flavors.availability")}</th>

                  <th className="text-end">{t("admin.flavors.actions")}</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5">
                      {t("common.loading")}
                    </td>
                  </tr>
                ) : filteredFlavors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      {t("admin.flavors.empty")}
                    </td>
                  </tr>
                ) : (
                  filteredFlavors.map((flavor) => (
                    <tr key={flavor.id}>
                      {/* IMMAGINE */}

                      <td>
                        <div
                          style={{
                            width: "55px",
                            height: "55px",
                          }}
                        >
                          {flavor.image ? (
                            <img
                              src={flavor.image}
                              alt={flavor.name}
                              className="rounded"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div className="bg-light rounded w-100 h-100 d-flex align-items-center justify-content-center">
                              🍦
                            </div>
                          )}
                        </div>
                      </td>

                      {/* NOME */}

                      <td>
                        <div className="fw-semibold">{flavor.name}</div>

                        <small className="text-muted">
                          {flavor.referralCode}
                        </small>
                      </td>

                      {/* CATEGORIA */}

                      <td>{getCategoryName(flavor.category)}</td>

                      {/* STOCK */}

                      <td>
                        <span
                          className={
                            flavor.stockPortions === 0
                              ? "text-danger fw-semibold"
                              : "fw-semibold"
                          }
                        >
                          {flavor.stockPortions}
                        </span>
                      </td>

                      {/* CARATTERISTICHE */}

                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {flavor.vegan && (
                            <span className="badge text-bg-success">
                              {t("catalog.vegan")}
                            </span>
                          )}

                          {flavor.lactoseFree && (
                            <span className="badge text-bg-info">
                              {t("catalog.lactoseFree")}
                            </span>
                          )}

                          {flavor.glutenFree && (
                            <span className="badge text-bg-warning">
                              {t("catalog.glutenFree")}
                            </span>
                          )}

                          {flavor.sugarFree && (
                            <span className="badge text-bg-secondary">
                              {t("catalog.sugarFree")}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* DISPONIBILITÀ */}

                      <td>
                        <span
                          className={`badge ${
                            flavor.available
                              ? "text-bg-success"
                              : "text-bg-danger"
                          }`}
                        >
                          {flavor.available
                            ? t("admin.flavors.available")
                            : t("admin.flavors.unavailable")}
                        </span>
                      </td>

                      {/* AZIONI */}

                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            type="button"
                            className="btn btn-outline-dark btn-sm"
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
                            className="btn btn-outline-danger btn-sm"
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
        </div>
      </div>

      {/* PAGINAZIONE */}

      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary"
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
            className="btn btn-outline-secondary"
            disabled={page >= totalPages - 1 || loading}
            onClick={() => setPage((currentPage) => currentPage + 1)}
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminFlavors
