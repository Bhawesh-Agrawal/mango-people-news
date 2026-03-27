import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate, useLocation }             from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, CheckCircle2 }      from 'lucide-react'
import { useAuth }         from '../context/AuthContext'
import { useGoogleButton } from '../hooks/useGoogleAuth'
import Turnstile           from '../components/ui/Turnstile'

// Two-step registration:
//   Step 1 — Name + Email   (who are you?)
//   Step 2 — Password       (set your key)
// Why: reduces perceived form length, each step has one clear intent,
// and the transition gives a sense of progress without a progress bar.
type Step = 1 | 2

function PasswordHints({ password }: { password: string }) {
  if (!password) return null
  const checks = [
    { label: '8+ characters', ok: password.length >= 8  },
    { label: 'Uppercase',     ok: /[A-Z]/.test(password) },
    { label: 'Number',        ok: /[0-9]/.test(password) },
  ]
  return (
    <div className="flex gap-4 mt-2">
      {checks.map(c => (
        <span
          key={c.label}
          className="text-[11px] transition-colors duration-200"
          style={{ color: c.ok ? '#16a34a' : 'var(--text-muted)' }}
        >
          {c.ok ? '✓ ' : '· '}{c.label}
        </span>
      ))}
    </div>
  )
}

export default function RegisterPage() {
  const { register, googleLogin, isLoggedIn, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from     = (location.state as { from?: string })?.from ?? '/'

  const [step,       setStep]       = useState<Step>(1)
  const [done,       setDone]       = useState(false)
  const [regEmail,   setRegEmail]   = useState('')

  // Form fields
  const [fullName,   setFullName]   = useState('')
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [showPass,   setShowPass]   = useState(false)

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

  // Step 1 → Step 2 transition
  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) { setError('Please enter your name.'); return }
    if (!email.trim())    { setError('Please enter your email.'); return }
    setError('')
    setStep(2)
  }

  const validatePassword = () => {
    if (password.length < 8)     return 'Password must be at least 8 characters.'
    if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter.'
    if (!/[0-9]/.test(password)) return 'Password must include a number.'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const pwErr = validatePassword()
    if (pwErr) { setError(pwErr); return }

    const turnstileToken = tsTokenRef.current
    if (!turnstileToken && import.meta.env.VITE_TURNSTILE_SITE_KEY) {
      setError('Please complete the security check.')
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
      tsTokenRef.current = ''
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
        ── LEFT PANEL — brand presence (desktop only) ──────────────
        Same visual language as LoginPage — dark masthead, editorial feel.
      */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 px-16 py-14"
        style={{
          background:  'var(--text-primary)',
          color:       'var(--bg)',
          borderRight: '1px solid var(--border)',
        }}
      >
        <Link to="/" className="block">
          <div className="text-[11px] font-semibold tracking-[0.18em] uppercase mb-3 opacity-50">
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
          <div className="mt-4 text-sm tracking-wide opacity-60">
            News for Every Indian
          </div>
        </Link>

        <div>
          <p className="text-sm opacity-60 leading-relaxed mb-8">
            Join thousands of readers who start their morning with India's most reliable financial news.
          </p>
          <div className="space-y-3">
            {[
              'Daily market briefings',
              'Breaking business news',
              'Deep-dive analysis',
              'Sector & company coverage',
            ].map(item => (
              <div key={item} className="flex items-center gap-3 opacity-70">
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: 'var(--accent)' }}
                />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-6 text-[11px] opacity-40 tracking-wide">
          <Link to="/privacy" className="hover:opacity-100 transition-opacity">Privacy</Link>
          <Link to="/terms"   className="hover:opacity-100 transition-opacity">Terms</Link>
          <Link to="/about"   className="hover:opacity-100 transition-opacity">About</Link>
        </div>
      </div>

      {/*
        ── RIGHT PANEL — registration flow ────────────────────────
      */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 lg:py-0">

        {/* Mobile-only logo */}
        <div className="lg:hidden mb-10">
          <Link to="/" className="inline-block">
            <div
              className="font-display font-bold leading-none"
              style={{ fontSize: '28px', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}
            >
              MANGO PEOPLE NEWS
            </div>
            <div className="text-xs mt-1 tracking-wide" style={{ color: 'var(--text-muted)' }}>
              News for Every Indian
            </div>
          </Link>
        </div>

        <div className="w-full max-w-sm mx-auto lg:mx-0">

          {/* ── DONE STATE ── */}
          {done ? (
            <div className="space-y-6">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'var(--bg-subtle)' }}
              >
                <CheckCircle2 size={24} style={{ color: '#16a34a' }} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight mb-2"
                  style={{ color: 'var(--text-primary)' }}>
                  Check your inbox
                </h1>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  We sent a verification link to{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>{regEmail}</strong>.
                  Click it to activate your account, then sign in.
                  Check spam if you don't see it — link expires in 24 hours.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium
                           transition-opacity hover:opacity-70"
                style={{ color: 'var(--accent)' }}
              >
                Go to sign in <ArrowRight size={13} />
              </Link>
            </div>

          ) : (
            <>
              {/* Step indicator — minimal, no bar */}
              <div className="flex items-center gap-2 mb-8">
                <span
                  className="text-[11px] font-medium tracking-widest uppercase"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Step {step} of 2
                </span>
                <div className="flex gap-1.5 ml-2">
                  {([1, 2] as Step[]).map(s => (
                    <div
                      key={s}
                      className="h-0.5 w-6 rounded-full transition-all duration-300"
                      style={{
                        background: s <= step ? 'var(--text-primary)' : 'var(--border)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* ── STEP 1 — Identity ── */}
              {step === 1 && (
                <>
                  <div className="mb-8">
                    <h1 className="text-2xl font-semibold tracking-tight"
                      style={{ color: 'var(--text-primary)' }}>
                      Create your account
                    </h1>
                    <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                      Already have one?{' '}
                      <Link to="/login"
                        className="font-medium transition-opacity hover:opacity-70"
                        style={{ color: 'var(--accent)' }}>
                        Sign in
                      </Link>
                    </p>
                  </div>

                  {error && (
                    <p className="text-sm mb-4" style={{ color: 'var(--breaking)' }}>{error}</p>
                  )}

                  <form onSubmit={handleStep1} className="space-y-5">
                    <UnderlineField
                      label="Full name"
                      type="text"
                      value={fullName}
                      onChange={setFullName}
                      autoComplete="name"
                      placeholder="Ravi Kumar"
                    />
                    <UnderlineField
                      label="Email address"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      autoComplete="email"
                      placeholder="ravi@example.com"
                    />
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2
                                 py-3 text-sm font-semibold rounded-lg
                                 transition-opacity hover:opacity-90 mt-2"
                      style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}
                    >
                      Continue <ArrowRight size={14} />
                    </button>
                  </form>

                  {/* Google alternative */}
                  <div className="mt-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>or</span>
                      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                    </div>
                    {googleError && (
                      <p className="text-xs mb-2" style={{ color: 'var(--breaking)' }}>{googleError}</p>
                    )}
                    <div ref={googleRef} className="w-full min-h-[44px]" />
                  </div>
                </>
              )}

              {/* ── STEP 2 — Password ── */}
              {step === 2 && (
                <>
                  <div className="mb-8">
                    <h1 className="text-2xl font-semibold tracking-tight"
                      style={{ color: 'var(--text-primary)' }}>
                      Set your password
                    </h1>
                    <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                      Creating account for{' '}
                      <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.{' '}
                      <button
                        type="button"
                        onClick={() => { setStep(1); setError('') }}
                        className="transition-opacity hover:opacity-60"
                        style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}
                      >
                        Change
                      </button>
                    </p>
                  </div>

                  {error && (
                    <p className="text-sm mb-4" style={{ color: 'var(--breaking)' }}>{error}</p>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-xs font-medium mb-1.5"
                        style={{ color: 'var(--text-muted)' }}>
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPass ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          autoComplete="new-password"
                          placeholder="Create a strong password"
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
                          className="absolute right-0 top-1/2 -translate-y-1/2
                                     transition-opacity hover:opacity-60"
                          style={{ color: 'var(--text-muted)' }}
                          aria-label={showPass ? 'Hide' : 'Show'}
                        >
                          {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      <PasswordHints password={password} />
                    </div>

                    {/* Turnstile — max-width prevents mobile overflow */}
                    <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
                      <Turnstile
                        onVerify={token => { tsTokenRef.current = token }}
                        onError={() => { tsTokenRef.current = '' }}
                        onExpire={() => { tsTokenRef.current = '' }}
                        theme="auto"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2
                                 py-3 text-sm font-semibold rounded-lg
                                 transition-opacity disabled:opacity-50 hover:opacity-90"
                      style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}
                    >
                      {submitting ? 'Creating account…' : <>Create account <ArrowRight size={14} /></>}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setStep(1); setError('') }}
                      className="w-full text-sm text-center transition-opacity hover:opacity-60"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      ← Back
                    </button>
                  </form>
                </>
              )}

              {/* Terms */}
              <p className="mt-8 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                By continuing you agree to our{' '}
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

// ── Shared underline field ────────────────────────────────────

function UnderlineField({
  label, type, value, onChange, autoComplete, placeholder,
}: {
  label:         string
  type:          string
  value:         string
  onChange:      (v: string) => void
  autoComplete?: string
  placeholder?:  string
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