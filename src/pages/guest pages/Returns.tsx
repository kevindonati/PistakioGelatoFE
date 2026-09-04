import { useTranslation } from "react-i18next"
import "../../styles/Returns.css"

const Returns = () => {
  const { t } = useTranslation()

  const businessAddress = `${import.meta.env.VITE_INDIRIZZO}, ${import.meta.env.VITE_CAP} ${import.meta.env.VITE_CITTA} (${import.meta.env.VITE_PROV}), ${import.meta.env.VITE_PAESE}`

  return (
    <main className="returns-page">
      <div className="returns-card">
        <header className="returns-header">
          <h1>{t("returnsPage.title")}</h1>
          <p>{t("returnsPage.lastUpdated")}</p>
        </header>

        <section className="returns-section">
          <h2>{t("returnsPage.general.title")}</h2>
          <p>{t("returnsPage.general.text")}</p>

          <div className="returns-business-info">
            <p>
              <strong>{t("returnsPage.general.businessName")}:</strong>{" "}
              {import.meta.env.VITE_RAGIONE_SOCIALE}
            </p>

            <p>
              <strong>{t("returnsPage.general.address")}:</strong>{" "}
              {businessAddress}
            </p>

            {import.meta.env.VITE_PIVA && (
              <p>
                <strong>{t("returnsPage.general.vatNumber")}:</strong>{" "}
                {import.meta.env.VITE_PIVA}
              </p>
            )}

            <p>
              <strong>{t("returnsPage.general.email")}:</strong>{" "}
              {import.meta.env.VITE_MAIL}
            </p>
          </div>
        </section>

        <section className="returns-section">
          <h2>{t("returnsPage.perishable.title")}</h2>
          <p>{t("returnsPage.perishable.text")}</p>

          <div className="returns-notice">
            <strong>{t("returnsPage.perishable.noticeTitle")}</strong>
            <p>{t("returnsPage.perishable.noticeText")}</p>
          </div>
        </section>

        <section className="returns-section">
          <h2>{t("returnsPage.withdrawal.title")}</h2>
          <p>{t("returnsPage.withdrawal.text")}</p>
        </section>

        <section className="returns-section">
          <h2>{t("returnsPage.nonPerishable.title")}</h2>
          <p>{t("returnsPage.nonPerishable.text")}</p>
        </section>

        <section className="returns-section">
          <h2>{t("returnsPage.howTo.title")}</h2>
          <p>{t("returnsPage.howTo.text")}</p>

          <div className="returns-email-box">
            <strong>{t("returnsPage.howTo.emailTitle")}</strong>

            <a href={`mailto:${import.meta.env.VITE_MAIL}`}>
              {import.meta.env.VITE_MAIL}
            </a>
          </div>
        </section>

        <section className="returns-section">
          <h2>{t("returnsPage.refund.title")}</h2>
          <p>{t("returnsPage.refund.text")}</p>
        </section>

        <section className="returns-section">
          <h2>{t("returnsPage.damaged.title")}</h2>
          <p>{t("returnsPage.damaged.text")}</p>
        </section>

        <section className="returns-section">
          <h2>{t("returnsPage.delivery.title")}</h2>
          <p>{t("returnsPage.delivery.text")}</p>
        </section>

        <section className="returns-section returns-contact">
          <h2>{t("returnsPage.contact.title")}</h2>
          <p>{t("returnsPage.contact.text")}</p>

          <a href={`mailto:${import.meta.env.VITE_MAIL}`}>
            {import.meta.env.VITE_MAIL}
          </a>
        </section>
      </div>
    </main>
  )
}

export default Returns
