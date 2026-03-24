import { useAuth } from '../../context/AuthContext'

// Shows nothing (transparent) while auth state is loading
// Prevents flash of logged-out state for logged-in users
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        {/* Minimal pulse — just enough to show something is happening */}
        <div
          className="w-8 h-8 rounded-full animate-pulse"
          style={{ background: 'var(--accent-light)' }}
        />
      </div>
    )
  }

  return <>{children}</>
}