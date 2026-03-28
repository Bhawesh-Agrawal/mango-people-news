import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate, useLocation }             from 'react-router-dom'
import { Eye, EyeOff, CheckCircle2 }                  from 'lucide-react'
import { useAuth }         from '../context/AuthContext'
import { useGoogleButton } from '../hooks/useGoogleAuth'
import Turnstile           from '../components/ui/Turnstile'

type Step = 1 | 2

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const checks = [
    { label: '8+ chars',  ok: password.length >= 8   },
    { label: 'Uppercase', ok: /[A-Z]/.test(password)  },
    { label: 'Number',    ok: /[0-9]/.test(password)  },
  ]
  const score = checks.filter(c => c.ok).length
  const barColor = score === 3 ? '#16a34a' : score === 2 ? '#f59e0b' : 'var(--breaking)'

  return (
    <div className="mt-3 space-y-2">
      {/* Three-segment bar */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="flex-1 rounded-full transition-all duration-300"
            style={{
              height:     '3px',
              background: i < score ? barColor : 'var(--border)',
            }}
          />
        ))}
      </div>
      {/* Hint chips */}
      <div className="flex gap-4 flex-wrap">
        {checks.map(c => (
          <span
            key={c.label}
            className="text-sm transition-colors duration-200"
            style={{ color: c.ok ? '#16a34a' : 'var(--text-muted)' }}
          >
            {c.ok ? '✓' : '·'} {c.label}
          </span>
        ))}
      </div>
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
      setGoogleError(err?.response?.data?.message ?? 'Google sign-in failed. Please try again.')
    }
  }, [googleLogin, navigate, from])

  useGoogleButton(googleRef, handleGoogleSuccess, setGoogleError)

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!fullName.trim()) { setError('Please enter your full name.'); return }
    if (!email.trim())    { setError('Please enter your email address.'); return }
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

    if (!tsTokenRef.current && import.meta.env.VITE_TURNSTILE_SITE_KEY) {
      setError('Please complete the security check.')
      return
    }

    setSubmitting(true)
    try {
      await register({
        email,
        password,
        full_name: fullName,
        'cf-turnstile-response': tsTokenRef.current || undefined,
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
      className="min-h-screen flex flex-col items-center justify-center p-4 py-10"
      style={{ background: 'var(--bg)' }}
    >
      {/* Wordmark */}
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

        {/* ── SUCCESS STATE ── */}
        {done ? (
          <div className="space-y-5">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(22,163,74,0.1)' }}
            >
              <CheckCircle2 size={24} style={{ color: '#16a34a' }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2"
                style={{ color: 'var(--text-primary)' }}>
                Check your inbox
              </h1>
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                We sent a verification link to{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{regEmail}</strong>.
                Click it to activate your account. The link expires in 24 hours.
                Check your spam folder if you don't see it.
              </p>
            </div>
            <div
              className="rounded-xl p-4 text-sm"
              style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
            >
              <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>What happens next?</p>
              <ol className="space-y-1 list-decimal list-inside">
                <li>Click the verification link in your email</li>
                <li>Your account activates automatically</li>
                <li>Come back here and sign in</li>
              </ol>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center text-base font-semibold
                         transition-opacity hover:opacity-70"
              style={{ color: 'var(--accent)' }}
            >
              Go to sign in →
            </Link>
          </div>

        ) : (
          <>
            {/* Step indicator */}
            <div className="flex items-center gap-3 mb-7">
              <div className="flex gap-2">
                {([1, 2] as Step[]).map(s => (
                  <div
                    key={s}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width:      s <= step ? '24px' : '8px',
                      height:     '8px',
                      background: s <= step ? 'var(--accent)' : 'var(--border)',
                    }}
                  />
                ))}
              </div>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Step {step} of 2
              </span>
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

            {/* ── STEP 1 — Who are you ── */}
            {step === 1 && (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold tracking-tight mb-2"
                    style={{ color: 'var(--text-primary)' }}>
                    Create account
                  </h1>
                  <p className="text-base" style={{ color: 'var(--text-muted)' }}>
                    Already have one?{' '}
                    <Link
                      to="/login"
                      className="font-semibold transition-opacity hover:opacity-70"
                      style={{ color: 'var(--accent)' }}
                    >
                      Sign in
                    </Link>
                  </p>
                </div>

                <form onSubmit={handleStep1} className="space-y-5">
                  <FormField
                    id="reg-name"
                    label="Full name"
                    type="text"
                    value={fullName}
                    onChange={setFullName}
                    autoComplete="name"
                    placeholder="Ravi Kumar"
                  />
                  <FormField
                    id="reg-email"
                    label="Email address"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    autoComplete="email"
                    placeholder="ravi@example.com"
                  />
                  <PrimaryButton submitting={false} label="Continue →" />
                </form>

                {/* Google option on step 1 */}
                <div className="mt-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>or sign up with</span>
                    <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                  </div>
                  <div ref={googleRef} className="w-full min-h-[48px]" />
                </div>
              </>
            )}

            {/* ── STEP 2 — Set password ── */}
            {step === 2 && (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold tracking-tight mb-2"
                    style={{ color: 'var(--text-primary)' }}>
                    Set your password
                  </h1>
                  <p className="text-base" style={{ color: 'var(--text-muted)' }}>
                    For{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.{' '}
                    <button
                      type="button"
                      onClick={() => { setStep(1); setError('') }}
                      className="transition-opacity hover:opacity-60 underline"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Change
                    </button>
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="reg-password"
                      className="block text-sm font-semibold mb-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="reg-password"
                        type={showPass ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoComplete="new-password"
                        placeholder="Create a strong password"
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
                    <PasswordStrength password={password} />
                  </div>

                  {/* Turnstile — clipped to prevent mobile overflow */}
                  <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
                    <Turnstile
                      onVerify={token => { tsTokenRef.current = token }}
                      onError={() => { tsTokenRef.current = '' }}
                      onExpire={() => { tsTokenRef.current = '' }}
                      theme="auto"
                    />
                  </div>

                  <PrimaryButton submitting={submitting} label="Create account" />

                  <button
                    type="button"
                    onClick={() => { setStep(1); setError('') }}
                    className="w-full text-base text-center py-1 transition-opacity hover:opacity-60"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    ← Back
                  </button>
                </form>
              </>
            )}

            {/* Terms */}
            <p className="mt-8 text-sm" style={{ color: 'var(--text-muted)' }}>
              By continuing you agree to our{' '}
              <Link to="/terms" className="underline hover:opacity-70">Terms</Link>
              {' '}and{' '}
              <Link to="/privacy" className="underline hover:opacity-70">Privacy Policy</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

// ── Shared components ─────────────────────────────────────────

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