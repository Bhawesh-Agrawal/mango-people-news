import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface Props {
  children:     React.ReactNode
  requiredRole?: 'author' | 'editor' | 'super_admin'
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: Props) {
  const { isLoggedIn, loading, user } = useAuth()
  const location = useLocation()

  // Still checking auth state
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="space-y-3 w-48">
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-4/5 rounded" />
          <div className="skeleton h-3 w-3/5 rounded" />
        </div>
      </div>
    )
  }

  // Not logged in — redirect to login, preserve intended destination
  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  // Role check
  if (requiredRole) {
    const roleWeight = {
      reader:      0,
      author:      1,
      editor:      2,
      super_admin: 3,
    }
    const userWeight     = roleWeight[user?.role ?? 'reader']
    const requiredWeight = roleWeight[requiredRole]

    if (userWeight < requiredWeight) {
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}