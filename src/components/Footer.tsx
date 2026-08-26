import { Link } from "react-router-dom"

import { useTranslation } from "react-i18next"

import "../styles/Footer.css"
import { FacebookLogoIcon, InstagramLogoIcon } from "@phosphor-icons/react"
import logo from "../assets/LOGO CON SCRITTA PIST DEF NOBG.png"

function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-main">
          {/* LOGO / BRAND */}

          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <img
                src={logo}
                alt="logo pistakio gelato"
                className="footer-logo"
              />
            </Link>

            <p>{t("footer.description")}</p>
          </div>

          {/* LINK */}

          <div className="footer-links">
            <h3>{t("footer.linksTitle")}</h3>

            <Link to="/">{t("navbar.home")}</Link>

            <Link to="/catalog">{t("navbar.catalog")}</Link>

            <Link to="/cart">{t("navbar.cart")}</Link>
          </div>

          {/* ACCOUNT */}

          <div className="footer-links">
            <h3>{t("footer.accountTitle")}</h3>

            <Link to="/login">{t("navbar.login")}</Link>

            <Link to="/register">{t("navbar.register")}</Link>
          </div>

          {/* SOCIAL */}

          <div className="footer-social">
            <h3>{t("footer.followUs")}</h3>

            <div className="footer-social-icons">
              <a
                href="https://www.instagram.com/pistakiogelato"
                target="_blank"
                aria-label="Instagram"
              >
                <InstagramLogoIcon size={19} />
              </a>

              <a
                href="https://www.facebook.com/pistakiogelato"
                target="_blank"
                aria-label="Facebook"
              >
                <FacebookLogoIcon size={19} />
              </a>
            </div>
          </div>
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
