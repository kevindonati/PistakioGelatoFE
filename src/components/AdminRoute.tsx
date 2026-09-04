import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import Loading from "./Loading"

function AdminRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <Loading />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default AdminRoute
