import { useTranslation } from "react-i18next"

import "../../styles/PrivacyPolicy.css"

function PrivacyPolicy() {
  const { t } = useTranslation()

  return (
    <main className="privacy-policy-page">
      <div className="privacy-policy-container">
        <header className="privacy-policy-header">
          <span className="privacy-policy-eyebrow">
            {t("privacyPolicy.eyebrow")}
          </span>

          <h1>{t("privacyPolicy.title")}</h1>

          <p>{t("privacyPolicy.intro")}</p>
        </header>

        <div className="privacy-policy-content">
          <section className="privacy-policy-section">
            <h2>1. {t("privacyPolicy.controllerTitle")}</h2>

            <p>{t("privacyPolicy.controllerText")}</p>

            <div className="privacy-policy-contact">
              <strong>Pistakio Gelato</strong>
              <span>{import.meta.env.VITE_RAGIONE_SOCIALE}</span>
              <span>{import.meta.env.VITE_INDIRIZZO}</span>
              <span>
                {import.meta.env.VITE_CAP} {import.meta.env.VITE_CITTA} (
                {import.meta.env.VITE_PROV})
              </span>
              <span>
                {t("privacyPolicy.vatNumber")}: {import.meta.env.VITE_PIVA}
              </span>
              <span>
                {t("privacyPolicy.email")}: {import.meta.env.VITE_MAIL}
              </span>
            </div>
          </section>

          <section className="privacy-policy-section">
            <h2>2. {t("privacyPolicy.dataTitle")}</h2>

            <p>{t("privacyPolicy.dataIntro")}</p>

            <ul>
              <li>{t("privacyPolicy.dataIdentity")}</li>
              <li>{t("privacyPolicy.dataContact")}</li>
              <li>{t("privacyPolicy.dataAddress")}</li>
              <li>{t("privacyPolicy.dataOrder")}</li>
              <li>{t("privacyPolicy.dataAccount")}</li>
              <li>{t("privacyPolicy.dataTechnical")}</li>
            </ul>
          </section>

          <section className="privacy-policy-section">
            <h2>3. {t("privacyPolicy.purposeTitle")}</h2>

            <p>{t("privacyPolicy.purposeIntro")}</p>

            <div className="privacy-policy-purpose-list">
              <div className="privacy-policy-purpose">
                <h3>{t("privacyPolicy.purposeAccountTitle")}</h3>
                <p>{t("privacyPolicy.purposeAccountText")}</p>
              </div>

              <div className="privacy-policy-purpose">
                <h3>{t("privacyPolicy.purposeOrdersTitle")}</h3>
                <p>{t("privacyPolicy.purposeOrdersText")}</p>
              </div>

              <div className="privacy-policy-purpose">
                <h3>{t("privacyPolicy.purposePaymentTitle")}</h3>
                <p>{t("privacyPolicy.purposePaymentText")}</p>
              </div>

              <div className="privacy-policy-purpose">
                <h3>{t("privacyPolicy.purposeShippingTitle")}</h3>
                <p>{t("privacyPolicy.purposeShippingText")}</p>
              </div>

              <div className="privacy-policy-purpose">
                <h3>{t("privacyPolicy.purposeSupportTitle")}</h3>
                <p>{t("privacyPolicy.purposeSupportText")}</p>
              </div>

              <div className="privacy-policy-purpose">
                <h3>{t("privacyPolicy.purposeLegalTitle")}</h3>
                <p>{t("privacyPolicy.purposeLegalText")}</p>
              </div>
            </div>
          </section>

          <section className="privacy-policy-section">
            <h2>4. {t("privacyPolicy.legalBasisTitle")}</h2>

            <p>{t("privacyPolicy.legalBasisIntro")}</p>

            <div className="privacy-policy-table-wrapper">
              <table className="privacy-policy-table">
                <thead>
                  <tr>
                    <th>{t("privacyPolicy.tablePurpose")}</th>
                    <th>{t("privacyPolicy.tableBasis")}</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>{t("privacyPolicy.basisAccountPurpose")}</td>
                    <td>{t("privacyPolicy.basisContract")}</td>
                  </tr>

                  <tr>
                    <td>{t("privacyPolicy.basisOrderPurpose")}</td>
                    <td>{t("privacyPolicy.basisContract")}</td>
                  </tr>

                  <tr>
                    <td>{t("privacyPolicy.basisPaymentPurpose")}</td>
                    <td>{t("privacyPolicy.basisContract")}</td>
                  </tr>

                  <tr>
                    <td>{t("privacyPolicy.basisLegalPurpose")}</td>
                    <td>{t("privacyPolicy.basisLegalObligation")}</td>
                  </tr>

                  <tr>
                    <td>{t("privacyPolicy.basisSecurityPurpose")}</td>
                    <td>{t("privacyPolicy.basisLegitimateInterest")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="privacy-policy-section">
            <h2>5. {t("privacyPolicy.provisionTitle")}</h2>

            <p>{t("privacyPolicy.provisionText")}</p>
          </section>

          <section className="privacy-policy-section">
            <h2>6. {t("privacyPolicy.recipientsTitle")}</h2>

            <p>{t("privacyPolicy.recipientsIntro")}</p>

            <ul>
              <li>{t("privacyPolicy.recipientShipping")}</li>
              <li>{t("privacyPolicy.recipientPayment")}</li>
              <li>{t("privacyPolicy.recipientHosting")}</li>
              <li>{t("privacyPolicy.recipientTechnical")}</li>
            </ul>

            <p className="privacy-policy-note">
              {t("privacyPolicy.recipientsNote")}
            </p>
          </section>

          <section className="privacy-policy-section">
            <h2>7. {t("privacyPolicy.paymentTitle")}</h2>

            <p>{t("privacyPolicy.paymentText")}</p>

            <div className="privacy-policy-provider-grid">
              <div className="privacy-policy-provider">
                <h3>Stripe</h3>
                <p>{t("privacyPolicy.stripeText")}</p>
              </div>

              <div className="privacy-policy-provider">
                <h3>PayPal</h3>
                <p>{t("privacyPolicy.paypalText")}</p>
              </div>
            </div>
          </section>

          <section className="privacy-policy-section">
            <h2>8. {t("privacyPolicy.securityTitle")}</h2>

            <p>{t("privacyPolicy.securityText")}</p>
          </section>

          <section className="privacy-policy-section">
            <h2>9. {t("privacyPolicy.retentionTitle")}</h2>

            <p>{t("privacyPolicy.retentionText")}</p>

            <div className="privacy-policy-retention-list">
              <div>
                <strong>{t("privacyPolicy.retentionAccountTitle")}</strong>
                <span>{t("privacyPolicy.retentionAccountText")}</span>
              </div>

              <div>
                <strong>{t("privacyPolicy.retentionOrdersTitle")}</strong>
                <span>{t("privacyPolicy.retentionOrdersText")}</span>
              </div>

              <div>
                <strong>{t("privacyPolicy.retentionMessagesTitle")}</strong>
                <span>{t("privacyPolicy.retentionMessagesText")}</span>
              </div>
            </div>
          </section>

          <section className="privacy-policy-section">
            <h2>10. {t("privacyPolicy.rightsTitle")}</h2>

            <p>{t("privacyPolicy.rightsIntro")}</p>

            <ul>
              <li>{t("privacyPolicy.rightAccess")}</li>
              <li>{t("privacyPolicy.rightRectification")}</li>
              <li>{t("privacyPolicy.rightErasure")}</li>
              <li>{t("privacyPolicy.rightRestriction")}</li>
              <li>{t("privacyPolicy.rightPortability")}</li>
              <li>{t("privacyPolicy.rightObjection")}</li>
            </ul>

            <p>{t("privacyPolicy.rightsText")}</p>
          </section>

          <section className="privacy-policy-section">
            <h2>11. {t("privacyPolicy.complaintTitle")}</h2>

            <p>{t("privacyPolicy.complaintText")}</p>
          </section>

          <section className="privacy-policy-section">
            <h2>12. {t("privacyPolicy.automatedTitle")}</h2>

            <p>{t("privacyPolicy.automatedText")}</p>
          </section>

          <section className="privacy-policy-section">
            <h2>13. {t("privacyPolicy.changesTitle")}</h2>

            <p>{t("privacyPolicy.changesText")}</p>
          </section>
        </div>

        <div className="privacy-policy-updated">
          {t("privacyPolicy.lastUpdated")}: {new Date().toLocaleDateString()}
        </div>
      </div>
    </main>
  )
}

export default PrivacyPolicy
