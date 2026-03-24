import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Eye, EyeOff, Mail, Lock, ArrowRight, Zap,
} from 'lucide-react'
import { useAuth }          from '../context/AuthContext'
import { useGoogleButton }  from '../hooks/useGoogleAuth'
import Turnstile            from '../components/ui/Turnstile'
import { requestMagicLink } from '../api/auth'

type View = 'login' | 'magic' | 'magic-sent'

// ── Minimal dot-grid background ────────────────────────────────
function PageBg() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        backgroundImage: `radial-gradient(var(--border) 1px, transparent 1px)`,
        backgroundSize:  '28px 28px',
        opacity: 0.5,
      }}
    />
  )
}

export default function LoginPage() {
  const { login, googleLogin, isLoggedIn, loading } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = (location.state as { from?: string })?.from ?? '/'

  const [view,         setView]         = useState<View>('login')
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [showPass,     setShowPass]     = useState(false)
  const [submitting,   setSubmitting]   = useState(false)
  const [error,        setError]        = useState('')
  //const [tsToken,      setTsToken]      = useState('')
  const [googleError,  setGoogleError]  = useState('')

  const tsTokenRef = useRef('')

  const googleRef = useRef<HTMLDivElement>(null!)

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && isLoggedIn) navigate(from, { replace: true })
  }, [isLoggedIn, loading])

  // Google button
  const handleGoogleSuccess = useCallback(async (idToken: string) => {
    setGoogleError('')
    try {
      await googleLogin(idToken)
      navigate(from, { replace: true })
    } catch (err: any) {
      setGoogleError(
        err?.response?.data?.message ?? 'Google sign-in failed. Try again.'
      )
    }
  }, [googleLogin, navigate, from])

  useGoogleButton(googleRef, handleGoogleSuccess, setGoogleError)

  // ── Password login ─────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login({
        email,
        password,
        'cf-turnstile-response': tsTokenRef.current || undefined,
      })
      navigate(from, { replace: true })
    } catch (err: any) {
      const msg: string = err?.response?.data?.message ?? ''
      if (err?.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        setError('Please verify your email before signing in. Check your inbox.')
      } else if (err?.response?.status === 403) {
        setError('Please verify your email before signing in. Check your inbox.')
      } else if (err?.response?.status === 429) {
        setError('Too many attempts. Please wait a few minutes.')
      } else if (msg.toLowerCase().includes('security')) {
        setError('Security check failed. Please refresh and try again.')
        tsTokenRef.current = ''
      } else {
        setError('Incorrect email or password.')
      }
    } finally {
      setSubmitting(false)
    }
  }
  // ── Magic link ─────────────────────────────────────────────
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await requestMagicLink(email)
      setView('magic-sent')
    } catch {
      setError('Could not send magic link. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Shared input styles ────────────────────────────────────
  const baseInput = `
    w-full h-11 rounded-xl text-sm outline-none transition-all duration-200
    px-4 placeholder-[var(--text-faint)]
  `
  const inputStyle = {
    background: 'var(--bg)',
    border:     '1px solid var(--border)',
    color:      'var(--text-primary)',
  }
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.currentTarget.style.borderColor = 'var(--accent)')
  const onBlur  = (e: React.FocusEvent<HTMLInputElement>) =>
    (e.currentTarget.style.borderColor = 'var(--border)')

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'var(--bg)' }}
    >
      <PageBg />

      {/* Back to home */}
      <Link
        to="/"
        className="relative mb-6 flex items-center gap-2 text-xs font-bold
                   tracking-widest uppercase transition-opacity hover:opacity-60"
        style={{ color: 'var(--text-muted)' }}
      >
        ← Back to Mango People News
      </Link>

      {/* Card */}
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: 'var(--bg-surface)',
          border:     '1px solid var(--border)',
          boxShadow:  '0 12px 48px rgba(0,0,0,0.10)',
          animation:  'fadeUp 0.3s ease both',
        }}
      >
        {/* Amber top accent bar */}
        <div className="h-1 w-full" style={{ background: 'var(--accent)' }} />

        <div className="p-8 space-y-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: 'var(--accent-light)' }}
            >
              🌳
            </div>
            <div className="leading-none">
              <div
                className="font-display text-base font-black tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                MANGO PEOPLE
              </div>
              <div
                className="text-[8px] font-bold tracking-[0.18em] uppercase mt-0.5"
                style={{ color: 'var(--accent)' }}
              >
                News for Every Indian
              </div>
            </div>
          </Link>

          {/* ── MAGIC LINK SENT ── */}
          {view === 'magic-sent' ? (
            <div className="text-center space-y-4 py-2">
              <div
                className="w-14 h-14 rounded-full flex items-center
                           justify-center text-2xl mx-auto"
                style={{ background: 'var(--accent-light)' }}
              >
                ✉️
              </div>
              <div>
                <h2
                  className="font-display font-black text-xl uppercase tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Check your inbox
                </h2>
                <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                  We sent a magic link to
                </p>
                <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                  {email}
                </p>
                <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                  Click the link to sign in. It expires in 15 minutes.
                  <br />Check your spam folder if you don't see it.
                </p>
              </div>
              <button
                onClick={() => { setView('login'); setError('') }}
                className="text-xs font-bold tracking-widest uppercase
                           transition-opacity hover:opacity-60"
                style={{ color: 'var(--accent)' }}
              >
                ← Try a different method
              </button>
            </div>

          ) : (
            <>
              {/* Heading */}
              <div>
                <h1
                  className="font-display font-black text-2xl uppercase tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {view === 'magic' ? 'Magic Link' : 'Welcome back'}
                </h1>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {view === 'magic'
                    ? 'Enter your email and we\'ll send a sign-in link'
                    : <>No account yet?{' '}
                        <Link
                          to="/register"
                          className="font-bold transition-opacity hover:opacity-70"
                          style={{ color: 'var(--accent)' }}
                        >
                          Create one free
                        </Link>
                      </>
                  }
                </p>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="px-3.5 py-3 rounded-xl text-xs font-medium leading-relaxed"
                  style={{
                    background: 'rgba(192,57,43,0.08)',
                    color:      'var(--breaking)',
                    border:     '1px solid rgba(192,57,43,0.25)',
                  }}
                >
                  {error}
                </div>
              )}

              {/* ── MAGIC LINK FORM ── */}
              {view === 'magic' ? (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div className="relative">
                    <Mail
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: 'var(--text-muted)' }}
                    />
                    <input
                      type="email" required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className={`${baseInput} pl-9`}
                      style={inputStyle}
                      onFocus={onFocus} onBlur={onBlur}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-accent w-full h-11 text-sm font-bold
                               rounded-xl flex items-center justify-center gap-2
                               disabled:opacity-50 transition-all"
                  >
                    {submitting
                      ? 'Sending…'
                      : <><Zap size={14} /> Send Magic Link</>
                    }
                  </button>

                  <button
                    type="button"
                    onClick={() => { setView('login'); setError('') }}
                    className="w-full text-xs font-bold tracking-widest uppercase
                               transition-opacity hover:opacity-60"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    ← Use password instead
                  </button>
                </form>

              ) : (
                /* ── PASSWORD FORM ── */
                <>
                  <form onSubmit={handleLogin} className="space-y-3">

                    {/* Email */}
                    <div className="relative">
                      <Mail
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: 'var(--text-muted)' }}
                      />
                      <input
                        type="email" required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Email address"
                        className={`${baseInput} pl-9`}
                        style={inputStyle}
                        onFocus={onFocus} onBlur={onBlur}
                        autoComplete="email"
                      />
                    </div>

                    {/* Password */}
                    <div className="relative">
                      <Lock
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: 'var(--text-muted)' }}
                      />
                      <input
                        type={showPass ? 'text' : 'password'} required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Password"
                        className={`${baseInput} pl-9 pr-11`}
                        style={inputStyle}
                        onFocus={onFocus} onBlur={onBlur}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2
                                   transition-opacity hover:opacity-60"
                        style={{ color: 'var(--text-muted)' }}
                        aria-label={showPass ? 'Hide password' : 'Show password'}
                      >
                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>

                    {/* Forgot password */}
                    <div className="flex justify-end">
                      <Link
                        to="/forgot-password"
                        className="text-xs transition-opacity hover:opacity-60"
                        style={{ color: 'var(--accent)' }}
                      >
                        Forgot password?
                      </Link>
                    </div>

                    {/* Cloudflare Turnstile */}
                    <Turnstile
                      onVerify={token => { tsTokenRef.current = token }}
                      onError={() => { tsTokenRef.current = '' }}
                      onExpire={() => { tsTokenRef.current = '' }}
                      theme="auto"
                    />

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-accent w-full h-11 text-sm font-bold
                                 rounded-xl flex items-center justify-center gap-2
                                 disabled:opacity-50 transition-all"
                    >
                      {submitting
                        ? 'Signing in…'
                        : <>Sign In <ArrowRight size={14} /></>
                      }
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                    <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                      or continue with
                    </span>
                    <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                  </div>

                  {/* Google button — GSI renders here */}
                  {googleError && (
                    <p className="text-xs text-center" style={{ color: 'var(--breaking)' }}>
                      {googleError}
                    </p>
                  )}
                  <div ref={googleRef} className="w-full min-h-[44px]" />

                  {/* Magic link */}
                  <button
                    type="button"
                    onClick={() => { setView('magic'); setError('') }}
                    className="w-full flex items-center justify-center gap-2
                               h-11 rounded-xl text-sm font-semibold
                               transition-all btn-ghost"
                  >
                    <Zap size={14} />
                    Sign in with Magic Link
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="relative mt-6 text-[11px]" style={{ color: 'var(--text-faint)' }}>
        By signing in you agree to our{' '}
        <Link to="/terms" className="underline hover:opacity-70">Terms</Link>
        {' '}and{' '}
        <Link to="/privacy" className="underline hover:opacity-70">Privacy Policy</Link>
      </p>
    </div>
  )
}