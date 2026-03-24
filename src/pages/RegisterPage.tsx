import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle2,
} from 'lucide-react'
import { useAuth }         from '../context/AuthContext'
import { useGoogleButton } from '../hooks/useGoogleAuth'
import Turnstile           from '../components/ui/Turnstile'

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

// Password strength indicator
function PasswordHints({ password }: { password: string }) {
  if (!password) return null

  const hints = [
    { label: '8+ chars',  ok: password.length >= 8           },
    { label: 'Uppercase', ok: /[A-Z]/.test(password)         },
    { label: 'Number',    ok: /[0-9]/.test(password)         },
  ]

  const strength = hints.filter(h => h.ok).length
  const colors   = ['var(--breaking)', '#f59e0b', '#f59e0b', '#16a34a']
  const labels   = ['', 'Weak', 'Fair', 'Strong']

  return (
    <div className="space-y-2">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{
              background: i < strength ? colors[strength] : 'var(--border)',
            }}
          />
        ))}
      </div>
      {/* Hint chips */}
      <div className="flex gap-2.5">
        {hints.map(h => (
          <span
            key={h.label}
            className="text-[10px] font-semibold transition-colors duration-200"
            style={{ color: h.ok ? '#16a34a' : 'var(--text-muted)' }}
          >
            {h.ok ? '✓ ' : '○ '}{h.label}
          </span>
        ))}
        {strength > 0 && (
          <span
            className="text-[10px] font-bold ml-auto"
            style={{ color: colors[strength] }}
          >
            {labels[strength]}
          </span>
        )}
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const { register, googleLogin, isLoggedIn, loading } = useAuth()
  const navigate = useNavigate()

  const [done,        setDone]        = useState(false)
  const [regEmail,    setRegEmail]    = useState('')
  const [fullName,    setFullName]    = useState('')
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState('')
  //const [tsToken,     setTsToken]     = useState('')
  const [googleError, setGoogleError] = useState('')
  const tsTokenRef = useRef('')

  const googleRef = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    if (!loading && isLoggedIn) navigate('/', { replace: true })
  }, [isLoggedIn, loading])

  const handleGoogleSuccess = useCallback(async (idToken: string) => {
    setGoogleError('')
    try {
      await googleLogin(idToken)
      navigate('/', { replace: true })
    } catch (err: any) {
      setGoogleError(
        err?.response?.data?.message ?? 'Google sign-in failed. Try again.'
      )
    }
  }, [googleLogin, navigate])

  useGoogleButton(googleRef, handleGoogleSuccess, setGoogleError)

  const validatePassword = () => {
    if (password.length < 8)          return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(password))      return 'Password must include an uppercase letter'
    if (!/[0-9]/.test(password))      return 'Password must include a number'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const pwError = validatePassword()
    if (pwError) { setError(pwError); return }

    // Check Turnstile token from ref — always current value
    const turnstileToken = tsTokenRef.current
    if (!turnstileToken && import.meta.env.VITE_TURNSTILE_SITE_KEY) {
      setError('Please complete the security check before submitting.')
      return
    }

    setSubmitting(true)
    try {
      await register({
        email,
        password,
        full_name: fullName,
        'cf-turnstile-response': turnstileToken || undefined,
      })
      setRegEmail(email)
      setDone(true)
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.message ||
        'Registration failed. Please try again.'
      setError(msg)
      // Reset Turnstile so user can try again
      tsTokenRef.current = ''
    } finally {
      setSubmitting(false)
    }
  }

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

      <Link
        to="/"
        className="relative mb-6 flex items-center gap-2 text-xs font-bold
                   tracking-wide uppercase transition-opacity hover:opacity-60"
        style={{ color: 'var(--text-muted)' }}
      >
        ← Back to Mango People News
      </Link>

      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: 'var(--bg-surface)',
          border:     '1px solid var(--border)',
          boxShadow:  '0 12px 48px rgba(0,0,0,0.10)',
          animation:  'fadeUp 0.3s ease both',
        }}
      >
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
                className="font-display text-base font-bold tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                MANGO PEOPLE
              </div>
              <div
                className="text-[8px] font-bold tracking-[0.06em] uppercase mt-0.5"
                style={{ color: 'var(--accent)' }}
              >
                News for Every Indian
              </div>
            </div>
          </Link>

          {/* ── VERIFICATION SUCCESS STATE ── */}
          {done ? (
            <div className="text-center space-y-5 py-2">
              <div
                className="w-16 h-16 rounded-full flex items-center
                           justify-center mx-auto"
                style={{ background: 'var(--accent-light)' }}
              >
                <CheckCircle2 size={32} style={{ color: 'var(--accent)' }} />
              </div>

              <div className="space-y-2">
                <h2
                  className="font-display font-bold text-xl uppercase tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Verify your email
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  We sent a verification link to
                </p>
                <p
                  className="text-sm font-bold px-3 py-1.5 rounded-lg inline-block"
                  style={{
                    background: 'var(--bg-subtle)',
                    color:      'var(--text-primary)',
                  }}
                >
                  {regEmail}
                </p>
              </div>

              <div
                className="text-xs leading-relaxed px-4 py-3 rounded-xl text-left space-y-1.5"
                style={{
                  background: 'var(--bg-subtle)',
                  color:      'var(--text-secondary)',
                }}
              >
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  What happens next?
                </p>
                <p>1. Check your email for a verification link</p>
                <p>2. Click the link to activate your account</p>
                <p>3. Come back here and sign in</p>
                <p className="text-[11px] pt-1" style={{ color: 'var(--text-muted)' }}>
                  Don't see it? Check your spam folder.
                  The link expires in 24 hours.
                </p>
              </div>

              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold
                           tracking-wide uppercase transition-opacity hover:opacity-60"
                style={{ color: 'var(--accent)' }}
              >
                Go to Sign In <ArrowRight size={12} />
              </Link>
            </div>

          ) : (
            <>
              {/* Heading */}
              <div>
                <h1
                  className="font-display font-bold text-2xl uppercase tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Create account
                </h1>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-bold transition-opacity hover:opacity-70"
                    style={{ color: 'var(--accent)' }}
                  >
                    Sign in
                  </Link>
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

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">

                {/* Full name */}
                <div className="relative">
                  <User
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--text-muted)' }}
                  />
                  <input
                    type="text" required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Full name"
                    className={`${baseInput} pl-9`}
                    style={inputStyle}
                    onFocus={onFocus} onBlur={onBlur}
                    autoComplete="name"
                  />
                </div>

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
                <div className="space-y-2">
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
                      placeholder="Create a password"
                      className={`${baseInput} pl-9 pr-11`}
                      style={inputStyle}
                      onFocus={onFocus} onBlur={onBlur}
                      autoComplete="new-password"
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
                  <PasswordHints password={password} />
                </div>

                {/* Verification notice */}
                <div
                  className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl text-xs"
                  style={{
                    background: 'var(--accent-light)',
                    border:     '1px solid rgba(232,160,32,0.2)',
                    color:      'var(--text-secondary)',
                  }}
                >
                  <Mail size={12} className="flex-shrink-0 mt-0.5"
                    style={{ color: 'var(--accent)' }} />
                  <span>
                    We'll email you a verification link to activate your account.
                    You can sign in after clicking it.
                  </span>
                </div>

                {/* Turnstile */}
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
                    ? 'Creating account…'
                    : <>Create Account <ArrowRight size={14} /></>
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

              {/* Google */}
              {googleError && (
                <p className="text-xs text-center" style={{ color: 'var(--breaking)' }}>
                  {googleError}
                </p>
              )}
              <div ref={googleRef} className="w-full min-h-[44px]" />

              {/* Terms */}
              <p
                className="text-center text-[10px] leading-relaxed"
                style={{ color: 'var(--text-muted)' }}
              >
                By creating an account you agree to our{' '}
                <Link to="/terms" className="underline hover:opacity-70">Terms</Link>
                {' '}and{' '}
                <Link to="/privacy" className="underline hover:opacity-70">Privacy Policy</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}