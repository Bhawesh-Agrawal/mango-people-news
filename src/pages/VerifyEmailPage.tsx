import { useEffect, useState, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2 }     from 'lucide-react'
import { verifyEmail } from '../api/auth'
import { useAuth }     from '../context/AuthContext'

type State = 'loading' | 'success' | 'error'

export default function VerifyEmailPage() {
  const [params]    = useSearchParams()
  const navigate    = useNavigate()
  const { refresh } = useAuth()

  const [state,   setState]   = useState<State>('loading')
  const [message, setMessage] = useState('')
  const [counter, setCounter] = useState(5)

  const counterRef  = useRef(5)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const token = params.get('token')

  const startCountdown = () => {
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
        await refresh().catch(() => {})
        setState('success')
        setTimeout(startCountdown, 100)
      })
      .catch(err => {
        setState('error')
        const msg: string = err?.response?.data?.message ?? ''
        if (msg.toLowerCase().includes('already been used')) {
          setMessage('This link has already been used. Please sign in.')
        } else if (msg.toLowerCase().includes('expired')) {
          setMessage('This link has expired. Please register again to get a new one.')
        } else if (msg.toLowerCase().includes('already verified')) {
          setMessage('Your email is already verified. You can sign in now.')
        } else {
          setMessage('This verification link is invalid. Please try registering again.')
        }
      })
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [token])

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

        {/* Loading */}
        {state === 'loading' && (
          <div className="space-y-5">
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} />
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2"
                style={{ color: 'var(--text-primary)' }}>
                Verifying your email
              </h1>
              <p className="text-base" style={{ color: 'var(--text-muted)' }}>Just a moment…</p>
            </div>
          </div>
        )}

        {/* Success */}
        {state === 'success' && (
          <div className="space-y-6">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(22,163,74,0.1)' }}
            >
              <CheckCircle2 size={24} style={{ color: '#16a34a' }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2"
                style={{ color: 'var(--text-primary)' }}>
                Email verified
              </h1>
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Your account is active. Redirecting to sign in in{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{counter}</strong>{' '}
                {counter === 1 ? 'second' : 'seconds'}.
              </p>
            </div>
            <Link
              to="/login"
              className="w-full flex items-center justify-center rounded-xl
                         text-base font-bold transition-opacity hover:opacity-90"
              style={{
                height:     '52px',
                background: 'var(--accent)',
                color:      '#ffffff',
              }}
            >
              Sign in now
            </Link>
          </div>
        )}

        {/* Error */}
        {state === 'error' && (
          <div className="space-y-6">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(185,28,28,0.08)' }}
            >
              <XCircle size={24} style={{ color: 'var(--breaking)' }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2"
                style={{ color: 'var(--text-primary)' }}>
                Verification failed
              </h1>
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {message}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                to="/register"
                className="w-full flex items-center justify-center rounded-xl
                           text-base font-bold transition-opacity hover:opacity-90"
                style={{ height: '52px', background: 'var(--accent)', color: '#ffffff' }}
              >
                Register again
              </Link>
              <Link
                to="/login"
                className="w-full flex items-center justify-center rounded-xl
                           text-base font-medium transition-opacity hover:opacity-70"
                style={{
                  height:  '52px',
                  border:  '1px solid var(--border)',
                  color:   'var(--text-secondary)',
                }}
              >
                Back to sign in
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}