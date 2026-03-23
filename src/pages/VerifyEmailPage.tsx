import { useEffect, useState } from 'react'
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
  const [params]  = useSearchParams()
  const navigate  = useNavigate()
  const { refresh } = useAuth()

  const [state,   setState]   = useState<State>('loading')
  const [message, setMessage] = useState('')
  const [counter, setCounter] = useState(5)

  const token = params.get('token')

  useEffect(() => {
    if (!token) {
      setState('error')
      setMessage('No verification token found. Please check the link in your email.')
      return
    }

    verifyEmail(token)
      .then(async () => {
        setState('success')
        // Refresh auth context — if user is logged in, update their verified status
        await refresh().catch(() => {})

        // Auto-redirect to login after countdown
        let count = 5
        const interval = setInterval(() => {
          count -= 1
          setCounter(count)
          if (count <= 0) {
            clearInterval(interval)
            navigate('/login', { replace: true })
          }
        }, 1000)

        return () => clearInterval(interval)
      })
      .catch((err) => {
        setState('error')
        const msg = err?.response?.data?.message ?? ''
        if (msg.toLowerCase().includes('expired')) {
          setMessage('This verification link has expired. Please register again or request a new link.')
        } else if (msg.toLowerCase().includes('invalid')) {
          setMessage('This verification link is invalid. It may have already been used.')
        } else {
          setMessage('Email verification failed. Please try again or contact support.')
        }
      })
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
            background: state === 'error'
              ? 'var(--breaking)'
              : 'var(--accent)',
          }}
        />

        <div className="p-8 text-center space-y-5">

          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-xl">🌳</span>
            <span
              className="font-display text-base font-black tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              MANGO PEOPLE
            </span>
          </Link>

          {/* State: Loading */}
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
                  className="font-display font-black text-xl uppercase tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Verifying…
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  Please wait while we verify your email address.
                </p>
              </div>
            </div>
          )}

          {/* State: Success */}
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
                  className="font-display font-black text-xl uppercase tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Email verified!
                </h2>
                <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                  Your account is now active. You can sign in and start reading.
                </p>
              </div>

              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{
                  background: 'var(--accent-light)',
                  color:      'var(--text-secondary)',
                }}
              >
                Redirecting to sign in in{' '}
                <strong style={{ color: 'var(--accent)' }}>{counter}s</strong>…
              </div>

              <Link
                to="/login"
                className="btn-accent inline-flex items-center gap-2
                           text-sm px-6 py-2.5 rounded-xl"
              >
                Sign In Now
              </Link>
            </div>
          )}

          {/* State: Error */}
          {state === 'error' && (
            <div className="space-y-4 py-2">
              <div
                className="w-16 h-16 rounded-full flex items-center
                           justify-center mx-auto"
                style={{ background: 'rgba(192,57,43,0.1)' }}
              >
                <XCircle size={32} style={{ color: 'var(--breaking)' }} />
              </div>

              <div>
                <h2
                  className="font-display font-black text-xl uppercase tracking-tight"
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
                  Create a new account
                </Link>
                <Link
                  to="/login"
                  className="btn-ghost flex items-center justify-center
                             text-sm h-11 rounded-xl"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}