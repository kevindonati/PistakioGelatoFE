import type { Language } from "../types/Language.ts"

const DEFAULT_LANGUAGE: Language = "EN"

export const getLanguage = (): Language => {
  return (localStorage.getItem("language") as Language) || DEFAULT_LANGUAGE
}

export const setLanguage = (language: Language) => {
  localStorage.setItem("language", language)
}
