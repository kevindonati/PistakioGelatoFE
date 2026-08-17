import i18n from "../i18n/i18n"
import type { Language } from "../types/Language"

const DEFAULT_LANGUAGE: Language = "IT"

export const getLanguage = (): Language => {
  return (localStorage.getItem("language") as Language) || DEFAULT_LANGUAGE
}

export const setLanguage = (language: Language) => {
  localStorage.setItem("language", language)
  i18n.changeLanguage(language)
}
