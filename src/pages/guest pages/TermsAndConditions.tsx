import { useTranslation } from "react-i18next"
import "../../styles/TermsAndConditions.css"

const TermsAndConditions = () => {
  const { t } = useTranslation()

  const businessAddress = `${import.meta.env.VITE_INDIRIZZO}, ${import.meta.env.VITE_CAP} ${import.meta.env.VITE_CITTA} (${import.meta.env.VITE_PROV}), ${import.meta.env.VITE_PAESE}`

  return (
    <main className="terms-page">
      <div className="terms-card">
        <header className="terms-header">
          <h1>{t("termsPage.title")}</h1>
          <p>{t("termsPage.lastUpdated")}</p>
        </header>

        <section className="terms-section">
          <h2>{t("termsPage.general.title")}</h2>
          <p>{t("termsPage.general.text")}</p>

          <div className="terms-business-info">
            <p>
              <strong>{t("termsPage.general.businessName")}:</strong>{" "}
              {import.meta.env.VITE_RAGIONE_SOCIALE}
            </p>

            <p>
              <strong>{t("termsPage.general.address")}:</strong>{" "}
              {businessAddress}
            </p>

            {import.meta.env.VITE_PIVA && (
              <p>
                <strong>{t("termsPage.general.vatNumber")}:</strong>{" "}
                {import.meta.env.VITE_PIVA}
              </p>
            )}

            <p>
              <strong>{t("termsPage.general.email")}:</strong>{" "}
              {import.meta.env.VITE_MAIL}
            </p>
          </div>
        </section>

        <section className="terms-section">
          <h2>{t("termsPage.service.title")}</h2>
          <p>{t("termsPage.service.text")}</p>
        </section>

        <section className="terms-section">
          <h2>{t("termsPage.account.title")}</h2>
          <p>{t("termsPage.account.text")}</p>
        </section>

        <section className="terms-section">
          <h2>{t("termsPage.products.title")}</h2>
          <p>{t("termsPage.products.text")}</p>
        </section>

        <section className="terms-section">
          <h2>{t("termsPage.orders.title")}</h2>
          <p>{t("termsPage.orders.text")}</p>
        </section>

        <section className="terms-section">
          <h2>{t("termsPage.prices.title")}</h2>
          <p>{t("termsPage.prices.text")}</p>
        </section>

        <section className="terms-section">
          <h2>{t("termsPage.payment.title")}</h2>
          <p>{t("termsPage.payment.text")}</p>
        </section>

        <section className="terms-section">
          <h2>{t("termsPage.delivery.title")}</h2>
          <p>{t("termsPage.delivery.text")}</p>
        </section>

        <section className="terms-section">
          <h2>{t("termsPage.withdrawal.title")}</h2>
          <p>{t("termsPage.withdrawal.text")}</p>
        </section>

        <section className="terms-section">
          <h2>{t("termsPage.cancellation.title")}</h2>
          <p>{t("termsPage.cancellation.text")}</p>
        </section>

        <section className="terms-section">
          <h2>{t("termsPage.liability.title")}</h2>
          <p>{t("termsPage.liability.text")}</p>
        </section>

        <section className="terms-section">
          <h2>{t("termsPage.intellectualProperty.title")}</h2>
          <p>{t("termsPage.intellectualProperty.text")}</p>
        </section>

        <section className="terms-section">
          <h2>{t("termsPage.privacy.title")}</h2>
          <p>{t("termsPage.privacy.text")}</p>
        </section>

        <section className="terms-section">
          <h2>{t("termsPage.cookies.title")}</h2>
          <p>{t("termsPage.cookies.text")}</p>
        </section>

        <section className="terms-section">
          <h2>{t("termsPage.changes.title")}</h2>
          <p>{t("termsPage.changes.text")}</p>
        </section>

        <section className="terms-section">
          <h2>{t("termsPage.law.title")}</h2>
          <p>{t("termsPage.law.text")}</p>
        </section>

        <section className="terms-section terms-contact">
          <h2>{t("termsPage.contact.title")}</h2>
          <p>{t("termsPage.contact.text")}</p>

          <a href={`mailto:${import.meta.env.VITE_MAIL}`}>
            {import.meta.env.VITE_MAIL}
          </a>
        </section>
      </div>
    </main>
  )
}

export default TermsAndConditions
