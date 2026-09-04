import { useTranslation } from "react-i18next"

import logo from "../../assets/LOGO CON SCRITTA PIST DEF.png"

import "../../styles/ComingSoon.css"

const ComingSoon = () => {
  const { t } = useTranslation()

  return (
    <main className="coming-soon">
      <div className="coming-soon-card">
        <div className="coming-soon-logo">
          <img src={logo} alt="Pistakio Gelato" />
        </div>

        <div className="coming-soon-header">
          <h1>{t("comingSoon.title")}</h1>
          <p>{t("comingSoon.description")}</p>
        </div>

        <div className="coming-soon-loader" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </main>
  )
}

export default ComingSoon
