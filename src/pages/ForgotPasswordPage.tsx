import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../api/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setError('')
    setSubmitting(true)

    try {
      await forgotPassword(email)
      setSuccess(true)
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        'Could not send reset instructions. Please try again.'
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
            Reset your password
          </h1>
          <p className="text-base" style={{ color: 'var(--text-muted)' }}>
            Enter your email and we&apos;ll send a password reset link if the account exists.
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
                Check your email
              </h2>
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                If this email is registered, you will receive a password reset link shortly.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl px-4 py-3 font-semibold transition-opacity hover:opacity-80"
              style={{ background: 'var(--accent)', color: '#ffffff' }}
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField
              id="forgot-email"
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              placeholder="you@example.com"
            />

            <PrimaryButton submitting={submitting} label="Send reset link" />

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
