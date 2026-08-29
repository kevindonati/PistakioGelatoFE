import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  ArrowLeft,
  ArrowRight,
  CandyOff,
  Check,
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
import "../../styles/FlavorDetails.css"
import { useAuth } from "../../context/useAuth"

function FlavorDetails() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
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
      <main className="flavor-details-error">
        <div className="container">
          <div className="flavor-error-content">
            <div className="flavor-error-icon">
              <CandyOff size={30} />
            </div>

            <h1>{t("catalog.flavorNotFound")}</h1>

            <p>{error || t("catalog.flavorNotFound")}</p>

            <button
              type="button"
              className="flavor-back-button"
              onClick={() => navigate("/catalog")}
            >
              <ArrowLeft size={17} />

              {t("catalog.backToCatalog")}
            </button>
          </div>
        </div>
      </main>
    )
  }

  const isAvailable = flavor.available && flavor.stockPortions > 0
  const canPurchase = isAvailable && selectedTub !== null

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
    <main className="flavor-details bg-body-tertiary">
      <div className="container">
        {/* BACK */}

        <button
          type="button"
          className="flavor-back"
          onClick={() => navigate("/catalog")}
        >
          <ArrowLeft size={17} />

          {t("catalog.backToCatalog")}
        </button>

        {/* PRODUCT */}

        <div className="flavor-product">
          {/* IMAGE */}

          <div className="flavor-image-wrapper">
            {flavor.image ? (
              <img
                src={flavor.image}
                alt={flavor.name}
                className="flavor-main-image"
              />
            ) : (
              <div className="flavor-no-image">
                <CandyOff size={50} />
              </div>
            )}

            {!isAvailable && (
              <span className="flavor-unavailable">
                {t("catalog.unavailable")}
              </span>
            )}
          </div>

          {/* INFO */}

          <div className="flavor-info">
            <div className="flavor-title-row">
              <h1>{flavor.name}</h1>
            </div>

            {/* DESCRIPTION */}

            {flavor.description && (
              <p className="flavor-description">{flavor.description}</p>
            )}

            {/* FEATURES */}

            <div className="flavor-features">
              {flavor.vegan && (
                <span className="flavor-feature vegan">
                  <Leaf size={15} />

                  {t("catalog.vegan")}
                </span>
              )}

              {flavor.lactoseFree && (
                <span className="flavor-feature lactose">
                  <MilkOffIcon size={15} />

                  {t("catalog.lactoseFree")}
                </span>
              )}

              {flavor.glutenFree && (
                <span className="flavor-feature gluten">
                  <WheatOffIcon size={15} />

                  {t("catalog.glutenFree")}
                </span>
              )}

              {flavor.sugarFree && (
                <span className="flavor-feature sugar">
                  <CandyOff size={15} />

                  {t("catalog.sugarFree")}
                </span>
              )}
            </div>

            <div className="flavor-divider" />

            {/* UNAVAILABLE */}

            {!isAvailable && (
              <div className="flavor-unavailable-message">
                <strong>{t("catalog.unavailable")}</strong>

                <p>{t("catalog.unavailableDescription")}</p>
              </div>
            )}

            {/* TUBS */}

            {isAvailable && tubs.length > 0 && (
              <div className="flavor-option-section">
                <div className="flavor-option-header">
                  <h2>{t("cart.tubSize")}</h2>

                  {selectedTub && <span>{selectedTub.weight} g</span>}
                </div>

                <div className="flavor-tubs">
                  {tubs.map((tub) => {
                    const selected = selectedTub?.id === tub.id

                    return (
                      <button
                        key={tub.id}
                        type="button"
                        className={`flavor-tub ${selected ? "selected" : ""}`}
                        onClick={() => handleTubChange(tub)}
                      >
                        <div className="flavor-tub-check">
                          {selected && <Check size={13} />}
                        </div>

                        <div className="flavor-tub-info">
                          <strong>{tub.name}</strong>

                          <span>{tub.weight} g</span>
                        </div>

                        <strong className="flavor-tub-price">
                          € {tub.price.toFixed(2)}
                        </strong>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* NO TUB */}

            {isAvailable && tubs.length === 0 && (
              <div className="flavor-no-tub">{t("cart.noTubAvailable")}</div>
            )}

            {/* QUANTITY */}

            {canPurchase && (
              <div className="flavor-purchase">
                <div className="flavor-quantity">
                  <span>{t("cart.quantity")}</span>

                  <div className="flavor-quantity-control">
                    <button
                      type="button"
                      onClick={handleDecrease}
                      disabled={quantity <= 1}
                      aria-label={t("cart.decrease")}
                    >
                      <Minus size={17} />
                    </button>

                    <strong>{quantity}</strong>

                    <button
                      type="button"
                      onClick={handleIncrease}
                      disabled={quantity >= flavor.stockPortions}
                      aria-label={t("cart.increase")}
                    >
                      <Plus size={17} />
                    </button>
                  </div>
                </div>

                {isAuthenticated ? (
                  <button
                    type="button"
                    className="flavor-add-button"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart size={19} />

                    {t("cart.add")}

                    <ArrowRight size={17} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="flavor-add-button"
                    onClick={() => navigate("/login")}
                  >
                    <ShoppingCart size={19} />

                    {t("catalog.loginToPurchase")}

                    <ArrowRight size={17} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default FlavorDetails
