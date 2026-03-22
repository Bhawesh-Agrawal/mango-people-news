import { useState } from 'react'
import { Mail, ArrowRight } from 'lucide-react'
import { subscribeNewsletter } from '../../api/newsletter'

export default function NewsletterStrip() {
  const [email,   setEmail]   = useState('')
  const [name,    setName]    = useState('')
  const [status,  setStatus]  = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      const res = await subscribeNewsletter(email, name)
      setStatus('done')
      setMessage(res.message)
      setEmail('')
      setName('')
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <section
      className="w-full py-14 md:py-16"
      style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}
    >
      <div className="page-container">
        <div className="max-w-2xl mx-auto">

          {/* Icon */}
          <div
            className="w-11 h-11 rounded-lg flex items-center
                       justify-center mb-5"
            style={{ background: 'var(--accent-light)' }}
          >
            <Mail size={20} style={{ color: 'var(--accent)' }} />
          </div>

          {/* Heading */}
          <h2
            className="font-display font-black uppercase leading-tight
                       tracking-tight mb-3"
            style={{
              fontSize: 'clamp(26px, 5vw, 40px)',
              color:    'var(--text-primary)',
            }}
          >
            Stay Ahead of the Market
          </h2>

          <p
            className="text-sm leading-relaxed mb-6 max-w-lg"
            style={{ color: 'var(--text-secondary)' }}
          >
            India's top business, markets and economy stories — delivered
            to your inbox every morning before the opening bell.
            No spam. Unsubscribe anytime.
          </p>

          {/* Form */}
          {status === 'done' ? (
            <div
              className="inline-flex items-center gap-2.5 px-5 py-3
                         rounded-lg text-sm font-semibold"
              style={{
                background: 'var(--accent-light)',
                color:      'var(--accent)',
                border:     '1px solid var(--accent)',
              }}
            >
              ✓ {message || 'Check your email to confirm!'}
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-2 w-full"
            >
              {/* Name — optional, hidden on mobile */}
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name (optional)"
                className="hidden sm:block flex-shrink-0 px-4 h-11
                           text-sm outline-none transition-all duration-200
                           rounded-lg"
                style={{
                  width:      '180px',
                  background: 'var(--bg)',
                  border:     '1px solid var(--border)',
                  color:      'var(--text-primary)',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                }}
              />

              {/* Email */}
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 px-4 h-11 text-sm outline-none
                           transition-all duration-200 rounded-lg"
                style={{
                  background: 'var(--bg)',
                  border:     '1px solid var(--border)',
                  color:      'var(--text-primary)',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                }}
              />

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-accent h-11 px-5 text-sm font-bold
                           flex-shrink-0 flex items-center gap-2
                           disabled:opacity-60 rounded-lg"
              >
                {status === 'loading' ? 'Joining…' : (
                  <>Subscribe <ArrowRight size={14} /></>
                )}
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="text-xs mt-2" style={{ color: 'var(--breaking)' }}>
              {message}
            </p>
          )}

          {/* Trust signals */}
          <div
            className="flex items-center gap-4 mt-5 text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            <span>📰 Daily at 8am IST</span>
            <span>·</span>
            <span>🔒 No spam ever</span>
            <span>·</span>
            <span>✉️ Unsubscribe anytime</span>
          </div>
        </div>
      </div>
    </section>
  )
}