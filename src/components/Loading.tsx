import { useTranslation } from "react-i18next"
import "../styles/Loading.css"

function Loading() {
  const { t } = useTranslation()
  return (
    <>
      <div className="logo-loading mt-5">
        <div className="d-flex mt-5">
          <div className="left">
            <div
              className="circle-logo-loading pink-loading"
              id="pallina1"
            ></div>
            <div className="triangle-loading pink-loading">
              <div></div>
            </div>
          </div>
          <div className="right">
            <div className="contenitore-palline">
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
            <div className="triangle-loading green-loading">
              <div></div>
            </div>
          </div>
        </div>
        <p className="fs-2 mt-2">{t("common.loading")}</p>
      </div>
    </>
  )
}

export default Loading
