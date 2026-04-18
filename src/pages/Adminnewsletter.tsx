/**
 * AdminNewsletter.tsx — /admin/newsletter
 * AdminSettings.tsx   — /admin/settings
 *
 * Both are super_admin only.
 * Exported as named exports from this file.
 */

// ─────────────────────────────────────────────────────────────
// NEWSLETTER PAGE
// ─────────────────────────────────────────────────────────────

import { useEffect, useState }       from 'react'
import { Mail, Users, Send }  from 'lucide-react'
import { useAdmin }                  from '../context/AdminContext'
import { timeAgo }                   from '../lib/utils'

export function AdminNewsletter() {
  const {
    subscribers, subscribersTotal, subscribersLoading,
    campaigns,   campaignsLoading,
    fetchSubscribers, fetchCampaigns, sendCampaign,
  } = useAdmin()

  const [subject,     setSubject]     = useState('')
  const [body,        setBody]        = useState('')
  const [preview,     setPreview]     = useState('')
  const [sending,     setSending]     = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)
  const [sendError,   setSendError]   = useState('')
  const [activeTab,   setActiveTab]   = useState<'compose' | 'history' | 'subscribers'>('compose')

  useEffect(() => {
    fetchSubscribers()
    fetchCampaigns()
  }, [])

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      setSendError('Subject and body are required.')
      return
    }
    setSending(true)
    setSendError('')
    try {
      await sendCampaign({ subject: subject.trim(), body: body.trim(), preview_text: preview.trim() || undefined })
      setSendSuccess(true)
      setSubject('')
      setBody('')
      setPreview('')
      setTimeout(() => setSendSuccess(false), 4000)
    } catch (err: any) {
      setSendError(err?.message ?? 'Failed to send campaign.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Newsletter
        </h2>
        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold"
          style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
          {subscribersTotal} subscribers
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        {(['compose', 'history', 'subscribers'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all"
            style={{
              background: activeTab === tab ? 'var(--text-primary)' : 'transparent',
              color:      activeTab === tab ? 'var(--bg)'           : 'var(--text-muted)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Compose ── */}
      {activeTab === 'compose' && (
        <div className="rounded-2xl p-6 space-y-5"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-2"
              style={{ color: 'var(--text-muted)' }}>
              Subject line *
            </label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Your newsletter subject…"
              className="w-full text-sm outline-none rounded-xl px-4 py-3"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-2"
              style={{ color: 'var(--text-muted)' }}>
              Preview text
            </label>
            <input
              value={preview}
              onChange={e => setPreview(e.target.value)}
              placeholder="Short preview shown in email clients…"
              className="w-full text-sm outline-none rounded-xl px-4 py-3"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-2"
              style={{ color: 'var(--text-muted)' }}>
              Email body * (HTML supported)
            </label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write your newsletter content here…"
              rows={12}
              className="w-full text-sm outline-none rounded-xl px-4 py-3 resize-none font-mono"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          {sendError && (
            <p className="text-sm" style={{ color: 'var(--breaking)' }}>{sendError}</p>
          )}
          {sendSuccess && (
            <p className="text-sm" style={{ color: '#16a34a' }}>
              ✓ Campaign sent to {subscribersTotal} subscribers.
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold
                         transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              <Send size={15} />
              {sending ? 'Sending…' : `Send to ${subscribersTotal} subscribers`}
            </button>
          </div>
        </div>
      )}

      {/* ── Campaign history ── */}
      {activeTab === 'history' && (
        <div className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
          {campaignsLoading ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(n => <div key={n} className="skeleton h-12 rounded animate-pulse" />)}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Mail size={28} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No campaigns sent yet.</p>
            </div>
          ) : campaigns.map((c, i) => (
            <div key={c.id} className="flex items-center gap-4 px-5 py-4"
              style={{ borderBottom: i < campaigns.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{c.subject}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {c.sent_count} recipients · {c.sent_at ? timeAgo(c.sent_at) : 'Pending'}
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold capitalize"
                style={{
                  background: c.status === 'sent' ? 'rgba(22,163,74,0.08)' : 'var(--bg-subtle)',
                  color:      c.status === 'sent' ? '#16a34a'               : 'var(--text-muted)',
                }}>
                {c.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Subscribers ── */}
      {activeTab === 'subscribers' && (
        <div className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
          {subscribersLoading ? (
            <div className="p-4 space-y-3">
              {[1,2,3,4,5].map(n => <div key={n} className="skeleton h-10 rounded animate-pulse" />)}
            </div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-12">
              <Users size={28} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No subscribers yet.</p>
            </div>
          ) : subscribers.map((s, i) => (
            <div key={s.id} className="flex items-center gap-4 px-5 py-3.5"
              style={{ borderBottom: i < subscribers.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {s.name ?? s.email}
                </p>
                {s.name && (
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{s.email}</p>
                )}
              </div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {timeAgo(s.created_at)}
              </span>
              <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold"
                style={{
                  background: s.status === 'active' ? 'rgba(22,163,74,0.08)' : 'var(--bg-subtle)',
                  color:      s.status === 'active' ? '#16a34a'               : 'var(--text-muted)',
                }}>
                {s.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// SETTINGS PAGE
// ─────────────────────────────────────────────────────────────

import { type SiteSettings } from '../context/AdminContext'

export function AdminSettings() {
  const { settings, settingsLoading, settingsError, fetchSettings, updateSettings } = useAdmin()

  const [form,    setForm]    = useState<Partial<SiteSettings>>({})
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [saveErr, setSaveErr] = useState('')

  useEffect(() => { fetchSettings() }, [])
  useEffect(() => { if (settings) setForm(settings) }, [settings])

  const handleSave = async () => {
    setSaving(true)
    setSaveErr('')
    try {
      await updateSettings(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setSaveErr(err?.message ?? 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const set = (key: keyof SiteSettings, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }))

  if (settingsLoading) {
    return (
      <div className="space-y-4 max-w-2xl animate-pulse">
        {[1,2,3,4].map(n => <div key={n} className="skeleton h-12 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
        Settings
      </h2>

      {settingsError && (
        <div className="rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(185,28,28,0.06)', color: 'var(--breaking)', border: '1px solid rgba(185,28,28,0.15)' }}>
          {settingsError}
        </div>
      )}

      <div className="rounded-2xl p-6 space-y-6"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>

        <Section title="Site identity">
          <Field label="Site name">
            <input value={form.site_name ?? ''} onChange={e => set('site_name', e.target.value)}
              className="w-full text-sm outline-none rounded-xl px-4 py-2.5"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </Field>
          <Field label="Tagline">
            <input value={form.site_tagline ?? ''} onChange={e => set('site_tagline', e.target.value)}
              className="w-full text-sm outline-none rounded-xl px-4 py-2.5"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </Field>
          <Field label="Contact email">
            <input value={form.site_email ?? ''} onChange={e => set('site_email', e.target.value)}
              className="w-full text-sm outline-none rounded-xl px-4 py-2.5"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
          </Field>
        </Section>

        <div style={{ height: '1px', background: 'var(--border)' }} />

        <Section title="Features">
          <Toggle
            label="Allow new registrations"
            description="Let users sign up for new accounts"
            value={form.allow_registration ?? true}
            onChange={v => set('allow_registration', v)}
          />
          <Toggle
            label="Allow comments"
            description="Let readers comment on articles"
            value={form.allow_comments ?? true}
            onChange={v => set('allow_comments', v)}
          />
          <Toggle
            label="Comment moderation"
            description="Hold new comments for review before publishing"
            value={form.require_moderation ?? false}
            onChange={v => set('require_moderation', v)}
          />
        </Section>

        <div style={{ height: '1px', background: 'var(--border)' }} />

        <Section title="Danger zone">
          <Toggle
            label="Maintenance mode"
            description="Show a maintenance page to all visitors"
            value={form.maintenance_mode ?? false}
            onChange={v => set('maintenance_mode', v)}
            danger
          />
        </Section>

        {saveErr && <p className="text-sm" style={{ color: 'var(--breaking)' }}>{saveErr}</p>}
        {saved   && <p className="text-sm" style={{ color: '#16a34a' }}>✓ Settings saved.</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-xl text-sm font-semibold transition-opacity
                     hover:opacity-80 disabled:opacity-50"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider mb-4"
        style={{ color: 'var(--text-muted)' }}>
        {title}
      </p>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold block mb-1.5"
        style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function Toggle({
  label, description, value, onChange, danger = false,
}: {
  label:       string
  description: string
  value:       boolean
  onChange:    (v: boolean) => void
  danger?:     boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium"
          style={{ color: danger ? 'var(--breaking)' : 'var(--text-primary)' }}>
          {label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className="flex-shrink-0 relative w-11 h-6 rounded-full transition-all duration-200"
        style={{ background: value ? (danger ? 'var(--breaking)' : 'var(--accent)') : 'var(--border)' }}
        role="switch"
        aria-checked={value}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white
                     transition-transform duration-200"
          style={{ transform: value ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  )
}