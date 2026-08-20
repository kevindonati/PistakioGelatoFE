import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  ArrowLeft,
  CandyOff,
  Leaf,
  MilkOffIcon,
  Minus,
  Plus,
  ShoppingCart,
  WheatOffIcon,
} from "lucide-react"

import { getFlavorById, getTubs } from "../../services/catalogApi"
import { useCart } from "../../context/CartContext"

import type { Flavor } from "../../types/Flavor"
import type { Tub } from "../../types/Tub"
import Loading from "../../components/Loading"

function FlavorDetails() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()

  const { addToCart } = useCart()

  const [flavor, setFlavor] = useState<Flavor | null>(null)
  const [tubs, setTubs] = useState<Tub[]>([])
  const [selectedTub, setSelectedTub] = useState<Tub | null>(null)

  const [quantity, setQuantity] = useState(1)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError(t("catalog.flavorNotFound"))
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError("")

        const [flavorData, tubsData] = await Promise.all([
          getFlavorById(id),
          getTubs(),
        ])

        setFlavor(flavorData)

        const availableTubs = tubsData.filter((tub) => tub.available)

        setTubs(availableTubs)

        if (availableTubs.length > 0) {
          setSelectedTub(availableTubs[0])
        }
      } catch (error) {
        console.error(error)
        setError(t("catalog.flavorNotFound"))
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, t])

  if (loading) {
    return <Loading />
  }

  if (error || !flavor) {
    return (
      <main className="container py-5 text-center">
        <p className="text-muted">{error || t("catalog.flavorNotFound")}</p>

        <button className="btn btn-dark" onClick={() => navigate("/catalog")}>
          <ArrowLeft size={16} className="me-1" />
          {t("catalog.backToCatalog")}
        </button>
      </main>
    )
  }

  const isAvailable = flavor.available && flavor.stockPortions > 0

  const canAddToCart = isAvailable && selectedTub !== null

  const handleIncrease = () => {
    if (quantity < flavor.stockPortions) {
      setQuantity((current) => current + 1)
    }
  }

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((current) => current - 1)
    }
  }

  const handleTubChange = (tub: Tub) => {
    setSelectedTub(tub)
    setQuantity(1)
  }

  const handleAddToCart = () => {
    if (!selectedTub) {
      return
    }
    addToCart(flavor, selectedTub, quantity)
    setQuantity(1)
  }

  return (
    <main className="container py-5">
      {/* TORNA AL CATALOGO */}

      <button
        className="btn btn-outline-dark mb-4"
        onClick={() => navigate("/catalog")}
      >
        <ArrowLeft size={16} className="me-1" />
        {t("catalog.backToCatalog")}
      </button>

      <div className="row g-5">
        {/* IMMAGINE */}

        <div className="col-12 col-md-6">
          {flavor.image && (
            <img
              src={flavor.image}
              alt={flavor.name}
              className="img-fluid rounded shadow-sm w-100"
              style={{
                maxHeight: "500px",
                objectFit: "cover",
              }}
            />
          )}
        </div>

        {/* INFORMAZIONI */}

        <div className="col-12 col-md-6">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h1 className="mb-0">{flavor.name}</h1>

            {!isAvailable && (
              <span className="badge text-bg-secondary">
                {t("catalog.unavailable")}
              </span>
            )}
          </div>

          {flavor.description && (
            <p className="text-muted fs-5">{flavor.description}</p>
          )}

          {/* CARATTERISTICHE */}

          <div className="d-flex flex-wrap gap-2 mt-4">
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

          {/* DISPONIBILITÀ */}

          <div className="mt-4">
            {isAvailable ? (
              <p className="text-success mb-0">{t("catalog.available")}</p>
            ) : (
              <p className="text-danger mb-0">{t("catalog.unavailable")}</p>
            )}
          </div>

          {/* VASCHETTE */}

          {isAvailable && tubs.length > 0 && (
            <div className="mt-4">
              <h2 className="h5 mb-3">{t("cart.tubSize")}</h2>

              <div className="d-flex flex-wrap gap-2">
                {tubs.map((tub) => (
                  <button
                    key={tub.id}
                    type="button"
                    className={`btn ${
                      selectedTub?.id === tub.id
                        ? "btn-dark"
                        : "btn-outline-dark"
                    }`}
                    onClick={() => handleTubChange(tub)}
                  >
                    {tub.weight} g — € {tub.price.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUANTITÀ */}

          {canAddToCart && (
            <div className="mt-4">
              <h2 className="h5 mb-3">{t("cart.quantity")}</h2>

              <div className="d-flex align-items-center gap-3">
                <button
                  className="btn btn-outline-dark"
                  onClick={handleDecrease}
                  disabled={quantity <= 1}
                >
                  <Minus size={18} />
                </button>

                <span
                  className="fw-semibold"
                  style={{
                    minWidth: "30px",
                    textAlign: "center",
                    fontSize: "1.2rem",
                  }}
                >
                  {quantity}
                </span>

                <button
                  className="btn btn-outline-dark"
                  onClick={handleIncrease}
                  disabled={quantity >= flavor.stockPortions}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          )}

          {/* AGGIUNGI AL CARRELLO */}

          {canAddToCart && (
            <button className="btn btn-dark mt-4" onClick={handleAddToCart}>
              <ShoppingCart size={18} className="me-2" />
              {t("cart.add")}
            </button>
          )}

          {/* NESSUNA VASCHETTA */}

          {isAvailable && tubs.length === 0 && (
            <p className="text-danger mt-4">{t("cart.noTubAvailable")}</p>
          )}
        </div>
      </div>
    </main>
  )
}

export default FlavorDetails
