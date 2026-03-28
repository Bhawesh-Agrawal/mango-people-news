import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate, useLocation }            from 'react-router-dom'
import { Eye, EyeOff, Zap }                          from 'lucide-react'
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
      setGoogleError(err?.response?.data?.message ?? 'Google sign-in failed. Please try again.')
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
        setError('Please verify your email before signing in. Check your inbox.')
      } else if (status === 429) {
        // This can appear right after registration due to shared IP counters.
        // Give a friendlier message that doesn't imply wrongdoing.
        setError('Please wait a moment before signing in, then try again.')
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
      className="min-h-screen flex flex-col items-center justify-center p-4 py-10"
      style={{ background: 'var(--bg)' }}
    >
      {/* Wordmark — top of page, always visible */}
      <Link to="/" className="mb-8 block text-center">
        <div
          className="font-display font-bold tracking-tight"
          style={{ fontSize: '26px', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
        >
          🌳 MANGO PEOPLE NEWS
        </div>
        <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          News for Every Indian
        </div>
      </Link>

      {/* Card */}
      <div
        className="w-full rounded-2xl p-7 sm:p-10"
        style={{
          maxWidth:   '440px',
          background: 'var(--bg-surface)',
          border:     '1px solid var(--border)',
          boxShadow:  '0 4px 24px rgba(0,0,0,0.06)',
        }}
      >

        {/* ── MAGIC LINK SENT ── */}
        {view === 'magic-sent' ? (
          <div className="space-y-5">
            <div className="text-4xl">✉️</div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-2"
                style={{ color: 'var(--text-primary)' }}>
                Check your inbox
              </h1>
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                We sent a sign-in link to{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
                It expires in 15 minutes. Check your spam folder if you don't see it.
              </p>
            </div>
            <button
              onClick={() => { setView('login'); setError('') }}
              className="text-base font-medium transition-opacity hover:opacity-60"
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
                className="text-3xl font-bold tracking-tight mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                {view === 'magic' ? 'Magic link' : 'Sign in'}
              </h1>
              <p className="text-base" style={{ color: 'var(--text-muted)' }}>
                {view === 'magic'
                  ? "We'll email you a sign-in link. No password needed."
                  : <>Don't have an account?{' '}
                      <Link
                        to="/register"
                        className="font-semibold transition-opacity hover:opacity-70"
                        style={{ color: 'var(--accent)' }}
                      >
                        Create one free
                      </Link>
                    </>
                }
              </p>
            </div>

            {/* Error banner */}
            {(error || googleError) && (
              <div
                className="mb-6 px-4 py-3 rounded-xl text-sm font-medium"
                style={{
                  background: 'rgba(185,28,28,0.07)',
                  color:      'var(--breaking)',
                  border:     '1px solid rgba(185,28,28,0.15)',
                }}
              >
                {error || googleError}
              </div>
            )}

            {/* ── MAGIC LINK FORM ── */}
            {view === 'magic' ? (
              <form onSubmit={handleMagicLink} className="space-y-5">
                <FormField
                  id="magic-email"
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                  placeholder="you@example.com"
                />
                <PrimaryButton submitting={submitting} label="Send sign-in link" />
                <button
                  type="button"
                  onClick={() => { setView('login'); setError('') }}
                  className="w-full text-base text-center py-2 transition-opacity hover:opacity-60"
                  style={{ color: 'var(--text-muted)' }}
                >
                  ← Back to password sign in
                </button>
              </form>

            ) : (
              /* ── PASSWORD FORM ── */
              <form onSubmit={handleLogin} className="space-y-5">

                <FormField
                  id="login-email"
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                  placeholder="you@example.com"
                />

                {/* Password field with inline forgot link */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="login-password"
                      className="text-sm font-semibold"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm transition-opacity hover:opacity-60"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPass ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="w-full text-base outline-none rounded-xl px-4 pr-12"
                      style={{
                        height:     '52px',
                        background: 'var(--bg)',
                        color:      'var(--text-primary)',
                        border:     '1px solid var(--border)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2
                                 transition-opacity hover:opacity-60"
                      style={{ color: 'var(--text-muted)' }}
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Cloudflare Turnstile — scaled to fit on all screens */}
                <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
                  <Turnstile
                    onVerify={token => { tsTokenRef.current = token }}
                    onError={() => { tsTokenRef.current = '' }}
                    onExpire={() => { tsTokenRef.current = '' }}
                    theme="auto"
                  />
                </div>

                <PrimaryButton submitting={submitting} label="Sign in" />

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>or</span>
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                </div>

                {/* Google GSI button */}
                <div ref={googleRef} className="w-full min-h-[48px]" />

                {/* Magic link option */}
                <button
                  type="button"
                  onClick={() => { setView('magic'); setError('') }}
                  className="w-full flex items-center justify-center gap-2
                             rounded-xl text-base font-medium transition-opacity hover:opacity-80"
                  style={{
                    height:     '52px',
                    border:     '1px solid var(--border)',
                    color:      'var(--text-secondary)',
                    background: 'transparent',
                  }}
                >
                  <Zap size={16} />
                  Sign in with magic link
                </button>

              </form>
            )}
          </>
        )}
      </div>

      {/* Terms footer */}
      <p className="mt-6 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
        By signing in you agree to our{' '}
        <Link to="/terms" className="underline hover:opacity-70">Terms</Link>
        {' '}and{' '}
        <Link to="/privacy" className="underline hover:opacity-70">Privacy Policy</Link>
      </p>
    </div>
  )
}

// ── Shared field component ────────────────────────────────────
// Boxed input — 52px height, clear border, large enough to tap comfortably.
// Underline-only inputs are hard to see on mobile and look unfinished
// on a card-based layout.

function FormField({
  id, label, type, value, onChange, autoComplete, placeholder,
}: {
  id:            string
  label:         string
  type:          string
  value:         string
  onChange:      (v: string) => void
  autoComplete?: string
  placeholder?:  string
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold mb-2"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        required
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full text-base outline-none rounded-xl px-4"
        style={{
          height:     '52px',
          background: 'var(--bg)',
          color:      'var(--text-primary)',
          border:     '1px solid var(--border)',
        }}
      />
    </div>
  )
}

// ── Primary CTA button ────────────────────────────────────────

function PrimaryButton({ submitting, label }: { submitting: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className="w-full flex items-center justify-center rounded-xl
                 text-base font-bold transition-opacity disabled:opacity-50 hover:opacity-90"
      style={{
        height:     '52px',
        background: 'var(--accent)',
        color:      '#ffffff',
      }}
    >
      {submitting ? 'Please wait…' : label}
    </button>
  )
}