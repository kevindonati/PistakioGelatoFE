import api from "./api"
import type { LoginData, LoginResponse } from "../types/Auth"
import type { User } from "../types/User"
import { saveToken } from "./auth"

export const login = async (data: LoginData): Promise<User> => {
  const response = await api.post<LoginResponse>("/auth/login", data)

  saveToken(response.data.token)

  const userResponse = await api.get<User>("/users/me")

  return userResponse.data
}
