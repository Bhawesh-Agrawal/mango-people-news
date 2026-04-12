import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types'
import {
  login        as apiLogin,
  register     as apiRegister,
  logout       as apiLogout,
  getMe,
  googleLogin  as apiGoogleLogin,
  refreshToken as apiRefreshToken,
} from '../api/auth'
import type { LoginPayload, RegisterPayload } from '../api/auth'
import { client } from '../api/client'

interface RegisterResult {
  needsVerification: boolean
  email:             string
}

interface AuthContextType {
  user:          User | null
  loading:       boolean
  isLoggedIn:    boolean
  isEditor:      boolean
  isAuthor:      boolean
  isSuperAdmin:  boolean
  emailVerified: boolean
  login:         (payload: LoginPayload)    => Promise<void>
  register:      (payload: RegisterPayload) => Promise<RegisterResult>
  googleLogin:   (idToken: string)          => Promise<void>
  logout:        ()                         => Promise<void>
  refresh:       ()                         => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user:          null,
  loading:       true,
  isLoggedIn:    false,
  isEditor:      false,
  isAuthor:      false,
  isSuperAdmin:  false,
  emailVerified: false,
  login:         async () => {},
  register:      async () => ({ needsVerification: true, email: '' }),
  googleLogin:   async () => {},
  logout:        async () => {},
  refresh:       async () => {},
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user,    setUser]    = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const isLoggedIn   = !!user
  const isEditor     = user?.role === 'editor'     || user?.role === 'super_admin'
  const isAuthor     = user?.role === 'author'     || isEditor
  const isSuperAdmin = user?.role === 'super_admin'
  const emailVerified = user?.email_verified ?? false

  // ── Restore session on mount ──────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('mpn_token')

      // ✅ FIX: Skip refresh if no token exists
      if (!token) {
        setLoading(false)
        return
      }

      try {
        // Step 1: use the httpOnly cookie to get a fresh access token
        const refreshRes = await apiRefreshToken()
        if (refreshRes.data?.accessToken) {
          localStorage.setItem('mpn_token', refreshRes.data.accessToken)
        }

        // Step 2: fetch the full user profile
        const meRes = await getMe()
        if (meRes.data) setUser(meRes.data)

      } catch {
        // No valid refresh token cookie — user is logged out
        localStorage.removeItem('mpn_token')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  useEffect(() => {
    const handleSessionExpired = () => {
      // Clear all auth state — user will be redirected by ProtectedRoute
      setUser(null)
      localStorage.removeItem('mpn_token')
      // Optional: show a toast or message to explain why they were logged out
      // toast.info('Your session expired. Please sign in again.')
    }
  
    window.addEventListener('auth:session-expired', handleSessionExpired)
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired)
  }, [])

  // ── Login ─────────────────────────────────────────────────────
  const handleLogin = useCallback(async (payload: LoginPayload) => {
    const res = await apiLogin(payload)

    if (res.data?.accessToken) {
      localStorage.setItem('mpn_token', res.data.accessToken)
    }

    if (res.data?.user) {
      setUser(res.data.user)
    }

    try {
      const me = await getMe()
      if (me.data) setUser(me.data)
    } catch {}
  }, [])

  // ── Register ──────────────────────────────────────────────────
  const handleRegister = useCallback(async (
    payload: RegisterPayload
  ): Promise<RegisterResult> => {
    await apiRegister(payload)
    return { needsVerification: true, email: payload.email }
  }, [])

  // ── Google login ──────────────────────────────────────────────
  const handleGoogleLogin = useCallback(async (idToken: string) => {
    const res = await apiGoogleLogin(idToken)

    if (res.data?.accessToken) {
      localStorage.setItem('mpn_token', res.data.accessToken)
    }
    if (res.data?.user) {
      setUser(res.data.user)
    }

    try {
      const me = await getMe()
      if (me.data) setUser(me.data)
    } catch {}
  }, [])

  // ── Logout ────────────────────────────────────────────────────
  const handleLogout = useCallback(async () => {
    try { await apiLogout() } catch {}
    finally {
      localStorage.removeItem('mpn_token')
      setUser(null)
    }
  }, [])

  // ── Refresh user ──────────────────────────────────────────────
  const refresh = useCallback(async () => {
    try {
      const { data } = await client.post('/auth/refresh')
      const token    = data?.data?.accessToken
      if (token) {
        localStorage.setItem('mpn_token', token)
        // Re-fetch user to keep context fresh
        const meRes = await client.get('/auth/me')
        setUser(meRes.data?.data ?? null)
      }
    } catch {
      // Refresh failed — this is handled by client.ts which dispatches
      // 'auth:session-expired'. Don't throw here, it causes component crashes.
      // Just clear silently:
      setUser(null)
      localStorage.removeItem('mpn_token')
    }
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isLoggedIn,
      isEditor,
      isAuthor,
      isSuperAdmin,
      emailVerified,
      login:       handleLogin,
      register:    handleRegister,
      googleLogin: handleGoogleLogin,
      logout:      handleLogout,
      refresh:     refresh,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

