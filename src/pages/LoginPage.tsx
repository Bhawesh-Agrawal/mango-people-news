import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate, useLocation }            from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Zap }              from 'lucide-react'
import { useAuth }          from '../context/AuthContext'
import { useGoogleButton }  from '../hooks/useGoogleAuth'
import Turnstile            from '../components/ui/Turnstile'
import { requestMagicLink } from '../api/auth'

type View = 'login' | 'magic' | 'magic-sent'

export default function LoginPage() {
  const { login, googleLogin, isLoggedIn, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from     = (location.state as { from?: string })?.from ?? '/'

  const [view,        setView]        = useState<View>('login')
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState('')
  const [googleError, setGoogleError] = useState('')

  const tsTokenRef = useRef('')
  const googleRef  = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    if (!loading && isLoggedIn) navigate(from, { replace: true })
  }, [isLoggedIn, loading])

  const handleGoogleSuccess = useCallback(async (idToken: string) => {
    setGoogleError('')
    try {
      await googleLogin(idToken)
      navigate(from, { replace: true })
    } catch (err: any) {
      setGoogleError(err?.response?.data?.message ?? 'Google sign-in failed.')
    }
  }, [googleLogin, navigate, from])

  useGoogleButton(googleRef, handleGoogleSuccess, setGoogleError)

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
      const code   = err?.response?.data?.code
      const status = err?.response?.status
      const msg    = err?.response?.data?.message ?? ''
      if (code === 'EMAIL_NOT_VERIFIED' || status === 403) {
        setError('Please verify your email before signing in.')
      } else if (status === 429) {
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

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'var(--bg)', fontFamily: 'var(--font-body, DM Sans, sans-serif)' }}
    >

      {/*
        ── LEFT PANEL — editorial brand presence ──────────────────
        Hidden on mobile. On desktop this is the identity half.
        No card, no gradient — just the masthead weight of a newspaper.
      */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 px-16 py-14"
        style={{
          background:  'var(--text-primary)',
          color:       'var(--bg)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Masthead */}
        <Link to="/" className="block">
          <div
            className="text-[11px] font-semibold tracking-[0.18em] uppercase mb-3 opacity-50"
          >
            Est. 2024
          </div>
          <div
            className="font-display font-bold leading-none"
            style={{ fontSize: '52px', letterSpacing: '-0.02em', color: 'var(--bg)' }}
          >
            MANGO
            <br />PEOPLE
            <br />NEWS
          </div>
          <div
            className="mt-4 text-sm tracking-wide opacity-60"
          >
            News for Every Indian
          </div>
        </Link>

        {/* Editorial pull quote */}
        <div>
          <div
            className="text-4xl font-bold leading-none mb-6 opacity-20 select-none"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            "
          </div>
          <p
            className="text-base leading-relaxed opacity-70"
            style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
          >
            Credible, independent financial journalism for India's next generation of investors.
          </p>
          <div className="mt-8 flex items-center gap-3 opacity-40">
            <div className="h-px flex-1" style={{ background: 'var(--bg)' }} />
            <span className="text-[10px] tracking-widest uppercase">Mango People News</span>
            <div className="h-px flex-1" style={{ background: 'var(--bg)' }} />
          </div>
        </div>

        {/* Bottom links */}
        <div className="flex gap-6 text-[11px] opacity-40 tracking-wide">
          <Link to="/privacy" className="hover:opacity-100 transition-opacity">Privacy</Link>
          <Link to="/terms"   className="hover:opacity-100 transition-opacity">Terms</Link>
          <Link to="/about"   className="hover:opacity-100 transition-opacity">About</Link>
        </div>
      </div>

      {/*
        ── RIGHT PANEL — the form ──────────────────────────────────
        Full screen on mobile. Right half on desktop.
        Clean white/bg surface, generous vertical rhythm.
      */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 lg:py-0">

        {/* Mobile-only logo */}
        <div className="lg:hidden mb-10">
          <Link to="/" className="inline-block">
            <div
              className="font-display font-bold leading-none"
              style={{
                fontSize:      '28px',
                letterSpacing: '-0.02em',
                color:         'var(--text-primary)',
              }}
            >
              MANGO PEOPLE NEWS
            </div>
            <div className="text-xs mt-1 tracking-wide"
              style={{ color: 'var(--text-muted)' }}>
              News for Every Indian
            </div>
          </Link>
        </div>

        <div className="w-full max-w-sm mx-auto lg:mx-0">

          {/* ── MAGIC LINK SENT ── */}
          {view === 'magic-sent' ? (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight"
                  style={{ color: 'var(--text-primary)' }}>
                  Check your inbox
                </h1>
                <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                  We sent a sign-in link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
                  It expires in 15 minutes. Check your spam folder if you don't see it.
                </p>
              </div>
              <button
                onClick={() => { setView('login'); setError('') }}
                className="text-sm font-medium transition-opacity hover:opacity-60"
                style={{ color: 'var(--text-muted)' }}
              >
                ← Use a different method
              </button>
            </div>

          ) : (
            <>
              {/* Heading */}
              <div className="mb-8">
                <h1
                  className="text-2xl font-semibold tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {view === 'magic' ? 'Sign in with email' : 'Welcome back'}
                </h1>
                <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                  {view === 'magic'
                    ? "Enter your email and we'll send a sign-in link."
                    : <>No account?{' '}
                        <Link to="/register"
                          className="font-medium transition-opacity hover:opacity-70"
                          style={{ color: 'var(--accent)' }}>
                          Create one free
                        </Link>
                      </>
                  }
                </p>
              </div>

              {/* Error */}
              {(error || googleError) && (
                <div className="mb-6 text-sm" style={{ color: 'var(--breaking)' }}>
                  {error || googleError}
                </div>
              )}

              {/* ── MAGIC LINK FORM ── */}
              {view === 'magic' ? (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <Field
                    label="Email address"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                  <SubmitButton submitting={submitting} label="Send sign-in link" />
                  <button
                    type="button"
                    onClick={() => { setView('login'); setError('') }}
                    className="w-full text-sm text-center transition-opacity hover:opacity-60 pt-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    ← Use password instead
                  </button>
                </form>

              ) : (
                /* ── PASSWORD FORM ── */
                <form onSubmit={handleLogin} className="space-y-4">
                  <Field
                    label="Email address"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    autoComplete="email"
                    placeholder="you@example.com"
                  />

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium"
                        style={{ color: 'var(--text-muted)' }}>
                        Password
                      </label>
                      <Link to="/forgot-password"
                        className="text-xs transition-opacity hover:opacity-60"
                        style={{ color: 'var(--text-muted)' }}>
                        Forgot?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoComplete="current-password"
                        className="w-full text-sm outline-none py-3 pr-10"
                        style={{
                          background:   'transparent',
                          color:        'var(--text-primary)',
                          borderBottom: '1px solid var(--border)',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(v => !v)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-60"
                        style={{ color: 'var(--text-muted)' }}
                        aria-label={showPass ? 'Hide' : 'Show'}
                      >
                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Turnstile — constrained so it never overflows on mobile */}
                  <div className="overflow-hidden" style={{ maxWidth: '100%' }}>
                    <Turnstile
                      onVerify={token => { tsTokenRef.current = token }}
                      onError={() => { tsTokenRef.current = '' }}
                      onExpire={() => { tsTokenRef.current = '' }}
                      theme="auto"
                    />
                  </div>

                  <SubmitButton submitting={submitting} label="Sign in" />

                  {/* Divider */}
                  <div className="flex items-center gap-4 py-2">
                    <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>or</span>
                    <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                  </div>

                  {/* Google button */}
                  <div ref={googleRef} className="w-full min-h-[44px]" />

                  {/* Magic link */}
                  <button
                    type="button"
                    onClick={() => { setView('magic'); setError('') }}
                    className="w-full flex items-center justify-center gap-2
                               py-3 text-sm font-medium rounded-lg transition-opacity hover:opacity-70"
                    style={{
                      border:     '1px solid var(--border)',
                      color:      'var(--text-secondary)',
                      background: 'transparent',
                    }}
                  >
                    <Zap size={13} />
                    Sign in with magic link
                  </button>
                </form>
              )}
            </>
          )}

          {/* Footer */}
          <p className="mt-10 text-[11px]" style={{ color: 'var(--text-muted)' }}>
            By signing in you agree to our{' '}
            <Link to="/terms" className="underline hover:opacity-70">Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" className="underline hover:opacity-70">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Shared sub-components ─────────────────────────────────────

function Field({
  label, type, value, onChange, autoComplete, placeholder,
}: {
  label:        string
  type:         string
  value:        string
  onChange:     (v: string) => void
  autoComplete?: string
  placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5"
        style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>
      <input
        type={type}
        required
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full text-sm outline-none py-3"
        style={{
          background:   'transparent',
          color:        'var(--text-primary)',
          borderBottom: '1px solid var(--border)',
        }}
      />
    </div>
  )
}

function SubmitButton({ submitting, label }: { submitting: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className="w-full flex items-center justify-center gap-2
                 py-3 text-sm font-semibold rounded-lg transition-opacity
                 disabled:opacity-50 hover:opacity-90 mt-2"
      style={{
        background: 'var(--text-primary)',
        color:      'var(--bg)',
      }}
    >
      {submitting ? 'Please wait…' : <>{label} <ArrowRight size={14} /></>}
    </button>
  )
}