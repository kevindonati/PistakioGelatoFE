import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { FacebookLogoIcon, InstagramLogoIcon } from "@phosphor-icons/react"

import "../styles/Footer.css"

function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-column">
            <h3>{t("footer.productsTitle")}</h3>

            <Link to="/catalog">{t("navbar.catalog")}</Link>

            <Link to="/catalog">{t("footer.allFlavors")}</Link>

            <Link to="/catalog">{t("footer.categories")}</Link>

            <Link to="/cart">{t("navbar.cart")}</Link>
          </div>

          <div className="footer-column">
            <h3>{t("footer.companyTitle")}</h3>

            <Link to="/shipping">{t("footer.shipping")}</Link>

            <Link to="/terms">{t("footer.terms")}</Link>

            <Link to="/about">{t("footer.about")}</Link>

            <Link to="/contact">{t("footer.contact")}</Link>
          </div>

          <div className="footer-column">
            <h3>{t("footer.accountTitle")}</h3>

            <Link to="/account">{t("footer.personalInfo")}</Link>

            <Link to="/orders">{t("footer.orders")}</Link>

            <Link to="/account/addresses">{t("footer.addresses")}</Link>

            <Link to="/login">{t("navbar.login")}</Link>

            <Link to="/register">{t("navbar.register")}</Link>
          </div>

          <div className="footer-column footer-company">
            <h3>{t("footer.businessInfoTitle")}</h3>

            <p className="footer-company-name">Pistakio Gelato</p>

            <p>
              {import.meta.env.VITE_INDIRIZZO}
              <br />
              {import.meta.env.VITE_CAP} {import.meta.env.VITE_CITTA} (
              {import.meta.env.VITE_PROV})
              <br />
              {import.meta.env.VITE_PAESE}
            </p>

            <p>
              {t("footer.vatNumber")}: {import.meta.env.VITE_PIVA}
            </p>

            <a href="mailto:info@pistakiogelato.it">
              {import.meta.env.VITE_MAIL}
            </a>

            <div className="footer-social">
              <a
                href="https://www.instagram.com/pistakiogelato"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <InstagramLogoIcon size={19} weight="regular" />
              </a>

              <a
                href="https://www.facebook.com/pistakiogelato"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <FacebookLogoIcon size={19} weight="regular" />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-legal">
          <Link to="/privacy">{t("footer.privacy")}</Link>

          <Link to="/cookies">{t("footer.cookies")}</Link>

          <Link to="/terms">{t("footer.terms")}</Link>

          <Link to="/returns">{t("footer.returns")}</Link>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Pistakio Gelato</span>

          <span>{t("footer.rights")}</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
