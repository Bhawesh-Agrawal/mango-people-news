import { useState } from 'react'
import { Mail, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { requestMagicLink } from '../../api/auth'

export default function VerifyEmailNudge() {
  const { user } = useAuth()
  const [sent,      setSent]      = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [loading,   setLoading]   = useState(false)

  if (!user || user.email_verified || dismissed) return null

  const resend = async () => {
    setLoading(true)
    try {
      await requestMagicLink(user.email)
      setSent(true)
    } catch {}
    finally { setLoading(false) }
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg"
      style={{
        background: 'var(--accent-light)',
        border:     '1px solid var(--accent)',
      }}
    >
      <Mail size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
      <div className="flex-1 min-w-0">
        {sent ? (
          <p className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
            Verification email sent! Check your inbox.
          </p>
        ) : (
          <>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              Please verify your email address
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Some features are restricted until you verify.{' '}
              <button
                onClick={resend}
                disabled={loading}
                className="font-bold underline hover:opacity-70 transition-opacity
                           disabled:opacity-50"
                style={{ color: 'var(--accent)' }}
              >
                {loading ? 'Sending…' : 'Resend email'}
              </button>
            </p>
          </>
        )}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="hover:opacity-70 transition-opacity flex-shrink-0"
        style={{ color: 'var(--text-muted)' }}
      >
        <X size={14} />
      </button>
    </div>
  )
}