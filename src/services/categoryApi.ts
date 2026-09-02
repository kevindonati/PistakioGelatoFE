import api from "./api"

export interface Category {
  id: string
  name: string
  description: string
  image: string | null
}

export interface CategoryTranslation {
  language: "IT" | "EN" | "FR" | "DE"
  name: string
  description: string
}

export interface CategoryFormData {
  image: string
  translations: CategoryTranslation[]
}

export interface GetCategoriesParams {
  page?: number
  size?: number
  orderBy?: string
  language?: "IT" | "EN" | "FR" | "DE"
}

export interface PaginatedCategories {
  content: Category[]
  totalPages: number
  totalElements: number
  number: number
  size: number
}

export const getCategories = async (
  params: GetCategoriesParams = {},
): Promise<PaginatedCategories> => {
  const response = await api.get<PaginatedCategories>("/categories", {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 10,
      orderBy: params.orderBy ?? "image",
      language: params.language ?? "IT",
    },
  })

  return response.data
}

export const getCategoryById = async (
  id: string,
  language: "IT" | "EN" | "FR" | "DE" = "IT",
): Promise<Category> => {
  const response = await api.get<Category>(`/categories/${id}`, {
    params: {
      language,
    },
  })

  return response.data
}

export const createCategory = async (
  data: CategoryFormData,
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

  const response = await api.post<{ id: string }>("/categories", formData)

  return response.data
}

export const updateCategory = async (
  id: string,
  data: CategoryFormData,
  file?: File | null,
): Promise<Category> => {
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

  const response = await api.put<Category>(`/categories/${id}`, formData)

  return response.data
}

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/categories/${id}`)
}
