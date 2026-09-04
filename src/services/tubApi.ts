import api from "./api"

export interface Tub {
  id: string
  name: string
  description: string
  weight: number
  price: number
  image: string | null
  available: boolean
}

export interface TubTranslation {
  language: "IT" | "EN" | "FR" | "DE"
  name: string
  description: string
}

export interface TubFormData {
  weight: number
  price: number
  available: boolean
  translations: TubTranslation[]
}

export const getTubs = async (
  page = 0,
  size = 10,
  orderBy = "weight",
): Promise<{
  content: Tub[]
  totalPages: number
  totalElements: number
}> => {
  const response = await api.get("/tubs", {
    params: {
      page,
      size,
      orderBy,
    },
  })

  return response.data
}

export const getTubById = async (
  id: string,
  language: string = "IT",
): Promise<Tub> => {
  const response = await api.get<Tub>(`/tubs/${id}`, {
    params: {
      language,
    },
  })

  return response.data
}

export const createTub = async (
  data: TubFormData,
  file?: File | null,
): Promise<{ id: string }> => {
  const formData = new FormData()

  formData.append(
    "data",
    new Blob([JSON.stringify(data)], {
      type: "application/json",
    }),
  )

  if (file) {
    formData.append("file", file)
  }

  const response = await api.post<{
    id: string
  }>("/tubs", formData)

  return response.data
}

export const updateTub = async (
  id: string,
  data: TubFormData,
  file?: File | null,
): Promise<Tub> => {
  const formData = new FormData()

  formData.append(
    "data",
    new Blob([JSON.stringify(data)], {
      type: "application/json",
    }),
  )

  if (file) {
    formData.append("file", file)
  }

  const response = await api.put<Tub>(`/tubs/${id}`, formData)

  return response.data
}

export const deleteTub = async (id: string): Promise<void> => {
  await api.delete(`/tubs/${id}`)
}
