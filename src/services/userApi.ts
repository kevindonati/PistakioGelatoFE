import api from "./api"

export interface AdminUser {
  id: string
  name: string
  surname: string
  email: string
  phone: string
  role: "USER" | "ADMIN"
  enabled: boolean
  language: "IT" | "EN" | "FR" | "DE"
  createdAt?: string
}

export interface PaginatedUsers {
  content: AdminUser[]
  totalPages: number
  totalElements: number
  number: number
  size: number
}

export interface GetUsersParams {
  page?: number
  size?: number
  orderBy?: string
  search?: string
  role?: "USER" | "ADMIN"
  enabled?: boolean
}

export const getUsers = async (
  params: GetUsersParams = {},
): Promise<PaginatedUsers> => {
  const response = await api.get<PaginatedUsers>("/users", {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 10,
      orderBy: params.orderBy ?? "name",
      ...(params.search?.trim()
        ? {
            search: params.search.trim(),
          }
        : {}),
      ...(params.role
        ? {
            role: params.role,
          }
        : {}),
      ...(params.enabled !== undefined
        ? {
            enabled: params.enabled,
          }
        : {}),
    },
  })

  return response.data
}

export const getUserById = async (id: string): Promise<AdminUser> => {
  const response = await api.get<AdminUser>(`/users/${id}`)

  return response.data
}

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`)
}

export interface UserProfile {
  id: string
  name: string
  surname: string
  email: string
  phone: string
  role: "USER" | "ADMIN"
  enabled: boolean
  language: "IT" | "EN" | "FR" | "DE"
}

export interface UpdateUserData {
  name: string
  surname: string
  email: string
  phone: string
  language: "IT" | "EN" | "FR" | "DE"
}

export const getMe = async (): Promise<UserProfile> => {
  const response = await api.get<UserProfile>("/users/me")

  return response.data
}

export const updateMe = async (
  id: string,
  data: UpdateUserData,
): Promise<UserProfile> => {
  const response = await api.put<UserProfile>(`/users/${id}`, data)

  return response.data
}
