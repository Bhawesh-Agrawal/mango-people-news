import { useEffect, useState, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { verifyEmail } from '../api/auth'
import { useAuth }     from '../context/AuthContext'

type State = 'loading' | 'success' | 'error'

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

export default function VerifyEmailPage() {
  const [params]    = useSearchParams()
  const navigate    = useNavigate()
  const { refresh } = useAuth()

  const [state,   setState]   = useState<State>('loading')
  const [message, setMessage] = useState('')
  const [counter, setCounter] = useState(5)

  // Use a ref so the interval always reads the latest counter value
  const counterRef  = useRef(5)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const token = params.get('token')

  const startCountdown = () => {
    // Reset ref and state together
    counterRef.current = 5
    setCounter(5)

    intervalRef.current = setInterval(() => {
      counterRef.current -= 1
      setCounter(counterRef.current)

      if (counterRef.current <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        navigate('/login', { replace: true })
      }
    }, 1000)
  }

  useEffect(() => {
    if (!token) {
      setState('error')
      setMessage('No verification token found. Please check the link in your email.')
      return
    }

    verifyEmail(token)
      .then(async () => {
        // Refresh auth context if user is already logged in
        await refresh().catch(() => {})

        // Set success state first so UI renders immediately
        setState('success')

        // Start countdown after a tiny delay so React has
        // painted the success state before we start ticking
        setTimeout(startCountdown, 100)
      })
      .catch((err) => {
        setState('error')
        const msg: string = err?.response?.data?.message ?? ''

        if (msg.toLowerCase().includes('already been used')) {
          setMessage('This link has already been used. Please sign in.')
        } else if (msg.toLowerCase().includes('expired')) {
          setMessage('This link has expired. Please register again.')
        } else if (msg.toLowerCase().includes('already verified')) {
          setMessage('Your email is already verified. Please sign in.')
        } else {
          setMessage('This verification link is invalid. Please register again.')
        }
      })

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [token])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'var(--bg)' }}
    >
      <PageBg />

      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: 'var(--bg-surface)',
          border:     '1px solid var(--border)',
          boxShadow:  '0 12px 48px rgba(0,0,0,0.10)',
          animation:  'fadeUp 0.3s ease both',
        }}
      >
        <div
          className="h-1 w-full"
          style={{
            background: state === 'error' ? 'var(--breaking)' : 'var(--accent)',
          }}
        />

        <div className="p-8 text-center space-y-5">

          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-xl">🌳</span>
            <span
              className="font-display text-base font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              MANGO PEOPLE
            </span>
          </Link>

          {/* Loading */}
          {state === 'loading' && (
            <div className="space-y-4 py-4">
              <div
                className="w-16 h-16 rounded-full flex items-center
                           justify-center mx-auto"
                style={{ background: 'var(--accent-light)' }}
              >
                <Loader2
                  size={28}
                  className="animate-spin"
                  style={{ color: 'var(--accent)' }}
                />
              </div>
              <div>
                <h2
                  className="font-display text-display-md"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Verifying your email
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  Just a moment…
                </p>
              </div>
            </div>
          )}

          {/* Success */}
          {state === 'success' && (
            <div className="space-y-4 py-2">
              <div
                className="w-16 h-16 rounded-full flex items-center
                           justify-center mx-auto"
                style={{ background: 'var(--accent-light)' }}
              >
                <CheckCircle2 size={32} style={{ color: 'var(--accent)' }} />
              </div>

              <div>
                <h2
                  className="font-display text-display-md"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Email verified
                </h2>
                <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                  Your account is active. You can now sign in.
                </p>
              </div>

              {/* Countdown — shows immediately, ticks from 5 */}
              <div
                className="flex items-center justify-center gap-2
                           px-4 py-3 rounded-xl text-sm"
                style={{
                  background: 'var(--accent-light)',
                  color:      'var(--text-secondary)',
                }}
              >
                <span>Redirecting to sign in in</span>
                <span
                  className="font-display text-display-sm tabular-nums"
                  style={{ color: 'var(--accent)' }}
                >
                  {counter}
                </span>
                <span>seconds</span>
              </div>

              <Link
                to="/login"
                className="btn-accent inline-flex items-center gap-2
                           text-sm px-6 py-2.5 rounded-xl w-full
                           justify-center"
              >
                Sign In Now
              </Link>
            </div>
          )}

          {/* Error */}
          {state === 'error' && (
            <div className="space-y-4 py-2">
              <div
                className="w-16 h-16 rounded-full flex items-center
                           justify-center mx-auto"
                style={{ background: 'rgba(185,28,28,0.08)' }}
              >
                <XCircle size={32} style={{ color: 'var(--breaking)' }} />
              </div>

              <div>
                <h2
                  className="font-display text-display-md"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Verification failed
                </h2>
                <p
                  className="text-sm mt-2 leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {message}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  to="/register"
                  className="btn-accent flex items-center justify-center
                             gap-2 text-sm h-11 rounded-xl"
                >
                  Try registering again
                </Link>
                <Link
                  to="/login"
                  className="btn-ghost flex items-center justify-center
                             text-sm h-11 rounded-xl"
                >
                  Back to sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}