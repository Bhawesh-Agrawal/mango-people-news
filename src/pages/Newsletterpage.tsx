import { useState } from 'react'
import { Mail, CheckCircle2 } from 'lucide-react'
import SEO from '../seo/Seo'
import { subscribeNewsletter } from '../api/newsletter'

export default function NewsletterPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
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
      setTimeout(() => setStatus('idle'), 5000)
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }


  return (
    <>
      <SEO
        path="/newsletter"
        title="Subscribe to Mango People Newsletter - Business & Markets"
        description="Get India's top business, markets & economy stories daily. Delivered before the opening bell. No spam. Unsubscribe anytime."
      />

      {/* ═══════════════════════════════════════════════════════════
          HERO SECTION WITH FORM
          ═════════════════════════════════════════════════════════ */}
      <section style={{ background: 'var(--bg-surface)' }} className="relative overflow-hidden py-16 md:py-24">
        {/* Subtle background elements */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'var(--accent)' }}
        />
        <div
          className="absolute bottom-0 left-10 w-72 h-72 rounded-full opacity-5"
          style={{ background: 'var(--accent)' }}
        />

        <div className="page-container relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div>
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full mb-6
                           text-xs font-semibold uppercase tracking-wide"
                style={{
                  background: 'var(--accent-light)',
                  color: 'var(--accent-text)',
                  border: '1px solid rgba(200, 130, 10, 0.2)',
                }}
              >
                <Mail size={14} />
                Newsletter
              </div>

              {/* Main heading */}
              <h1
                className="font-display font-black leading-tight mb-4"
                style={{
                  fontSize: 'clamp(32px, 6vw, 56px)',
                  color: 'var(--text-primary)',
                }}
              >
                Stay Ahead of <span style={{ color: 'var(--accent)' }}>Every Market Move</span>
              </h1>

              {/* Subheading */}
              <p
                className="text-lg md:text-xl leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                India's most trusted business newsletter. Breaking news, market insights, and economy stories — delivered to your inbox before the market opens.
              </p>
            </div>

            {/* Right side - Form */}
            <div>
              <div
                className="p-8 rounded-2xl"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                }}
              >
                <h3
                  className="font-bold text-lg mb-6"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Subscribe to Daily Market News
                </h3>

                {/* Subscription form */}
                {status === 'done' ? (
                  <div
                    className="p-4 rounded-lg border-2 flex items-start gap-3"
                    style={{
                      background: 'var(--positive-bg)',
                      borderColor: 'var(--positive)',
                    }}
                  >
                    <CheckCircle2 size={24} style={{ color: 'var(--positive)' }} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <p style={{ color: 'var(--positive)' }} className="font-semibold">
                        Welcome aboard! 🎉
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: 'var(--positive)' }}
                      >
                        {message || 'Check your email to confirm your subscription.'}
                      </p>
                    </div>
                  </div>
                ) : status === 'error' ? (
                  <div
                    className="p-4 rounded-lg border-2 flex items-start gap-3 mb-6"
                    style={{
                      background: 'var(--breaking-bg)',
                      borderColor: 'var(--breaking)',
                    }}
                  >
                    <div
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: 'var(--breaking)' }}
                    >
                      ✕
                    </div>
                    <div>
                      <p style={{ color: 'var(--breaking)' }} className="font-semibold">
                        Oops!
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: 'var(--breaking)' }}
                      >
                        {message}
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name Input */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium mb-2"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        Your Name (Optional)
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Raj Kumar"
                        className="w-full px-4 py-3 rounded-lg text-sm outline-none
                                   transition-all duration-200"
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-primary)',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'var(--accent)'
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border)'
                        }}
                      />
                    </div>

                    {/* Email Input */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium mb-2"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        Email Address *
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="w-full px-4 py-3 rounded-lg text-sm outline-none
                                   transition-all duration-200"
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-primary)',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'var(--accent)'
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border)'
                        }}
                      />
                    </div>

                    {/* Privacy notice */}
                    <p
                      className="text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      We respect your privacy. Unsubscribe at any time with a single click.
                    </p>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={status === 'loading' || !email.trim()}
                      className="w-full py-3.5 rounded-lg font-semibold text-white
                                transition-all duration-300 disabled:opacity-50
                                disabled:cursor-not-allowed hover:shadow-lg
                                hover:translate-y-px active:translate-y-0"
                      style={{
                        background: 'var(--accent)',
                      }}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.background = 'var(--accent-hover)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.background = 'var(--accent)'
                        }
                      }}
                    >
                      {status === 'loading' ? 'Subscribing...' : 'Get Daily Newsletter'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
)}