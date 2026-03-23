import { useEffect, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { verifyMagicLink } from '../api/auth'
//import { useAuth }         from '../context/AuthContext'

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

export default function MagicVerifyPage() {
  const [params]       = useSearchParams()
  const navigate       = useNavigate()
  //const { login: ctxLogin } = useAuth()

  const [state,   setState]   = useState<State>('loading')
  const [message, setMessage] = useState('')
  const [counter, setCounter] = useState(3)

  const token = params.get('token')

  useEffect(() => {
    if (!token) {
      setState('error')
      setMessage('No token found in this link. Please request a new magic link.')
      return
    }

    verifyMagicLink(token)
      .then(async (res) => {
        // Store the access token and update auth context
        if (res.data?.accessToken) {
          localStorage.setItem('mpn_token', res.data.accessToken)
        }

        setState('success')

        // Auto-redirect countdown
        let count = 3
        const interval = setInterval(() => {
          count -= 1
          setCounter(count)
          if (count <= 0) {
            clearInterval(interval)
            navigate('/', { replace: true })
          }
        }, 1000)

        return () => clearInterval(interval)
      })
      .catch((err) => {
        setState('error')
        const msg: string = err?.response?.data?.message ?? ''

        if (msg.toLowerCase().includes('already been used')) {
          setMessage('This magic link has already been used. Please request a new one.')
        } else if (msg.toLowerCase().includes('expired')) {
          setMessage('This magic link has expired. Please request a new one.')
        } else {
          setMessage('This magic link is invalid. Please request a new one.')
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
            background: state === 'error' ? 'var(--breaking)' : 'var(--accent)',
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

          {/* Loading */}
          {state === 'loading' && (
            <div className="space-y-4 py-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
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
                  Signing you in…
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  Verifying your magic link.
                </p>
              </div>
            </div>
          )}

          {/* Success */}
          {state === 'success' && (
            <div className="space-y-4 py-2">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{ background: 'var(--accent-light)' }}
              >
                <CheckCircle2 size={32} style={{ color: 'var(--accent)' }} />
              </div>

              <div>
                <h2
                  className="font-display font-black text-xl uppercase tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  You're signed in!
                </h2>
                <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                  Welcome to Mango People News.
                </p>
              </div>

              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{
                  background: 'var(--accent-light)',
                  color:      'var(--text-secondary)',
                }}
              >
                Redirecting in{' '}
                <strong style={{ color: 'var(--accent)' }}>{counter}s</strong>…
              </div>

              <Link
                to="/"
                className="btn-accent inline-flex items-center gap-2
                           text-sm px-6 py-2.5 rounded-xl"
              >
                Go to Homepage
              </Link>
            </div>
          )}

          {/* Error */}
          {state === 'error' && (
            <div className="space-y-4 py-2">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{ background: 'rgba(192,57,43,0.1)' }}
              >
                <XCircle size={32} style={{ color: 'var(--breaking)' }} />
              </div>

              <div>
                <h2
                  className="font-display font-black text-xl uppercase tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Link invalid
                </h2>
                <p
                  className="text-sm mt-2 leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {message}
                </p>
              </div>

              <Link
                to="/login"
                className="btn-accent flex items-center justify-center
                           gap-2 text-sm h-11 rounded-xl"
              >
                Request a new magic link
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}