import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import type { User } from "../types/User"
import { getToken, removeToken } from "../services/auth"
import api from "../services/api"
import { AuthContext } from "./AuthContext"
import { login as authLogin } from "../services/authApi"

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => getToken() !== null)

  const login = async (email: string, password: string) => {
    const user = await authLogin({
      email,
      password,
    })

    setUser(user)
  }

  useEffect(() => {
    const token = getToken()

    if (!token) {
      return
    }

    api
      .get<User>("/users/me")
      .then((response) => {
        setUser(response.data)
      })
      .catch(() => {
        removeToken()
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const logout = () => {
    removeToken()
    setUser(null)
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: user !== null,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
