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
  googleLogin as apiGoogleLogin,
} from '../api/auth'
import type { LoginPayload, RegisterPayload } from '../api/auth'

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

  const isLoggedIn    = !!user
  const isEditor      = user?.role === 'editor'      || user?.role === 'super_admin'
  const isAuthor      = user?.role === 'author'      || isEditor
  const isSuperAdmin  = user?.role === 'super_admin'
  const emailVerified = user?.email_verified ?? false

  // ── Restore session on mount ──────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('mpn_token')
    if (!token) {
      setLoading(false)
      return
    }

    getMe()
      .then(res => {
        if (res.data) setUser(res.data)
        else localStorage.removeItem('mpn_token')
      })
      .catch(() => {
        localStorage.removeItem('mpn_token')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  // ── Login ─────────────────────────────────────────────────────
  const handleLogin = useCallback(async (payload: LoginPayload) => {
    const res = await apiLogin(payload)

    if (res.data?.accessToken) {
      localStorage.setItem('mpn_token', res.data.accessToken)
    }

    // Set user directly from login response for instant UI update
    if (res.data?.user) {
      setUser(res.data.user)
    }

    // Then fetch full profile from /auth/me to get all fields
    // (login response only returns id, email, full_name, role)
    try {
      const me = await getMe()
      if (me.data) setUser(me.data)
    } catch {
      // Non-fatal — user is still set from login response above
    }
  }, [])

  // ── Register — no auto-login, must verify email ───────────────
  const handleRegister = useCallback(async (
    payload: RegisterPayload
  ): Promise<RegisterResult> => {
    await apiRegister(payload)
    return { needsVerification: true, email: payload.email }
  }, [])

  // ── Google login — auto-verified, immediate access ────────────
  const handleGoogleLogin = useCallback(async (idToken: string) => {
    const res = await apiGoogleLogin(idToken)

    if (res.data?.accessToken) {
      localStorage.setItem('mpn_token', res.data.accessToken)
    }
    if (res.data?.user) {
      setUser(res.data.user)
    }

    // Fetch full profile
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

  // ── Refresh user from server ──────────────────────────────────
  // Call this after email verification or any profile update
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