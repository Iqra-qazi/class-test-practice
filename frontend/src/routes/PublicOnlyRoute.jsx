import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { getDashboardPath } from '../utils/roleRoutes'

export default function PublicOnlyRoute() {
  const { isAuthenticated, user } = useAuth()
  return isAuthenticated
    ? <Navigate to={getDashboardPath(user.role)} replace />
    : <Outlet />
}
