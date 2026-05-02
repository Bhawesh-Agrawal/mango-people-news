import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/auth'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const initialToken = searchParams.get('token') ?? ''
  const [token, setToken] = useState(initialToken)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (initialToken && !token) {
      setToken(initialToken)
    }
  }, [initialToken, token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setError('')

    if (!token.trim()) {
      setError('Please provide the reset token from your email.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      await resetPassword(token.trim(), password)
      setSuccess(true)
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        'Could not reset your password. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 py-10" style={{ background: 'var(--bg)' }}>
      <Link to="/" className="mb-8 block text-center">
        <img src="/logo.png" alt="Mango People News" className="mx-auto h-10 w-auto" />
        <div className="font-display font-bold tracking-tight mt-3" style={{ fontSize: '26px', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          Mango People News
        </div>
        <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          News for Every Indian
        </div>
      </Link>

      <div className="w-full rounded-2xl p-7 sm:p-10" style={{ maxWidth: '440px', background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
            Set a new password
          </h1>
          <p className="text-base" style={{ color: 'var(--text-muted)' }}>
            Enter a new password below. Use the token from the email if the link did not populate it automatically.
          </p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(185,28,28,0.07)', color: 'var(--breaking)', border: '1px solid rgba(185,28,28,0.15)' }}>
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-5">
            <div className="text-4xl">✅</div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
                Password reset successful
              </h2>
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Your password was updated. Sign in with your new password now.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center rounded-xl px-4 py-3 font-semibold transition-opacity hover:opacity-80"
              style={{ background: 'var(--accent)', color: '#ffffff' }}
            >
              Go to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField
              id="reset-token"
              label="Reset token"
              type="text"
              value={token}
              onChange={setToken}
              autoComplete="one-time-code"
              placeholder="Paste token from email"
            />
            <FormField
              id="new-password"
              label="New password"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />
            <FormField
              id="confirm-password"
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              placeholder="Repeat your password"
            />

            <PrimaryButton submitting={submitting} label="Reset password" />

            <div className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
              Remembered your password?{' '}
              <Link to="/login" className="font-semibold transition-opacity hover:opacity-70" style={{ color: 'var(--accent)' }}>
                Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function FormField({
  id,
  label,
  type,
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  id: string
  label: string
  type: string
  value: string
  onChange: (value: string) => void
  autoComplete?: string
  placeholder?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
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
        style={{ height: '52px', background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
      />
    </div>
  )
}

function PrimaryButton({ submitting, label }: { submitting: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className="w-full flex items-center justify-center rounded-xl text-base font-bold transition-opacity disabled:opacity-50 hover:opacity-90"
      style={{ height: '52px', background: 'var(--accent)', color: '#ffffff' }}
    >
      {submitting ? 'Please wait…' : label}
    </button>
  )
}
