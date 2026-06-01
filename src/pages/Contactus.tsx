import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Send, ArrowRight, MessageSquare, Newspaper, AlertCircle } from 'lucide-react'
import SEO from '../seo/Seo'

const CONTACT_EMAIL = 'mangopeoplenews2026@gmail.com'

type FormState = 'idle' | 'loading' | 'done' | 'error'

const REASONS = [
  { value: 'general',    label: 'General Enquiry'   },
  { value: 'tip',        label: 'News Tip'          },
  { value: 'correction', label: 'Correction Request' },
  { value: 'advertise',  label: 'Advertising'       },
  { value: 'other',      label: 'Something Else'    },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', reason: '', message: '' })
  const [status, setStatus]   = useState<FormState>('idle')
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const blur = (field: string) =>
    setTouched(prev => ({ ...prev, [field]: true }))

  const errors = {
    name:    !form.name.trim()                       ? 'Name is required' : '',
    email:   !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? 'Valid email required' : '',
    reason:  !form.reason                            ? 'Please select a reason' : '',
    message: form.message.trim().length < 10        ? 'Message must be at least 10 characters' : '',
  }

  const isValid = Object.values(errors).every(e => !e)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ name: true, email: true, reason: true, message: true })
    if (!isValid) return

    setStatus('loading')

    // Build a mailto link as the submission mechanism —
    // no backend needed, opens the user's mail client pre-filled.
    const subject = encodeURIComponent(
      `[${REASONS.find(r => r.value === form.reason)?.label}] from ${form.name}`
    )
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nReason: ${form.reason}\n\n${form.message}`
    )

    try {
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
      // Give the mail client a moment to open, then show success
      setTimeout(() => {
        setStatus('done')
        setForm({ name: '', email: '', reason: '', message: '' })
        setTouched({})
      }, 800)
    } catch {
      setStatus('error')
    }
  }

  const inputBase = `
    w-full px-4 h-11 rounded-xl text-sm outline-none transition-all duration-200
  `
  const inputStyle = {
    background: 'var(--bg)',
    border:     '1px solid var(--border)',
    color:      'var(--text-primary)',
  }

  const Field = ({
    id, label, error, children,
  }: {
    id: string; label: string; error?: string; children: React.ReactNode
  }) => (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-semibold"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </label>
      {children}
      {touched[id] && error && (
        <p className="flex items-center gap-1 text-xs" style={{ color: 'var(--breaking)' }}>
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  )

  return (
    <main className="page-container py-10 md:py-16 max-w-3xl mx-auto">
      <SEO title="Contact Us" path="/contact" />

      {/* ── Hero ───────────────────────────────────── */}
      <div className="mb-12">
        <span className="cat-label block mb-4">Contact</span>
        <h1
          className="font-display font-black leading-tight tracking-tight mb-4"
          style={{
            fontSize: 'clamp(32px, 6vw, 52px)',
            color: 'var(--text-primary)',
          }}
        >
          Let's talk.
        </h1>
        <p
          className="text-lg leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          Have a news tip? Spotted an error? Want to collaborate? We read every
          message that comes in — even if it takes us a day or two to reply.
        </p>
      </div>

      {/* ── Quick contact cards ─────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {[
          {
            icon: Mail,
            label: 'Email us directly',
            value: CONTACT_EMAIL,
            href:  `mailto:${CONTACT_EMAIL}`,
          },
          {
            icon: Newspaper,
            label: 'Got a news tip?',
            value: 'We protect our sources',
            href:  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('[News Tip]')}`,
          },
          {
            icon: MessageSquare,
            label: 'Found an error?',
            value: 'We\'ll correct it fast',
            href:  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('[Correction]')}`,
          },
        ].map(({ icon: Icon, label, value, href }) => (
          <a
            key={label}
            href={href}
            className="flex flex-col gap-3 p-5 rounded-2xl transition-all duration-200
                       hover:border-[var(--accent)] group"
            style={{
              background: 'var(--bg-surface)',
              border:     '1px solid var(--border)',
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--accent-light)' }}
            >
              <Icon size={17} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <p
                className="text-xs font-semibold mb-0.5"
                style={{ color: 'var(--text-muted)' }}
              >
                {label}
              </p>
              <p
                className="text-sm font-bold break-all
                           group-hover:text-[var(--accent)] transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                {value}
              </p>
            </div>
          </a>
        ))}
      </div>

      {/* ── Divider ────────────────────────────────── */}
      <div
        className="h-px w-full mb-12"
        style={{ background: 'var(--border)' }}
      />

      {/* ── Form ───────────────────────────────────── */}
      <div>
        <span className="section-label block mb-6">Send us a message</span>

        {status === 'done' ? (
          <div
            className="p-8 rounded-2xl text-center space-y-3"
            style={{
              background: 'var(--accent-light)',
              border:     '1px solid var(--border)',
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
              style={{ background: 'var(--accent)' }}
            >
              <Send size={20} color="#fff" />
            </div>
            <h2
              className="font-display font-black text-xl"
              style={{ color: 'var(--text-primary)' }}
            >
              Your mail client should have opened!
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              If it didn't, email us directly at{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-semibold hover:underline"
                style={{ color: 'var(--accent)' }}
              >
                {CONTACT_EMAIL}
              </a>
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="btn-ghost text-sm h-9 px-4 mt-2"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field id="name" label="Your name" error={errors.name}>
                <input
                  id="name"
                  type="text"
                  placeholder="Rahul Sharma"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  onBlur={() => blur('name')}
                  className={inputBase}
                  style={{
                    ...inputStyle,
                    borderColor: touched.name && errors.name ? 'var(--breaking)' : undefined,
                  }}
                  onFocus={e  => { e.currentTarget.style.borderColor = 'var(--accent)' }}
                />
              </Field>

              <Field id="email" label="Your email" error={errors.email}>
                <input
                  id="email"
                  type="email"
                  placeholder="rahul@example.com"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  onBlur={() => blur('email')}
                  className={inputBase}
                  style={{
                    ...inputStyle,
                    borderColor: touched.email && errors.email ? 'var(--breaking)' : undefined,
                  }}
                  onFocus={e  => { e.currentTarget.style.borderColor = 'var(--accent)' }}
                />
              </Field>
            </div>

            <Field id="reason" label="What's this about?" error={errors.reason}>
              <select
                id="reason"
                value={form.reason}
                onChange={e => update('reason', e.target.value)}
                onBlur={() => blur('reason')}
                className={inputBase}
                style={{
                  ...inputStyle,
                  borderColor: touched.reason && errors.reason ? 'var(--breaking)' : undefined,
                }}
                onFocus={e  => { e.currentTarget.style.borderColor = 'var(--accent)' }}
              >
                <option value="" disabled>Select a reason…</option>
                {REASONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </Field>

            <Field id="message" label="Your message" error={errors.message}>
              <textarea
                id="message"
                rows={5}
                placeholder="Tell us what's on your mind…"
                value={form.message}
                onChange={e => update('message', e.target.value)}
                onBlur={() => blur('message')}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none
                           transition-all duration-200 resize-none"
                style={{
                  ...inputStyle,
                  borderColor: touched.message && errors.message ? 'var(--breaking)' : undefined,
                }}
                onFocus={e  => { e.currentTarget.style.borderColor = 'var(--accent)' }}
              />
            </Field>

            {status === 'error' && (
              <p
                className="flex items-center gap-2 text-sm"
                style={{ color: 'var(--breaking)' }}
              >
                <AlertCircle size={14} />
                Something went wrong. Please email us directly at{' '}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-semibold underline"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
            )}

            <div className="flex items-center justify-between gap-4 pt-1">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                We typically reply within 1–2 business days.
              </p>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-accent text-sm h-10 px-6 flex items-center gap-2
                           flex-shrink-0 disabled:opacity-60"
              >
                {status === 'loading' ? (
                  'Opening…'
                ) : (
                  <>Send message <Send size={13} /></>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Divider ────────────────────────────────── */}
      <div
        className="h-px w-full my-12"
        style={{ background: 'var(--border)' }}
      />

      {/* ── Footer nav ─────────────────────────────── */}
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {[
          { label: 'About Us',       to: '/about'               },
          { label: 'All Articles',   to: '/articles'            },
          { label: 'Privacy Policy', to: '/privacy-policy'      },
          { label: 'Terms of Use',   to: '/terms-and-conditions' },
          { label: 'Disclaimer',     to: '/disclaimer'          },
        ].map(({ label, to }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-1 text-xs font-semibold
                       hover:opacity-70 transition-opacity"
            style={{ color: 'var(--text-muted)' }}
          >
            {label} <ArrowRight size={10} />
          </Link>
        ))}
      </div>
      </main>
  )
}