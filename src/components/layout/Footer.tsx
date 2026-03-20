import { useState } from 'react'
import { Link } from 'react-router-dom'
import { subscribeNewsletterFooter } from '../../api/newsletter'

const LINKS = {
  Coverage: [
    { label: 'Markets',         href: '/category/markets'  },
    { label: 'Business',        href: '/category/business' },
    { label: 'Economy',         href: '/category/economy'  },
    { label: 'Personal Finance',href: '/category/finance'  },
    { label: 'Technology',      href: '/category/tech'     },
    { label: 'Investing',       href: '/category/investing'},
  ],
  Company: [
    { label: 'About Us',  href: '/about'     },
    { label: 'Our Team',  href: '/team'      },
    { label: 'Advertise', href: '/advertise' },
    { label: 'Contact',   href: '/contact'   },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy'    },
    { label: 'Terms of Use',   href: '/terms'      },
    { label: 'Disclaimer',     href: '/disclaimer' },
  ],
}

export default function Footer() {
  const [email,     setEmail]     = useState('')
  const [status,    setStatus]    = useState<'idle'|'loading'|'done'|'error'>('idle')
  const [message,   setMessage]   = useState('')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      const res = await subscribeNewsletterFooter(email)
      setStatus('done')
      setMessage(res.message)
      setEmail('')
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <footer
      style={{
        background:  'var(--bg-surface)',
        borderTop:   '1px solid var(--border)',
      }}
      className="mt-16"
    >
      {/* ── Newsletter strip ─────────────────────────── */}
      <div
        className="py-10"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="page-container">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <p className="section-label">Newsletter</p>
            <h2
              className="font-display text-3xl md:text-4xl font-black
                         tracking-tight leading-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              STAY AHEAD OF THE MARKET
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              Get India's top business, markets and economy stories
              delivered to your inbox every morning.
            </p>

            {status === 'done' ? (
              <div
                className="inline-flex items-center gap-2 px-5 py-3
                           rounded-xl text-sm font-semibold"
                style={{
                  background: 'var(--accent-light)',
                  color:      'var(--accent)',
                }}
              >
                ✓ {message || 'Check your email to confirm!'}
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="flex gap-2 max-w-md mx-auto"
              >
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="flex-1 px-4 h-11 rounded-xl text-sm outline-none
                             transition-all duration-200"
                  style={{
                    background:  'var(--bg)',
                    border:      '1px solid var(--border)',
                    color:       'var(--text-primary)',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'var(--accent)'
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-accent h-11 px-5 text-sm flex-shrink-0
                             disabled:opacity-60"
                >
                  {status === 'loading' ? 'Joining…' : 'Subscribe'}
                </button>
              </form>
            )}

            {status === 'error' && (
              <p className="text-xs" style={{ color: 'var(--breaking)' }}>
                {message}
              </p>
            )}

            <p
              className="text-xs"
              style={{ color: 'var(--text-faint)' }}
            >
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>

      {/* ── Main footer links ────────────────────────── */}
      <div className="py-10">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1 space-y-3">
              <Link to="/" className="flex items-center gap-2">
                <div
                  className="w-9 h-9 rounded-lg flex items-center
                             justify-center text-xl flex-shrink-0"
                  style={{ background: 'var(--accent-light)' }}
                >
                  🌳
                </div>
                <div className="leading-none">
                  <div
                    className="font-display text-lg font-black
                               tracking-tight leading-none"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    MANGO PEOPLE
                  </div>
                  <div
                    className="text-[9px] font-bold tracking-[0.14em]
                               uppercase mt-0.5"
                    style={{ color: 'var(--accent)' }}
                  >
                    News for Every Indian
                  </div>
                </div>
              </Link>
              <p
                className="text-xs leading-relaxed max-w-xs"
                style={{ color: 'var(--text-secondary)' }}
              >
                Trusted business and financial news for India's
                1.4 billion people. Clear, fast, unbiased.
              </p>
            </div>

            {/* Link columns */}
            {Object.entries(LINKS).map(([title, links]) => (
              <div key={title} className="space-y-3">
                <h3 className="section-label">{title}</h3>
                <ul className="space-y-2">
                  {links.map(link => (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        className="text-xs transition-colors duration-150
                                   hover:text-[var(--accent)]"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────── */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        <div className="page-container">
          <div className="h-12 flex items-center justify-between">
            <p
              className="text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              © {new Date().getFullYear()} Mango People News.
              All rights reserved.
            </p>
            <p
              className="text-xs hidden sm:block"
              style={{ color: 'var(--text-faint)' }}
            >
              Market data for informational purposes only.
              Not investment advice.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}