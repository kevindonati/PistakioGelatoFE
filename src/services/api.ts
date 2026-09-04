import axios from "axios"

import { getLanguage } from "./language.ts"

import { getToken } from "./auth"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use((config) => {
  const language = getLanguage()
  const token = getToken()

  if (config.method === "get") {
    config.params = {
      ...config.params,
      language: config.params?.language ?? language,
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api
