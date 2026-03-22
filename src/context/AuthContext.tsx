import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types'
import { getMe, login, register, logout } from '../api/auth'
import type {
    LoginPayload,
    RegisterPayload,
} from '../api/auth'

interface AuthState {
  user:        User | null
  loading:     boolean
  isLoggedIn:  boolean
  isEditor:    boolean
  isAuthor:    boolean
  isSuperAdmin:boolean
}

interface AuthContextType extends AuthState {
  login:     (payload: LoginPayload)    => Promise<void>
  register:  (payload: RegisterPayload) => Promise<void>
  logout:    () => Promise<void>
  refresh:   () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user:          null,
  loading:       true,
  isLoggedIn:    false,
  isEditor:      false,
  isAuthor:      false,
  isSuperAdmin:  false,
  login:         async () => {},
  register:      async () => {},
  logout:        async () => {},
  refresh:       async () => {},
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user,    setUser]    = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // ── Derived role flags ──────────────────────────────────────
  const isLoggedIn   = !!user
  const isEditor     = user?.role === 'editor'   || user?.role === 'super_admin'
  const isAuthor     = user?.role === 'author'   || isEditor
  const isSuperAdmin = user?.role === 'super_admin'

  // ── On mount — check if user is already logged in ───────────
  useEffect(() => {
    const token = localStorage.getItem('mpn_token')
    if (!token) {
      setLoading(false)
      return
    }
    getMe()
      .then(res => {
        if (res.data) setUser(res.data)
      })
      .catch(() => {
        // Token invalid or expired — clear it
        localStorage.removeItem('mpn_token')
      })
      .finally(() => setLoading(false))
  }, [])

  // ── Login ───────────────────────────────────────────────────
  const handleLogin = useCallback(async (payload: LoginPayload) => {
    const res = await login(payload)
    if (res.data?.accessToken) {
      localStorage.setItem('mpn_token', res.data.accessToken)
    }
    if (res.data?.user) {
      setUser(res.data.user)
    }
  }, [])

  // ── Register ────────────────────────────────────────────────
  const handleRegister = useCallback(async (payload: RegisterPayload) => {
    await register(payload)
    // After register — auto login
    await handleLogin({
      email:    payload.email,
      password: payload.password,
    })
  }, [handleLogin])

  // ── Logout ──────────────────────────────────────────────────
  const handleLogout = useCallback(async () => {
    try {
      await logout()
    } catch {
      // Even if API fails, clear local state
    } finally {
      localStorage.removeItem('mpn_token')
      setUser(null)
    }
  }, [])

  // ── Refresh user data ───────────────────────────────────────
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
      login:    handleLogin,
      register: handleRegister,
      logout:   handleLogout,
      refresh:  handleRefresh,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)