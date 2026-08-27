import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Guards admin routes: redirects to /login unless an admin token resolves.
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading…</div>
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
