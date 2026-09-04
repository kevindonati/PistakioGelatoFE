import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import Loading from "./Loading"

function GuestRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <Loading />
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default GuestRoute
