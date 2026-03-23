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
  login    as apiLogin,
  register as apiRegister,
  logout   as apiLogout,
  getMe,
  googleLogin  as apiGoogleLogin,
} from '../api/auth'
import type { LoginPayload, RegisterPayload } from '../api/auth'

// ── Types ─────────────────────────────────────────────────────
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

// ── Provider ──────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user,    setUser]    = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const isLoggedIn   = !!user
  const isEditor     = user?.role === 'editor'      || user?.role === 'super_admin'
  const isAuthor     = user?.role === 'author'      || isEditor
  const isSuperAdmin = user?.role === 'super_admin'
  const emailVerified = user?.email_verified ?? false

  // ── Restore session on mount ────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('mpn_token')
    if (!token) { setLoading(false); return }

    getMe()
      .then(res => {
        if (res.data) setUser(res.data)
      })
      .catch(() => {
        localStorage.removeItem('mpn_token')
      })
      .finally(() => setLoading(false))
  }, [])

  // ── Login ───────────────────────────────────────────────────
  const handleLogin = useCallback(async (payload: LoginPayload) => {
    const res = await apiLogin(payload)
    if (res.data?.accessToken) {
      localStorage.setItem('mpn_token', res.data.accessToken)
    }
    if (res.data?.user) setUser(res.data.user)
  }, [])

  // ── Register — returns needsVerification so page can show the right state
  const handleRegister = useCallback(async (payload: RegisterPayload): Promise<RegisterResult> => {
    await apiRegister(payload)
    // Backend sets status = 'pending_verification'
    // No auto-login — user must verify email first
    return { needsVerification: true, email: payload.email }
  }, [])

  // ── Google login — auto-verified, log straight in ───────────
  const handleGoogleLogin = useCallback(async (idToken: string) => {
    const res = await apiGoogleLogin(idToken)
    if (res.data?.accessToken) {
      localStorage.setItem('mpn_token', res.data.accessToken)
    }
    if (res.data?.user) setUser(res.data.user)
  }, [])

  // ── Logout ──────────────────────────────────────────────────
  const handleLogout = useCallback(async () => {
    try { await apiLogout() } catch {}
    finally {
      localStorage.removeItem('mpn_token')
      setUser(null)
    }
  }, [])

  // ── Refresh user data (call after email verify) ─────────────
  const handleRefresh = useCallback(async () => {
    try {
      const res = await getMe()
      if (res.data) setUser(res.data)
    } catch {
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
      refresh:     handleRefresh,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)