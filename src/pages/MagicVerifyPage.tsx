import { useEffect, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Loader2, CheckCircle2, XCircle }     from 'lucide-react'
import { verifyMagicLink } from '../api/auth'

type State = 'loading' | 'success' | 'error'

export default function MagicVerifyPage() {
  const [params]   = useSearchParams()
  const navigate   = useNavigate()

  const [state,   setState]   = useState<State>('loading')
  const [message, setMessage] = useState('')
  const [counter, setCounter] = useState(3)

  const token = params.get('token')

  useEffect(() => {
    if (!token) {
      setState('error')
      setMessage('No token found. Please request a new magic link.')
      return
    }

    verifyMagicLink(token)
      .then(async (res) => {
        if (res.data?.accessToken) {
          localStorage.setItem('mpn_token', res.data.accessToken)
        }
        setState('success')

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
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'var(--bg)' }}
    >
      {/* Wordmark */}
      <Link to="/" className="mb-12 block text-center">
        <div
          className="font-display font-bold"
          style={{ fontSize: '22px', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}
        >
          MANGO PEOPLE NEWS
        </div>
      </Link>

      <div className="w-full max-w-xs">

        {/* Loading */}
        {state === 'loading' && (
          <div className="space-y-5">
            <Loader2
              size={24}
              className="animate-spin"
              style={{ color: 'var(--text-muted)' }}
            />
            <div>
              <h1 className="text-xl font-semibold tracking-tight"
                style={{ color: 'var(--text-primary)' }}>
                Signing you in
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Verifying your magic link…
              </p>
            </div>
          </div>
        )}

        {/* Success */}
        {state === 'success' && (
          <div className="space-y-6">
            <CheckCircle2 size={28} style={{ color: '#16a34a' }} />
            <div>
              <h1 className="text-xl font-semibold tracking-tight"
                style={{ color: 'var(--text-primary)' }}>
                You're signed in
              </h1>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Welcome to Mango People News. Redirecting in{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{counter}</strong> seconds.
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center text-sm font-medium
                         transition-opacity hover:opacity-70"
              style={{ color: 'var(--accent)' }}
            >
              Go to homepage →
            </Link>
          </div>
        )}

        {/* Error */}
        {state === 'error' && (
          <div className="space-y-6">
            <XCircle size={28} style={{ color: 'var(--breaking)' }} />
            <div>
              <h1 className="text-xl font-semibold tracking-tight"
                style={{ color: 'var(--text-primary)' }}>
                Link invalid
              </h1>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {message}
              </p>
            </div>
            <Link
              to="/login"
              className="w-full flex items-center justify-center py-3 text-sm
                         font-semibold rounded-lg transition-opacity hover:opacity-90"
              style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}
            >
              Request a new magic link
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}