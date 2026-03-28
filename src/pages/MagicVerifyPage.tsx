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
      .then(async res => {
        if (res.data?.accessToken) {
          localStorage.setItem('mpn_token', res.data.accessToken)
        }
        setState('success')
        let count = 3
        const interval = setInterval(() => {
          count -= 1
          setCounter(count)
          if (count <= 0) { clearInterval(interval); navigate('/', { replace: true }) }
        }, 1000)
        return () => clearInterval(interval)
      })
      .catch(err => {
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
                Signing you in
              </h1>
              <p className="text-base" style={{ color: 'var(--text-muted)' }}>
                Verifying your magic link…
              </p>
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
                You're signed in
              </h1>
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Welcome to Mango People News. Redirecting in{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{counter}</strong>{' '}
                {counter === 1 ? 'second' : 'seconds'}.
              </p>
            </div>
            <Link
              to="/"
              className="w-full flex items-center justify-center rounded-xl
                         text-base font-bold transition-opacity hover:opacity-90"
              style={{ height: '52px', background: 'var(--accent)', color: '#ffffff' }}
            >
              Go to homepage
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
                Link invalid
              </h1>
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {message}
              </p>
            </div>
            <Link
              to="/login"
              className="w-full flex items-center justify-center rounded-xl
                         text-base font-bold transition-opacity hover:opacity-90"
              style={{ height: '52px', background: 'var(--accent)', color: '#ffffff' }}
            >
              Request a new magic link
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}