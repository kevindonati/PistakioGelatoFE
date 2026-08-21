import api from "./api"

export interface FlavorTranslation {
  language: "IT" | "EN" | "FR" | "DE"
  name: string
  description: string
}

export interface Flavor {
  id: string
  name: string
  description: string
  referralCode: string
  image: string | null
  stockPortions: number
  available: boolean
  vegan: boolean
  lactoseFree: boolean
  glutenFree: boolean
  sugarFree: boolean
  category: string
}

export interface FlavorFormData {
  referralCode: string
  stockPortions: number
  available: boolean
  vegan: boolean
  lactoseFree: boolean
  glutenFree: boolean
  sugarFree: boolean
  category: string
  translations: FlavorTranslation[]
}

export interface GetFlavorsParams {
  page?: number
  size?: number
  orderBy?: string
  language?: "IT" | "EN" | "FR" | "DE"
}

export interface PaginatedFlavors {
  content: Flavor[]
  totalPages: number
  totalElements: number
  number: number
  size: number
}

// Recupera tutti i gusti

export const getFlavors = async (
  params: GetFlavorsParams = {},
): Promise<PaginatedFlavors> => {
  const response = await api.get<PaginatedFlavors>("/flavors", {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 10,
      orderBy: params.orderBy ?? "referralCode",
      language: params.language ?? "IT",
    },
  })

  return response.data
}

//  Recupera un gusto per ID

export const getFlavorById = async (
  id: string,
  language: "IT" | "EN" | "FR" | "DE" = "IT",
): Promise<Flavor> => {
  const response = await api.get<Flavor>(`/flavors/${id}`, {
    params: {
      language,
    },
  })

  return response.data
}

//  Crea un nuovo gusto

export const createFlavor = async (
  data: FlavorFormData,
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

  const response = await api.post<{ id: string }>("/flavors", formData)

  return response.data
}

// Modifica un gusto esistente

export const updateFlavor = async (
  id: string,
  data: FlavorFormData,
  file?: File | null,
): Promise<Flavor> => {
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

  const response = await api.put<Flavor>(`/flavors/${id}`, formData)

  return response.data
}

// Elimina un gusto

export const deleteFlavor = async (id: string): Promise<void> => {
  await api.delete(`/flavors/${id}`)
}
