/**
 * AccountPage.tsx — /account
 *
 * Shows the logged-in user's profile.
 * Allows editing: full_name, bio (if backend supports it — graceful fallback if not).
 * Avatar: shows initials or uploaded avatar. Actual avatar upload requires
 * the Cloudinary/S3 backend endpoint — the input is wired and ready.
 *
 * Backend: GET /auth/me, PATCH /auth/me (when you build that endpoint)
 * Currently GET /auth/me returns the full user object from AuthContext.
 */

import { useState, useRef }    from 'react'
import { Link, useNavigate }   from 'react-router-dom'
import {
  User, Mail, Shield, Clock, Edit2,
  Check, X, Camera, LogOut, ChevronRight,
  Bookmark, MessageCircle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { client }  from '../api/client'

// Role display config
const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  reader:      { label: 'Reader',      color: 'var(--text-muted)',  bg: 'var(--bg-subtle)'       },
  author:      { label: 'Author',      color: '#2563eb',            bg: 'rgba(37,99,235,0.08)'   },
  editor:      { label: 'Editor',      color: '#7c3aed',            bg: 'rgba(124,58,237,0.08)'  },
  super_admin: { label: 'Super Admin', color: 'var(--accent)',      bg: 'var(--accent-light)'    },
}

export default function AccountPage() {
  const { user, isLoggedIn, logout, refresh } = useAuth()
  const navigate = useNavigate()

  const [editing,     setEditing]     = useState(false)
  const [nameValue,   setNameValue]   = useState(user?.full_name ?? '')
  const [saving,      setSaving]      = useState(false)
  const [saveError,   setSaveError]   = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Redirect guests
  if (!isLoggedIn || !user) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center"
        style={{ background: 'var(--bg)' }}
      >
        <p className="text-4xl">👤</p>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Sign in to view your account
        </h1>
        <Link to="/login" className="btn-accent mt-2">Sign in</Link>
      </div>
    )
  }

  const roleConfig = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.reader
  const initial    = user.full_name?.charAt(0)?.toUpperCase() ?? '?'
  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : null

  const handleSave = async () => {
    if (!nameValue.trim()) { setSaveError('Name cannot be empty.'); return }
    setSaving(true)
    setSaveError('')
    try {
      // PATCH /auth/me — update the name
      // Build this endpoint on the backend when ready.
      // For now, attempt the call and fallback gracefully.
      await client.patch('/auth/me', { full_name: nameValue.trim() })
      await refresh()
      setEditing(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      // If the endpoint doesn't exist yet, show a friendly message
      const msg = err?.response?.data?.message
      if (err?.response?.status === 404) {
        setSaveError('Profile editing is not yet available. Check back soon.')
      } else {
        setSaveError(msg ?? 'Could not save changes. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setNameValue(user.full_name ?? '')
    setSaveError('')
    setEditing(false)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="page-container py-8 max-w-2xl">

        {/* ── Page title ───────────────────────────── */}
        <h1
          className="text-2xl font-bold tracking-tight mb-8"
          style={{ color: 'var(--text-primary)' }}
        >
          My Account
        </h1>

        {/* ── Profile card ─────────────────────────── */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          {/* Avatar + name row */}
          <div className="flex items-start gap-5 mb-6">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center
                           text-2xl font-bold overflow-hidden"
                style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
              >
                {user.avatar_url
                  ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                  : initial
                }
              </div>
              {/* Avatar upload button — wired but backend endpoint needed */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg
                           flex items-center justify-center transition-opacity hover:opacity-80"
                style={{ background: 'var(--accent)', color: '#fff' }}
                title="Change photo"
              >
                <Camera size={13} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={() => {
                  // Wire this to Cloudinary upload endpoint when ready
                  alert('Avatar upload coming soon.')
                }}
              />
            </div>

            {/* Name + role */}
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-2">
                  <input
                    value={nameValue}
                    onChange={e => setNameValue(e.target.value)}
                    className="w-full text-lg font-bold outline-none rounded-xl px-3 py-2"
                    style={{
                      background: 'var(--bg)',
                      border:     '1px solid var(--border)',
                      color:      'var(--text-primary)',
                    }}
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSave()
                      if (e.key === 'Escape') handleCancelEdit()
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
                                 font-semibold transition-opacity disabled:opacity-50"
                      style={{ background: 'var(--accent)', color: '#fff' }}
                    >
                      <Check size={13} />
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
                                 font-medium transition-opacity hover:opacity-70"
                      style={{
                        background: 'var(--bg-subtle)',
                        color:      'var(--text-muted)',
                        border:     '1px solid var(--border)',
                      }}
                    >
                      <X size={13} /> Cancel
                    </button>
                  </div>
                  {saveError && (
                    <p className="text-xs" style={{ color: 'var(--breaking)' }}>{saveError}</p>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2">
                    <h2
                      className="text-xl font-bold truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {user.full_name}
                    </h2>
                    <button
                      onClick={() => setEditing(true)}
                      className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-subtle)]"
                      style={{ color: 'var(--text-muted)' }}
                      title="Edit name"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                  {saveSuccess && (
                    <p className="text-xs mt-1" style={{ color: '#16a34a' }}>
                      ✓ Profile updated
                    </p>
                  )}
                </div>
              )}

              {/* Role badge */}
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                             text-xs font-semibold"
                  style={{ background: roleConfig.bg, color: roleConfig.color }}
                >
                  <Shield size={11} />
                  {roleConfig.label}
                </span>

                {!user.email_verified && (
                  <span
                    className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                    style={{
                      background: 'rgba(185,28,28,0.08)',
                      color:      'var(--breaking)',
                    }}
                  >
                    Email unverified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Info rows ──────────────────────────── */}
          <div
            className="space-y-0 rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border)' }}
          >
            <InfoRow icon={Mail} label="Email" value={user.email} />
            {joinedDate && (
              <InfoRow icon={Clock} label="Member since" value={joinedDate} />
            )}
            <InfoRow
              icon={User}
              label="Auth method"
              value={
                user.auth_provider === 'google' ? 'Google account'
                : user.auth_provider === 'magic_link' ? 'Magic link'
                : 'Email & password'
              }
            />
          </div>
        </div>

        {/* ── Quick links ───────────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <div
            className="px-5 py-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}>
              Quick access
            </p>
          </div>

          <QuickLink
            to="/saved"
            icon={Bookmark}
            label="Saved articles"
            description="Articles you've bookmarked"
          />
          <QuickLink
            to="/trending"
            icon={MessageCircle}
            label="Trending"
            description="Most-read stories right now"
          />
          {(user.role === 'author' || user.role === 'editor' || user.role === 'super_admin') && (
            <QuickLink
              to="/admin"
              icon={Edit2}
              label="Dashboard"
              description="Manage articles and content"
              accent
            />
          )}
        </div>

        {/* ── Danger zone ───────────────────────────── */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-4"
            style={{ color: 'var(--text-muted)' }}>
            Account
          </p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl
                       text-sm font-semibold transition-colors hover:opacity-80"
            style={{
              background: 'rgba(185,28,28,0.06)',
              color:      'var(--breaking)',
              border:     '1px solid rgba(185,28,28,0.15)',
            }}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>

      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────

function InfoRow({
  icon: Icon, label, value,
}: {
  icon:  React.ElementType
  label: string
  value: string
}) {
  return (
    <div
      className="flex items-center gap-4 px-5 py-3.5"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <Icon size={15} className="flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
      <span className="text-sm w-28 flex-shrink-0"
        style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <span className="text-sm font-medium truncate"
        style={{ color: 'var(--text-primary)' }}>
        {value}
      </span>
    </div>
  )
}

function QuickLink({
  to, icon: Icon, label, description, accent = false,
}: {
  to:          string
  icon:        React.ElementType
  label:       string
  description: string
  accent?:     boolean
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 px-5 py-4 transition-colors
                 hover:bg-[var(--bg-subtle)]"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: accent ? 'var(--accent-light)' : 'var(--bg-subtle)',
          color:      accent ? 'var(--accent)'        : 'var(--text-muted)',
        }}
      >
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {description}
        </p>
      </div>
      <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
    </Link>
  )
}