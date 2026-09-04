import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { ArrowRight, Award, Heart, Truck, ShoppingBag } from "lucide-react"
import { getFlavors, getTubs } from "../../services/catalogApi"
import type { Flavor } from "../../types/Flavor"
import type { Tub } from "../../types/Tub"
import Loading from "../../components/Loading"
import "../../styles/Home.css"
import imageHero from "../../assets/foto gelateria.jpg"

function Home() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [flavors, setFlavors] = useState<Flavor[]>([])
  const [tubs, setTubs] = useState<Tub[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [flavorsData, tubsData] = await Promise.all([
          getFlavors(0, 50),
          getTubs(),
        ])
        setFlavors(flavorsData.content)
        setTubs(tubsData)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    loadHomeData()
  }, [])

  const featuredFlavors = flavors
    .filter(
      (flavor): flavor is Flavor & { image: string } =>
        flavor.available && flavor.stockPortions > 0 && flavor.image !== null,
    )
    .slice(0, 4)

  const availableTubs = tubs
    .filter(
      (tub): tub is Tub & { image: string } =>
        tub.available && tub.image !== null,
    )
    .slice(0, 3)

  if (loading) {
    return <Loading />
  }

  return (
    <main className="home">
      {/* HERO */}

      <section
        className="home-hero"
        style={{ backgroundImage: `url(${imageHero})` }}
      >
        <div className="container">
          <div className="home-hero-content">
            <div className="home-hero-text">
              <span className="home-eyebrow">{t("home.hero.eyebrow")}</span>

              <h1 className="text-white">{t("home.hero.title")}</h1>

              <p className="text-white">{t("home.hero.description")}</p>

              <button
                type="button"
                className="home-primary-button"
                onClick={() => navigate("/catalog")}
              >
                {t("home.hero.cta")}

                <ArrowRight size={19} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FLAVORS */}

      <section className="home-flavors">
        <div className="container">
          <div className="home-section-header">
            <span className="home-section-label">
              {t("home.flavors.label")}
            </span>

            <h2>{t("home.flavors.title")}</h2>

            <p>{t("home.flavors.description")}</p>
          </div>

          {featuredFlavors.length > 0 ? (
            <div className="home-flavors-grid">
              {featuredFlavors.map((flavor) => (
                <button
                  type="button"
                  key={flavor.id}
                  className="home-flavor-card"
                  onClick={() => navigate(`/catalog/flavors/${flavor.id}`)}
                >
                  <div className="home-flavor-image">
                    <img src={flavor.image} alt={flavor.name} />
                  </div>

                  <div className="home-flavor-content">
                    <h3>{flavor.name}</h3>

                    <span>
                      {t("home.flavors.discover")}

                      <ArrowRight size={16} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="home-flavors-empty">
              <p>{t("home.flavors.noFlavors")}</p>
            </div>
          )}

          <div className="home-section-action">
            <button
              type="button"
              className="home-outline-button"
              onClick={() => navigate("/catalog")}
            >
              {t("home.flavors.viewAll")}

              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {/* TUBS */}

      <section className="home-formats">
        <div className="container">
          <div className="home-section-header">
            <span className="home-section-label">
              {t("home.formats.label")}
            </span>

            <h2>{t("home.formats.title")}</h2>

            <p>{t("home.formats.description")}</p>
          </div>

          {availableTubs.length > 0 ? (
            <div className="home-tubs-grid">
              {availableTubs.map((tub) => (
                <div key={tub.id} className="home-tub-card">
                  <div className="home-tub-image">
                    <img src={tub.image} alt={tub.name} />
                  </div>

                  <div className="home-tub-content">
                    <h3>{tub.name}</h3>

                    <p>{tub.weight} g</p>

                    <strong>€ {tub.price.toFixed(2)}</strong>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="home-flavors-empty">
              <p>{t("home.formats.noTubs")}</p>
            </div>
          )}

          <div className="home-section-action">
            <button
              type="button"
              className="home-outline-button"
              onClick={() => navigate("/catalog")}
            >
              {t("home.formats.cta")}

              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {/* BRAND */}

      <section className="home-brand">
        <div className="container">
          <div className="home-brand-inner">
            <div>
              <span>{t("home.brand.label")}</span>

              <h2>{t("home.brand.title")}</h2>

              <p>{t("home.brand.description")}</p>
            </div>

            <button
              type="button"
              className="home-brand-button"
              onClick={() => navigate("/catalog")}
            >
              {t("home.brand.cta")}

              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* BENEFITS */}

      <section className="home-benefits">
        <div className="container">
          <div className="home-section-header">
            <span className="home-section-label">
              {t("home.benefits.label")}
            </span>

            <h2>{t("home.benefits.title")}</h2>
          </div>

          <div className="home-benefits-grid">
            <div className="home-benefit">
              <div className="home-benefit-icon green">
                <Award size={25} />
              </div>

              <h3>{t("home.benefits.quality.title")}</h3>

              <p>{t("home.benefits.quality.description")}</p>
            </div>

            <div className="home-benefit">
              <div className="home-benefit-icon pink">
                <Heart size={25} />
              </div>

              <h3>{t("home.benefits.ingredients.title")}</h3>

              <p>{t("home.benefits.ingredients.description")}</p>
            </div>

            <div className="home-benefit">
              <div className="home-benefit-icon green">
                <Truck size={25} />
              </div>

              <h3>{t("home.benefits.delivery.title")}</h3>

              <p>{t("home.benefits.delivery.description")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}

      <section className="home-reviews">
        <div className="container">
          <div className="home-section-header">
            <span className="home-section-label">
              {t("home.reviews.label")}
            </span>

            <h2>{t("home.reviews.title")}</h2>
          </div>

          <div className="home-reviews-grid">
            <div className="home-review-card">
              <div className="home-stars">★★★★★</div>

              <p>"{t("home.reviews.one.text")}"</p>

              <strong>{t("home.reviews.one.author")}</strong>
            </div>

            <div className="home-review-card featured">
              <div className="home-stars">★★★★★</div>

              <p>"{t("home.reviews.two.text")}"</p>

              <strong>{t("home.reviews.two.author")}</strong>
            </div>

            <div className="home-review-card">
              <div className="home-stars">★★★★★</div>

              <p>"{t("home.reviews.three.text")}"</p>

              <strong>{t("home.reviews.three.author")}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}

      <section className="home-final-cta">
        <div className="container">
          <div className="home-final-inner">
            <ShoppingBag size={32} />

            <h2>{t("home.final.title")}</h2>

            <p>{t("home.final.description")}</p>

            <button
              type="button"
              className="home-final-button"
              onClick={() => navigate("/catalog")}
            >
              {t("home.final.cta")}

              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home
