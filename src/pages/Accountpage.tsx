/**
 * AccountPage.tsx — /account
 * Mobile-first layout. Tested down to 320px.
 */

import { useState, useRef, useCallback } from 'react'
import { Link, useNavigate }             from 'react-router-dom'
import {
  Edit2, Check, X, Camera, LogOut,
  ChevronRight, Bookmark, TrendingUp,
  Shield, Mail, Clock, User,
  LayoutDashboard,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { client }  from '../api/client'
import SEO         from '../seo/Seo'

// ── DiceBear preset avatars ───────────────────────────────────
const AVATAR_STYLES = [
  'avataaars', 'bottts', 'pixel-art', 'fun-emoji',
  'lorelei', 'micah', 'notionists', 'rings',
]

function getDiceBearUrl(style: string, seed: string): string {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&size=120`
}

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  reader:      { label: 'Reader',      color: 'var(--text-muted)',  bg: 'var(--bg-subtle)'      },
  author:      { label: 'Author',      color: '#2563eb',            bg: 'rgba(37,99,235,0.08)'  },
  editor:      { label: 'Editor',      color: '#7c3aed',            bg: 'rgba(124,58,237,0.08)' },
  super_admin: { label: 'Super Admin', color: 'var(--accent)',      bg: 'var(--accent-light)'   },
}

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────
export default function AccountPage() {
  const { user, isLoggedIn, logout, refresh } = useAuth()
  const navigate = useNavigate()

  console.log(user);

  const [editingName,    setEditingName]    = useState(false)
  const [editingBio,     setEditingBio]     = useState(false)
  const [nameValue,      setNameValue]      = useState(user?.full_name ?? '')
  const [bioValue,       setBioValue]       = useState(user?.bio ?? '')
  const [saving,         setSaving]         = useState(false)
  const [saveError,      setSaveError]      = useState('')
  const [saveSuccess,    setSaveSuccess]    = useState('')

  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [avatarUploading,  setAvatarUploading]  = useState(false)
  const [avatarError,      setAvatarError]      = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const roleConfig = ROLE_CONFIG[user?.role ?? 'reader']
  const initial    = user?.full_name?.charAt(0)?.toUpperCase() ?? '?'

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : null

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

  // ── Save name / bio ───────────────────────────────────────────
  const saveProfile = async (fields: Record<string, string>) => {
    setSaving(true)
    setSaveError('')
    try {
      await client.patch('/auth/me', fields)
      await refresh()
      setSaveSuccess('Saved')
      setTimeout(() => setSaveSuccess(''), 3000)
      setEditingName(false)
      setEditingBio(false)
    } catch (err: any) {
      setSaveError(err?.response?.data?.message ?? 'Could not save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  // ── File upload (device photo → Cloudinary via backend) ───────
  const uploadFile = useCallback(async (file: File) => {
    setAvatarUploading(true)
    setAvatarError('')
    setShowAvatarPicker(false)
    try {
      const form = new FormData()
      form.append('avatar', file)
      await client.post('/auth/me/avatar', form, {
        headers: { 'Content-Type': undefined },
      })
      await refresh()
    } catch (err: any) {
      setAvatarError(err?.response?.data?.message ?? 'Upload failed. Please try again.')
    } finally {
      setAvatarUploading(false)
    }
  }, [refresh])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    e.target.value = ''
  }, [uploadFile])

  // ── DiceBear preset → save URL directly, no upload ───────────
  const handlePresetAvatar = useCallback(async (url: string) => {
    setAvatarUploading(true)
    setAvatarError('')
    setShowAvatarPicker(false)
    try {
      await client.patch('/auth/me/avatar-url', { avatar_url: url })
      await refresh()
    } catch (err: any) {
      setAvatarError(err?.response?.data?.message ?? 'Could not set avatar.')
    } finally {
      setAvatarUploading(false)
    }
  }, [refresh])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <>
      {/* noIndex — private page, must not appear in Google */}
      <SEO title="My Account" path="/account" noIndex={true} />

      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <div className="mx-auto w-full px-4 sm:px-6 py-6 sm:py-8" style={{ maxWidth: '680px' }}>

          <div className="flex items-center justify-between mb-5">
            <h1 className="text-lg font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}>
              My Account
            </h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                         font-semibold transition-opacity hover:opacity-70"
              style={{
                background: 'rgba(185,28,28,0.06)',
                color:      'var(--breaking)',
                border:     '1px solid rgba(185,28,28,0.12)',
              }}
            >
              <LogOut size={12} /> Sign out
            </button>
          </div>

          <div
            className="rounded-2xl p-4 sm:p-6 mb-4"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >

            <div className="flex items-center gap-3 sm:gap-5 mb-5">

              <div className="relative flex-shrink-0">
                <div
                  className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl overflow-hidden
                             flex items-center justify-center text-xl sm:text-2xl font-bold"
                  style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                >
                  {avatarUploading ? (
                    <div
                      className="animate-spin w-5 h-5 rounded-full"
                      style={{ border: '2px solid var(--border)', borderTop: '2px solid var(--accent)' }}
                    />
                  ) : user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    initial
                  )}
                </div>
                <button
                  onClick={() => setShowAvatarPicker(v => !v)}
                  className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-lg
                             flex items-center justify-center transition-opacity hover:opacity-80"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                  title="Change photo"
                >
                  <Camera size={11} />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                {editingName ? (
                  <div className="space-y-2">
                    <input
                      value={nameValue}
                      onChange={e => setNameValue(e.target.value)}
                      className="w-full text-base font-bold outline-none rounded-xl px-3 py-2"
                      style={{
                        background: 'var(--bg)',
                        border:     '1px solid var(--border)',
                        color:      'var(--text-primary)',
                      }}
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === 'Enter')  saveProfile({ full_name: nameValue })
                        if (e.key === 'Escape') { setEditingName(false); setNameValue(user.full_name ?? '') }
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveProfile({ full_name: nameValue })}
                        disabled={saving}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg
                                   text-xs font-semibold disabled:opacity-50"
                        style={{ background: 'var(--accent)', color: '#fff' }}
                      >
                        <Check size={12} />{saving ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={() => { setEditingName(false); setNameValue(user.full_name ?? '') }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs"
                        style={{
                          background: 'var(--bg-subtle)',
                          color:      'var(--text-muted)',
                          border:     '1px solid var(--border)',
                        }}
                      >
                        <X size={12} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h2
                      className="text-base sm:text-xl font-bold truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {user.full_name}
                    </h2>
                    <button
                      onClick={() => setEditingName(true)}
                      className="flex-shrink-0 p-1 rounded-lg transition-colors
                                 hover:bg-[var(--bg-subtle)]"
                      style={{ color: 'var(--text-muted)' }}
                      title="Edit name"
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                )}

                {saveSuccess && (
                  <p className="text-xs mt-0.5" style={{ color: '#16a34a' }}>✓ {saveSuccess}</p>
                )}
                {saveError && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--breaking)' }}>{saveError}</p>
                )}

                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg
                               text-xs font-semibold"
                    style={{ background: roleConfig.bg, color: roleConfig.color }}
                  >
                    <Shield size={10} />
                    {roleConfig.label}
                  </span>
                  {!user.email_verified && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-lg font-semibold"
                      style={{ background: 'rgba(185,28,28,0.08)', color: 'var(--breaking)' }}
                    >
                      Unverified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {avatarError && (
              <p className="text-xs mb-3 -mt-2" style={{ color: 'var(--breaking)' }}>
                {avatarError}
              </p>
            )}

            {showAvatarPicker && (
              <div
                className="rounded-xl p-3 sm:p-4 mb-4"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider mb-2.5"
                  style={{ color: 'var(--text-muted)' }}>
                  Upload a photo
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm
                             font-medium transition-opacity hover:opacity-80 mb-4"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  <Camera size={13} /> Choose from device
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <p className="text-xs font-semibold uppercase tracking-wider mb-2.5"
                  style={{ color: 'var(--text-muted)' }}>
                  Or choose a preset
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {AVATAR_STYLES.map(style => {
                    const url = getDiceBearUrl(style, user.email)
                    return (
                      <button
                        key={style}
                        onClick={() => handlePresetAvatar(url)}
                        disabled={avatarUploading}
                        className="rounded-xl overflow-hidden aspect-square transition-transform
                                   hover:scale-105 active:scale-95 disabled:opacity-50"
                        style={{ border: '2px solid var(--border)' }}
                        title={style}
                      >
                        <img src={url} alt={style} className="w-full h-full" />
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => setShowAvatarPicker(false)}
                  className="mt-3 text-xs transition-opacity hover:opacity-60"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}>
                  Bio
                </span>
                {!editingBio && (
                  <button
                    onClick={() => setEditingBio(true)}
                    className="p-1 rounded transition-colors hover:bg-[var(--bg-subtle)]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Edit2 size={11} />
                  </button>
                )}
              </div>

              {editingBio ? (
                <div className="space-y-2">
                  <textarea
                    value={bioValue}
                    onChange={e => setBioValue(e.target.value)}
                    placeholder="Tell readers a little about yourself…"
                    rows={3}
                    maxLength={500}
                    className="w-full text-sm outline-none rounded-xl px-3 py-2.5 resize-none"
                    style={{
                      background: 'var(--bg)',
                      border:     '1px solid var(--border)',
                      color:      'var(--text-primary)',
                    }}
                    autoFocus
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {bioValue.length}/500
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveProfile({ bio: bioValue })}
                        disabled={saving}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg
                                   text-xs font-semibold disabled:opacity-50"
                        style={{ background: 'var(--accent)', color: '#fff' }}
                      >
                        <Check size={11} />{saving ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={() => { setEditingBio(false); setBioValue(user.bio ?? '') }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs"
                        style={{
                          background: 'var(--bg-subtle)',
                          color:      'var(--text-muted)',
                          border:     '1px solid var(--border)',
                        }}
                      >
                        <X size={11} /> Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p
                  className="text-sm leading-relaxed cursor-pointer"
                  style={{ color: user.bio ? 'var(--text-secondary)' : 'var(--text-muted)' }}
                  onClick={() => setEditingBio(true)}
                >
                  {user.bio || 'Tap to add a bio…'}
                </p>
              )}
            </div>

            <div className="rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--border)' }}>
              <InfoRow icon={Mail}  label="Email"        value={user.email} />
              <InfoRow icon={User}  label="Auth"         value={
                user.auth_provider === 'google'       ? 'Google'
                : user.auth_provider === 'magic_link' ? 'Magic link'
                : 'Email & password'
              } />
              {joinedDate && (
                <InfoRow icon={Clock} label="Joined" value={joinedDate} />
              )}
            </div>
          </div>

          <div
            className="rounded-2xl overflow-hidden mb-4"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <div className="px-4 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}>
                Quick access
              </p>
            </div>
            <QuickLink
              to="/saved"
              icon={Bookmark}
              label="Saved articles"
              description="Your bookmarked stories"
            />
            <QuickLink
              to="/trending"
              icon={TrendingUp}
              label="Trending"
              description="Most-read right now"
            />
            {['author', 'editor', 'super_admin'].includes(user.role) && (
              <QuickLink
                to="/admin"
                icon={LayoutDashboard}
                label="Dashboard"
                description="Manage content"
                accent
              />
            )}
          </div>

          <div
            className="hidden sm:block rounded-2xl p-5"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-4"
              style={{ color: 'var(--text-muted)' }}>
              Account
            </p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl
                         text-sm font-semibold transition-opacity hover:opacity-80"
              style={{
                background: 'rgba(185,28,28,0.06)',
                color:      'var(--breaking)',
                border:     '1px solid rgba(185,28,28,0.15)',
              }}
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>

        </div>
      </div>
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: {
  icon:  React.ElementType
  label: string
  value: string
}) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4
                 px-4 py-3"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-2 sm:w-28 flex-shrink-0">
        <Icon size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <span className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
      </div>
      <span
        className="text-sm font-medium pl-5 sm:pl-0"
        style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}
      >
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
      className="flex items-center gap-3 px-4 py-3.5 transition-colors
                 hover:bg-[var(--bg-subtle)]"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: accent ? 'var(--accent-light)' : 'var(--bg-subtle)',
          color:      accent ? 'var(--accent)'        : 'var(--text-muted)',
        }}
      >
        <Icon size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight"
          style={{ color: 'var(--text-primary)' }}>
          {label}
        </p>
        <p className="text-xs mt-0.5 leading-tight"
          style={{ color: 'var(--text-muted)' }}>
          {description}
        </p>
      </div>
      <ChevronRight size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
    </Link>
  )
}