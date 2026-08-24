import { useTranslation } from "react-i18next"
import "../styles/Loading.css"

function Loading() {
  const { t } = useTranslation()
  return (
    <div className="d-flex justify-content-center">
      <div className="logo-loading mt-5">
        <div className="top-loading mt-5">
          <div className="circle-logo-loading pink-loading" id="pallina1"></div>
          <div className="top-green-loading">
            <div
              className="circle-logo-loading green-loading"
              id="pallina2"
            ></div>
            <div
              className="circle-logo-loading green-loading"
              id="pallina3"
            ></div>
            <div
              className="circle-logo-loading green-loading"
              id="pallina4"
            ></div>
          </div>
        </div>

        <div className="bottom-loading">
          <div className="triangle-loading pink-loading">
            <div></div>
          </div>

          <div className="triangle-loading green-loading">
            <div></div>
          </div>
        </div>
        <p className="fs-2 align-self-center mt-2">{t("common.loading")}</p>
      </div>
    </div>
  )
}

export default Loading
