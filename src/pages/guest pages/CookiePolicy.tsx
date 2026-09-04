import { useTranslation } from "react-i18next"

import "../../styles/CookiePolicy.css"

function CookiePolicy() {
  const { t } = useTranslation()

  return (
    <main className="cookie-policy-page">
      <div className="cookie-policy-container">
        <header className="cookie-policy-header">
          <span className="cookie-policy-eyebrow">
            {t("cookiePolicy.eyebrow")}
          </span>

          <h1>{t("cookiePolicy.title")}</h1>

          <p>{t("cookiePolicy.intro")}</p>
        </header>

        <div className="cookie-policy-content">
          <section className="cookie-policy-section">
            <h2>1. {t("cookiePolicy.whatAreCookiesTitle")}</h2>

            <p>{t("cookiePolicy.whatAreCookiesText")}</p>
          </section>

          <section className="cookie-policy-section">
            <h2>2. {t("cookiePolicy.cookiesUsedTitle")}</h2>

            <p>{t("cookiePolicy.cookiesUsedText")}</p>

            <div className="cookie-policy-info-box">
              <strong>{t("cookiePolicy.noProfilingTitle")}</strong>
              <p>{t("cookiePolicy.noProfilingText")}</p>
            </div>
          </section>

          <section className="cookie-policy-section">
            <h2>3. {t("cookiePolicy.technicalTitle")}</h2>

            <p>{t("cookiePolicy.technicalText")}</p>

            <div className="cookie-policy-table-wrapper">
              <table className="cookie-policy-table">
                <thead>
                  <tr>
                    <th>{t("cookiePolicy.tableName")}</th>
                    <th>{t("cookiePolicy.tableType")}</th>
                    <th>{t("cookiePolicy.tablePurpose")}</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>localStorage</td>
                    <td>{t("cookiePolicy.technical")}</td>
                    <td>{t("cookiePolicy.authStorage")}</td>
                  </tr>

                  <tr>
                    <td>language</td>
                    <td>{t("cookiePolicy.technical")}</td>
                    <td>{t("cookiePolicy.languageStorage")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="cookie-policy-section">
            <h2>4. {t("cookiePolicy.paymentTitle")}</h2>

            <p>{t("cookiePolicy.paymentText")}</p>

            <div className="cookie-policy-provider-grid">
              <div className="cookie-policy-provider">
                <h3>Stripe</h3>
                <p>{t("cookiePolicy.stripeText")}</p>
              </div>

              <div className="cookie-policy-provider">
                <h3>PayPal</h3>
                <p>{t("cookiePolicy.paypalText")}</p>
              </div>
            </div>
          </section>

          <section className="cookie-policy-section">
            <h2>5. {t("cookiePolicy.thirdPartyTitle")}</h2>

            <p>{t("cookiePolicy.thirdPartyText")}</p>
          </section>

          <section className="cookie-policy-section">
            <h2>6. {t("cookiePolicy.managementTitle")}</h2>

            <p>{t("cookiePolicy.managementText")}</p>
          </section>

          <section className="cookie-policy-section">
            <h2>7. {t("cookiePolicy.durationTitle")}</h2>

            <p>{t("cookiePolicy.durationText")}</p>
          </section>

          <section className="cookie-policy-section">
            <h2>8. {t("cookiePolicy.updatesTitle")}</h2>

            <p>{t("cookiePolicy.updatesText")}</p>
          </section>

          <section className="cookie-policy-section">
            <h2>9. {t("cookiePolicy.contactTitle")}</h2>

            <p>{t("cookiePolicy.contactText")}</p>

            <div className="cookie-policy-contact">
              <strong>Pistakio Gelato</strong>
              <span>Corso Giuseppe Garibaldi, 13 e 14</span>
              <span>18013 Diano Marina (IM)</span>
              <span>{t("cookiePolicy.vatNumber")}: [P.IVA]</span>
              <span>{t("cookiePolicy.email")}: info@pistakiogelato.it</span>
            </div>
          </section>
        </div>

        <div className="cookie-policy-updated">
          {t("cookiePolicy.lastUpdated")}: {new Date().toLocaleDateString()}
        </div>
      </div>
    </main>
  )
}

export default CookiePolicy
