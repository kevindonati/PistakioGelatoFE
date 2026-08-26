import { useEffect, useState } from "react"

import { useTranslation } from "react-i18next"

import {
  CandyOff,
  Leaf,
  MilkOffIcon,
  WheatOffIcon,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react"

import { getCategories, getFlavors } from "../../services/catalogApi"

import type { Category } from "../../types/Category"

import type { Flavor } from "../../types/Flavor"

import Loading from "../../components/Loading"

import { useNavigate } from "react-router-dom"

import "../../styles/Catalog.css"

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

  const hasActiveFilters = activeFilters.length > 0 || selectedCategory !== null

  const clearFilters = () => {
    setActiveFilters([])

    setSelectedCategory(null)
  }

  if (loading) {
    return <Loading />
  }

  return (
    <main className="catalog">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="catalog-header">
        <div className="container">
          <div className="catalog-header-content">
            <span className="catalog-eyebrow">Pistakio Gelato</span>

            <h1>{t("catalog.title")}</h1>

            <p>{t("catalog.description")}</p>
          </div>
        </div>
      </section>

      {/* =====================================================
          CATALOG CONTENT
      ===================================================== */}

      <section className="catalog-content">
        <div className="container">
          {/* =================================================
              ERROR
          ================================================= */}

          {error && <div className="catalog-error">{error}</div>}

          {/* =================================================
              FILTERS
          ================================================= */}

          <div className="catalog-filters">
            <div className="catalog-filter-header">
              <div className="catalog-filter-title">
                <SlidersHorizontal size={18} />

                <span>{t("catalog.filters")}</span>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  className="catalog-clear-filters"
                  onClick={clearFilters}
                >
                  {t("catalog.clearFilters")}
                </button>
              )}
            </div>

            <div className="catalog-filter-list">
              {/* ALL */}

              <button
                type="button"
                className={`catalog-filter-button ${
                  activeFilters.length === 0 && selectedCategory === null
                    ? "active"
                    : ""
                }`}
                onClick={clearFilters}
              >
                {t("catalog.all")}
              </button>

              {/* AVAILABLE */}

              <button
                type="button"
                className={`catalog-filter-button ${
                  activeFilters.includes("available") ? "active" : ""
                }`}
                onClick={() => toggleFilter("available")}
              >
                {t("catalog.available")}
              </button>

              {/* VEGAN */}

              <button
                type="button"
                className={`catalog-filter-button ${
                  activeFilters.includes("vegan") ? "active" : ""
                }`}
                onClick={() => toggleFilter("vegan")}
              >
                <Leaf size={16} />

                {t("catalog.vegan")}
              </button>

              {/* LACTOSE FREE */}

              <button
                type="button"
                className={`catalog-filter-button ${
                  activeFilters.includes("lactoseFree") ? "active" : ""
                }`}
                onClick={() => toggleFilter("lactoseFree")}
              >
                <MilkOffIcon size={16} />

                {t("catalog.lactoseFree")}
              </button>

              {/* GLUTEN FREE */}

              <button
                type="button"
                className={`catalog-filter-button ${
                  activeFilters.includes("glutenFree") ? "active" : ""
                }`}
                onClick={() => toggleFilter("glutenFree")}
              >
                <WheatOffIcon size={16} />

                {t("catalog.glutenFree")}
              </button>

              {/* SUGAR FREE */}

              <button
                type="button"
                className={`catalog-filter-button ${
                  activeFilters.includes("sugarFree") ? "active" : ""
                }`}
                onClick={() => toggleFilter("sugarFree")}
              >
                <CandyOff size={16} />

                {t("catalog.sugarFree")}
              </button>
            </div>
          </div>

          {/* =================================================
              CATEGORIES
          ================================================= */}

          <div className="catalog-categories">
            <div className="catalog-categories-list">
              <button
                type="button"
                className={`catalog-category-button ${
                  selectedCategory === null ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(null)}
              >
                {t("catalog.all")}
              </button>

              {categories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  className={`catalog-category-button ${
                    selectedCategory === category.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* =================================================
              RESULTS HEADER
          ================================================= */}

          <div className="catalog-results-header">
            <div>
              <span className="catalog-results-label">
                {t("catalog.results")}
              </span>

              <strong>{filteredFlavors.length}</strong>
            </div>

            {hasActiveFilters && (
              <span className="catalog-active-message">
                {t("catalog.filtersActive")}
              </span>
            )}
          </div>

          {/* =================================================
              FLAVORS
          ================================================= */}

          {filteredFlavors.length === 0 ? (
            <div className="catalog-empty">
              <div className="catalog-empty-icon">
                <CandyOff size={30} />
              </div>

              <h2>{t("catalog.noFlavors")}</h2>

              <p>{t("catalog.noFlavorsDescription")}</p>

              {hasActiveFilters && (
                <button
                  type="button"
                  className="catalog-empty-button"
                  onClick={clearFilters}
                >
                  {t("catalog.clearFilters")}
                </button>
              )}
            </div>
          ) : (
            <div className="catalog-grid">
              {filteredFlavors.map((flavor) => {
                const isAvailable = flavor.available && flavor.stockPortions > 0

                return (
                  <article
                    key={flavor.id}
                    className="catalog-card"
                    onClick={() => navigate(`/catalog/flavors/${flavor.id}`)}
                  >
                    {/* IMAGE */}

                    <div className="catalog-card-image">
                      {flavor.image ? (
                        <img src={flavor.image} alt={flavor.name} />
                      ) : (
                        <div className="catalog-card-no-image">
                          <CandyOff size={35} />
                        </div>
                      )}

                      {!isAvailable && (
                        <span className="catalog-unavailable">
                          {t("catalog.unavailable")}
                        </span>
                      )}
                    </div>

                    {/* CONTENT */}

                    <div className="catalog-card-body">
                      <div className="catalog-card-title-row">
                        <h2>{flavor.name}</h2>
                      </div>

                      {flavor.description && (
                        <p className="catalog-card-description">
                          {flavor.description}
                        </p>
                      )}

                      {/* FEATURES */}

                      <div className="catalog-card-features">
                        {flavor.vegan && (
                          <span className="catalog-feature vegan">
                            <Leaf size={14} />
                            {t("catalog.vegan")}
                          </span>
                        )}

                        {flavor.lactoseFree && (
                          <span className="catalog-feature lactose">
                            <MilkOffIcon size={14} />
                            {t("catalog.lactoseFree")}
                          </span>
                        )}

                        {flavor.glutenFree && (
                          <span className="catalog-feature gluten">
                            <WheatOffIcon size={14} />
                            {t("catalog.glutenFree")}
                          </span>
                        )}

                        {flavor.sugarFree && (
                          <span className="catalog-feature sugar">
                            <CandyOff size={14} />
                            {t("catalog.sugarFree")}
                          </span>
                        )}
                      </div>

                      {/* CTA */}

                      <div className="catalog-card-footer">
                        <span>{t("catalog.discover")}</span>

                        <ArrowRight size={17} />
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default Catalog
