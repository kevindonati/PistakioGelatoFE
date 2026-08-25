import { useTranslation } from "react-i18next"

import {
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShoppingBag,
} from "lucide-react"

import { useCart } from "../../context/CartContext"

import { useNavigate } from "react-router-dom"

import Loading from "../../components/Loading"

import "../../styles/Cart.css"

function Cart() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    loading,
  } = useCart()

  if (loading) {
    return <Loading />
  }

  if (items.length === 0) {
    return (
      <main className="cart-page">
        <div className="cart-empty">
          <div className="cart-empty-icon">
            <ShoppingCart size={42} strokeWidth={1.7} />
          </div>

          <h1>{t("cart.title")}</h1>

          <p>{t("cart.empty")}</p>

          <button
            type="button"
            className="cart-shopping-button"
            onClick={() => navigate("/catalog")}
          >
            <ShoppingBag size={18} />
            {t("cart.continueShopping")}
          </button>
        </div>
      </main>
    )
  }

  const totalPrice = items.reduce(
    (total, item) => total + item.tub.price * item.quantity,
    0,
  )

  return (
    <main className="cart-page">
      <div className="container">
        {/* HEADER */}
        <div className="cart-header">
          <div>
            <h1>{t("cart.title")}</h1>

            <p>
              {totalItems}{" "}
              {totalItems === 1 ? t("cart.product") : t("cart.products")}
            </p>
          </div>

          <button
            type="button"
            className="cart-clear-button"
            onClick={clearCart}
          >
            <Trash2 size={17} />
            <span>{t("cart.clear")}</span>
          </button>
        </div>

        <div className="cart-layout">
          {/* PRODOTTI */}
          <section className="cart-products">
            {items.map((item) => {
              const { flavor, tub, quantity } = item

              const canIncrease = quantity < flavor.stockPortions

              const itemTotal = tub.price * quantity

              return (
                <article
                  key={`${flavor.id}-${tub.id}`}
                  className="cart-product"
                >
                  {/* IMMAGINE */}
                  <div className="cart-product-image">
                    {flavor.image ? (
                      <img src={flavor.image} alt={flavor.name} />
                    ) : (
                      <ShoppingCart size={32} strokeWidth={1.5} />
                    )}
                  </div>

                  {/* INFO */}
                  <div className="cart-product-info">
                    <h2>{flavor.name}</h2>

                    <span className="cart-product-weight">
                      {t("cart.tubSize")}: {tub.weight} g
                    </span>

                    <span className="cart-product-price">
                      € {tub.price.toFixed(2)}
                    </span>
                  </div>

                  {/* QUANTITÀ */}
                  <div className="cart-product-actions">
                    <div className="cart-quantity">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(flavor.id, tub.id, quantity - 1)
                        }
                        disabled={quantity <= 1}
                        aria-label={t("cart.decreaseQuantity")}
                      >
                        <Minus size={15} />
                      </button>

                      <span>{quantity}</span>

                      <button
                        type="button"
                        disabled={!canIncrease}
                        onClick={() =>
                          updateQuantity(flavor.id, tub.id, quantity + 1)
                        }
                        aria-label={t("cart.increaseQuantity")}
                      >
                        <Plus size={15} />
                      </button>
                    </div>

                    <span className="cart-product-total">
                      € {itemTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* RIMUOVI */}
                  <button
                    type="button"
                    className="cart-remove-button"
                    onClick={() => removeFromCart(flavor.id, tub.id)}
                    title={t("cart.remove")}
                    aria-label={t("cart.remove")}
                  >
                    <Trash2 size={18} />
                  </button>
                </article>
              )
            })}
          </section>

          {/* RIEPILOGO */}
          <aside className="cart-summary">
            <div className="cart-summary-card">
              <h2>{t("cart.summary")}</h2>

              <div className="cart-summary-row">
                <span>{t("cart.items")}</span>
                <span>{totalItems}</span>
              </div>

              <div className="cart-summary-row">
                <span>{t("cart.subtotal")}</span>
                <span>€ {totalPrice.toFixed(2)}</span>
              </div>

              <div className="cart-summary-divider" />

              <div className="cart-summary-total">
                <span>{t("cart.total")}</span>

                <strong>€ {totalPrice.toFixed(2)}</strong>
              </div>

              <button
                type="button"
                className="cart-checkout-button"
                onClick={() => navigate("/checkout")}
              >
                {t("cart.checkout")}
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                className="cart-continue-button"
                onClick={() => navigate("/catalog")}
              >
                <ShoppingBag size={17} />
                {t("cart.continueShopping")}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

export default Cart
