import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { CandyOff, Leaf, MilkOffIcon, WheatOffIcon } from "lucide-react"
import { getCategories, getFlavors } from "../../services/catalogApi"
import type { Category } from "../../types/Category"
import type { Flavor } from "../../types/Flavor"
import Loading from "../../components/Loading"
import { useNavigate } from "react-router-dom"

type FlavorFilter =
  | "available"
  | "vegan"
  | "lactoseFree"
  | "glutenFree"
  | "sugarFree"

function Catalog() {
  const { t } = useTranslation()
  const [categories, setCategories] = useState<Category[]>([])
  const [flavors, setFlavors] = useState<Flavor[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<FlavorFilter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setLoading(true)
        setError("")

        const [categoriesData, flavorsData] = await Promise.all([
          getCategories(0, 20),
          getFlavors(0, 50),
        ])

        setCategories(categoriesData.content)
        setFlavors(flavorsData.content)
      } catch (error) {
        console.error(error)
        setError(t("catalog.loadError"))
      } finally {
        setLoading(false)
      }
    }

    loadCatalog()
  }, [t])

  const toggleFilter = (filter: FlavorFilter) => {
    setActiveFilters((currentFilters) => {
      if (currentFilters.includes(filter)) {
        return currentFilters.filter((item) => item !== filter)
      }

      return [...currentFilters, filter]
    })
  }

  const filteredFlavors = flavors.filter((flavor) => {
    if (
      activeFilters.includes("available") &&
      (!flavor.available || flavor.stockPortions <= 0)
    ) {
      return false
    }

    if (activeFilters.includes("vegan") && !flavor.vegan) {
      return false
    }

    if (activeFilters.includes("lactoseFree") && !flavor.lactoseFree) {
      return false
    }

    if (activeFilters.includes("glutenFree") && !flavor.glutenFree) {
      return false
    }

    if (activeFilters.includes("sugarFree") && !flavor.sugarFree) {
      return false
    }

    if (selectedCategory !== null && flavor.category !== selectedCategory) {
      return false
    }

    return true
  })

  if (loading) {
    return <Loading />
  }

  return (
    <main className="container py-5">
      {/* TITOLO */}

      <h1 className="mb-4">{t("catalog.title")}</h1>

      {/* ERRORE */}

      {error && <div className="alert alert-danger">{error}</div>}

      {/* FILTRI */}

      <div className="d-flex flex-wrap gap-2 mb-3">
        <button
          className={`btn ${
            activeFilters.length === 0 ? "btn-dark" : "btn-outline-dark"
          }`}
          onClick={() => setActiveFilters([])}
        >
          {t("catalog.all")}
        </button>

        <button
          className={`btn ${
            activeFilters.includes("available")
              ? "btn-dark"
              : "btn-outline-dark"
          }`}
          onClick={() => toggleFilter("available")}
        >
          {t("catalog.available")}
        </button>

        <button
          className={`btn ${
            activeFilters.includes("vegan") ? "btn-dark" : "btn-outline-dark"
          }`}
          onClick={() => toggleFilter("vegan")}
        >
          <Leaf size={16} className="me-1" />
          {t("catalog.vegan")}
        </button>

        <button
          className={`btn ${
            activeFilters.includes("lactoseFree")
              ? "btn-dark"
              : "btn-outline-dark"
          }`}
          onClick={() => toggleFilter("lactoseFree")}
        >
          <MilkOffIcon size={16} className="me-1" />
          {t("catalog.lactoseFree")}
        </button>

        <button
          className={`btn ${
            activeFilters.includes("glutenFree")
              ? "btn-dark"
              : "btn-outline-dark"
          }`}
          onClick={() => toggleFilter("glutenFree")}
        >
          <WheatOffIcon size={16} className="me-1" />
          {t("catalog.glutenFree")}
        </button>

        <button
          className={`btn ${
            activeFilters.includes("sugarFree")
              ? "btn-dark"
              : "btn-outline-dark"
          }`}
          onClick={() => toggleFilter("sugarFree")}
        >
          <CandyOff size={16} className="me-1" />
          {t("catalog.sugarFree")}
        </button>
      </div>

      {/* CATEGORIE */}

      <div className="d-flex gap-2 flex-wrap mb-5">
        <button
          className={`btn ${
            selectedCategory === null ? "btn-dark" : "btn-outline-dark"
          }`}
          onClick={() => setSelectedCategory(null)}
        >
          {t("catalog.all")}
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            className={`btn ${
              selectedCategory === category.id ? "btn-dark" : "btn-outline-dark"
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* GUSTI */}

      {filteredFlavors.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted mb-0">{t("catalog.noFlavors")}</p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredFlavors.map((flavor) => (
            <div key={flavor.id} className="col-12 col-sm-6 col-lg-4">
              <div
                className="card h-100 shadow-sm border-0"
                role="button"
                onClick={() => navigate(`/catalog/flavors/${flavor.id}`)}
              >
                {/* IMMAGINE */}

                {flavor.image && (
                  <img
                    src={flavor.image}
                    className="card-img-top"
                    alt={flavor.name}
                    style={{
                      height: "220px",
                      objectFit: "cover",
                    }}
                  />
                )}

                <div className="card-body d-flex flex-column">
                  {/* NOME + DISPONIBILITÀ */}

                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h2 className="card-title h5 mb-0">{flavor.name}</h2>

                    {(!flavor.available || flavor.stockPortions <= 0) && (
                      <span className="badge text-bg-secondary">
                        {t("catalog.unavailable")}
                      </span>
                    )}
                  </div>

                  {/* DESCRIZIONE */}

                  {flavor.description && (
                    <p className="card-text text-muted">{flavor.description}</p>
                  )}

                  {/* CARATTERISTICHE */}

                  <div className="d-flex flex-wrap gap-2 mt-auto pt-3">
                    {flavor.vegan && (
                      <span className="badge text-bg-success d-flex align-items-center">
                        <Leaf size={16} className="me-1" />
                        {t("catalog.vegan")}
                      </span>
                    )}

                    {flavor.lactoseFree && (
                      <span className="badge text-bg-info d-flex align-items-center">
                        <MilkOffIcon size={16} className="me-1" />
                        {t("catalog.lactoseFree")}
                      </span>
                    )}

                    {flavor.glutenFree && (
                      <span className="badge text-bg-warning d-flex align-items-center">
                        <WheatOffIcon size={16} className="me-1" />
                        {t("catalog.glutenFree")}
                      </span>
                    )}

                    {flavor.sugarFree && (
                      <span className="badge text-bg-dark d-flex align-items-center">
                        <CandyOff size={16} className="me-1" />
                        {t("catalog.sugarFree")}
                      </span>
                    )}
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

export default Catalog
