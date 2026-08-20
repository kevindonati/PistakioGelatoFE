import { useTranslation } from "react-i18next"
import "../Loading.css"

function Loading() {
  const { t } = useTranslation()
  return (
    <div className="container-loading">
      <div className="wrapper">
        <div className="circle">
          <div className="face-wrapper">
            <div className="eyes"></div>
            <div className="eyes"></div>
            <div className="circle-mouth"></div>
          </div>
        </div>
        <div className="cone-top"></div>
        <div className="cone">
          <div className="face-wrapper">
            <div className="eyes"></div>
            <div className="eyes"></div>
            <div className="mouth"></div>
          </div>
        </div>
        <div className="cone-bottom"></div>
      </div>
      <div className="bottom-shadow"></div>
      <p>{t("common.loading")}</p>
    </div>
  )
}

export default Loading
