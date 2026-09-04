import { Link } from "react-router-dom"
import { Home, ArrowLeft } from "lucide-react"
import { useTranslation } from "react-i18next"
import "../../styles/NotFound.css"

function NotFound() {
  const { t } = useTranslation()

  return (
    <main className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-number">
          4<span>0</span>4
        </div>

        <div className="not-found-content">
          <h1>{t("notFound.title")}</h1>

          <p>{t("notFound.message")}</p>
        </div>

        <div className="not-found-actions">
          <Link to="/" className="not-found-primary-button">
            <Home size={17} />
            {t("notFound.home")}
          </Link>

          <button
            type="button"
            className="not-found-secondary-button"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={17} />
            {t("notFound.back")}
          </button>
        </div>
      </div>
    </main>
  )
}

export default NotFound
