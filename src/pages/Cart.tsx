import { useTranslation } from "react-i18next"
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"
import { useCart } from "../context/CartContext"

function Cart() {
  const { t } = useTranslation()

  const { items, removeFromCart, updateQuantity, clearCart, totalItems } =
    useCart()

  if (items.length === 0) {
    return (
      <main className="container py-5 text-center">
        <ShoppingCart size={64} strokeWidth={1.5} className="text-muted mb-3" />

        <h1 className="mb-3">{t("cart.title")}</h1>

        <p className="text-muted">{t("cart.empty")}</p>
      </main>
    )
  }

  const totalPrice = items.reduce(
    (total, item) => total + item.tub.price * item.quantity,
    0,
  )

  return (
    <main className="container py-5">
      {/* TITOLO */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">{t("cart.title")}</h1>

        <button className="btn btn-outline-danger" onClick={clearCart}>
          <Trash2 size={17} className="me-1" />
          {t("cart.clear")}
        </button>
      </div>

      <div className="row g-4">
        {/* PRODOTTI */}

        <div className="col-12 col-lg-8">
          {items.map((item) => {
            const { flavor, tub, quantity } = item

            const canIncrease = quantity < flavor.stockPortions

            return (
              <div
                key={`${flavor.id}-${tub.id}`}
                className="card border-0 shadow-sm mb-3"
              >
                <div className="card-body">
                  <div className="row align-items-center g-3">
                    {/* IMMAGINE */}

                    <div className="col-4 col-sm-3">
                      {flavor.image && (
                        <img
                          src={flavor.image}
                          alt={flavor.name}
                          className="img-fluid rounded"
                          style={{
                            height: "100px",
                            width: "100%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                    </div>

                    {/* INFORMAZIONI */}

                    <div className="col-8 col-sm-4">
                      <h2 className="h5 mb-1">{flavor.name}</h2>

                      <p className="text-muted mb-1">
                        {t("cart.tubSize")}: {tub.weight} g
                      </p>

                      <p className="fw-semibold mb-0">
                        € {tub.price.toFixed(2)}
                      </p>
                    </div>

                    {/* QUANTITÀ */}

                    <div className="col-8 col-sm-3">
                      <div className="d-flex align-items-center">
                        <button
                          className="btn btn-outline-dark btn-sm"
                          onClick={() =>
                            updateQuantity(flavor.id, tub.id, quantity - 1)
                          }
                        >
                          <Minus size={16} />
                        </button>

                        <span
                          className="mx-3 fw-semibold"
                          style={{
                            minWidth: "20px",
                            textAlign: "center",
                          }}
                        >
                          {quantity}
                        </span>

                        <button
                          className="btn btn-outline-dark btn-sm"
                          disabled={!canIncrease}
                          onClick={() =>
                            updateQuantity(flavor.id, tub.id, quantity + 1)
                          }
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* RIMUOVI */}

                    <div className="col-4 col-sm-2 text-end">
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeFromCart(flavor.id, tub.id)}
                        title={t("cart.remove")}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* RIEPILOGO */}

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h2 className="h5 mb-4">{t("cart.summary")}</h2>

              <div className="d-flex justify-content-between mb-3">
                <span>{t("cart.items")}</span>

                <strong>{totalItems}</strong>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span>{t("cart.total")}</span>

                <strong>€ {totalPrice.toFixed(2)}</strong>
              </div>

              <hr />

              <button className="btn btn-dark w-100" disabled>
                {t("cart.checkout")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Cart
