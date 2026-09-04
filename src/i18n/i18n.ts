import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import it from "./locales/it.json"
import en from "./locales/en.json"
import fr from "./locales/fr.json"
import de from "./locales/de.json"

i18n.use(initReactI18next).init({
  resources: {
    IT: { translation: it },
    EN: { translation: en },
    FR: { translation: fr },
    DE: { translation: de },
  },
  lng: localStorage.getItem("language") || "IT",
  fallbackLng: "IT",
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
