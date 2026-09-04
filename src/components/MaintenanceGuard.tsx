import { useEffect, useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { getMaintenanceMode } from "../services/maintenanceApi"
import ComingSoon from "../pages/guest pages/ComingSoon"

const MaintenanceGuard = () => {
  const location = useLocation()

  const [maintenance, setMaintenance] = useState(false)
  const [loading, setLoading] = useState(true)

  const isAdminRoute = location.pathname.startsWith("/admin")
  const isLoginRoute = location.pathname.startsWith("/login")
  const isRegisterRoute = location.pathname.startsWith("/register")
  const isForgotPasswordRoute = location.pathname.startsWith("/forgot-password")
  const isResetPasswordRoute = location.pathname.startsWith("/reset-password")
  const isCookiesRoute = location.pathname.startsWith("/cookies")
  const isPrivacyRoute = location.pathname.startsWith("/privacy")
  const isTermsRoute = location.pathname.startsWith("/terms")
  const isReturnsRoute = location.pathname.startsWith("/returns")

  useEffect(() => {
    let mounted = true

    const checkMaintenance = async () => {
      try {
        const enabled = await getMaintenanceMode()

        if (mounted) {
          setMaintenance(enabled)
        }
      } catch (error) {
        console.error(error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    checkMaintenance()

    const interval = setInterval(checkMaintenance, 5000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  if (loading) {
    return null
  }

  if (
    maintenance &&
    !isAdminRoute &&
    !isLoginRoute &&
    !isRegisterRoute &&
    !isForgotPasswordRoute &&
    !isResetPasswordRoute &&
    !isCookiesRoute &&
    !isPrivacyRoute &&
    !isTermsRoute &&
    !isReturnsRoute
  ) {
    return <ComingSoon />
  }

  return <Outlet />
}

export default MaintenanceGuard
