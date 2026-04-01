/**
 * AccountPage.tsx — /account
 */

import { useState, useRef, useCallback } from 'react'
import { Link, useNavigate }              from 'react-router-dom'
import {
  Edit2, Check, X, Camera, LogOut,
  ChevronRight, Bookmark, TrendingUp,
  Shield, Mail, Clock, User,
  LayoutDashboard,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { client }  from '../api/client'

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
//  Avatar upload via XMLHttpRequest
//
//  WHY NOT axios / client.post for file uploads?
//  axios interceptors (auth headers, base URL transforms, response
//  interceptors that call refresh()) can interfere with FormData
//  requests. More critically, some axios versions or interceptor
//  patterns override Content-Type, stripping the multipart boundary.
//
//  XHR sets Content-Type automatically from the FormData object
//  with the correct boundary — no interceptors, no surprises.
//  We pull the auth token from localStorage directly using the
//  same key the axios client uses: 'mpn_token'.
// ─────────────────────────────────────────────────────────────
function uploadAvatarXHR(file: File, token: string): Promise<{ avatar_url: string }> {
  return new Promise((resolve, reject) => {
    const form = new FormData()
    form.append('avatar', file)   // field name must match multer's .single('avatar')

    const xhr = new XMLHttpRequest()
    // Must match client.ts: BASE_URL + /api/v1
    const base = import.meta.env.VITE_API_URL ?? 'https://api.gallitify.tech'
    xhr.open('POST', `${base}/api/v1/auth/me/avatar`, true)

    // Set auth header manually — DO NOT set Content-Type (XHR does it for FormData)
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.withCredentials = true    // send httpOnly cookies (refresh token)

    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText)
        if (xhr.status >= 200 && xhr.status < 300 && body.success) {
          resolve(body.data)
        } else {
          reject(new Error(body.message ?? `Upload failed (${xhr.status})`))
        }
      } catch {
        reject(new Error(`Upload failed (${xhr.status})`))
      }
    }

    xhr.onerror   = () => reject(new Error('Network error during upload'))
    xhr.ontimeout = () => reject(new Error('Upload timed out'))
    xhr.timeout   = 30_000

    xhr.send(form)
  })
}

// ─────────────────────────────────────────────────────────────
//  Helper: get the current access token
//  Uses the same key as client.ts ('mpn_token').
// ─────────────────────────────────────────────────────────────
function getAccessToken(): string {
  const token = localStorage.getItem('mpn_token') ?? ''
  console.log('[Avatar Upload] token found:', token ? `${token.slice(0, 20)}...` : 'EMPTY')
  console.log('[Avatar Upload] all localStorage keys:', Object.keys(localStorage))
  return token
}

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────
export default function AccountPage() {
  const { user, isLoggedIn, logout, refresh } = useAuth()
  const navigate = useNavigate()

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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center"
        style={{ background: 'var(--bg)' }}>
        <p className="text-4xl">👤</p>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Sign in to view your account
        </h1>
        <Link to="/login" className="btn-accent mt-2">Sign in</Link>
      </div>
    )
  }

  // ── Save name / bio via axios client (JSON — no file, no boundary issue) ──
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

  // ── Core upload: XHR → backend → Cloudinary ──────────────────
  const uploadFile = useCallback(async (file: File) => {
    setAvatarUploading(true)
    setAvatarError('')
    setShowAvatarPicker(false)
    try {
      const token = getAccessToken()
      await uploadAvatarXHR(file, token)
      // Refresh AuthContext so avatar_url updates in the UI
      await refresh()
    } catch (err: any) {
      setAvatarError(err.message ?? 'Upload failed. Please try again.')
    } finally {
      setAvatarUploading(false)
    }
  }, [refresh])

  // ── Device file picker ────────────────────────────────────────
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    // Reset so selecting the same file again still triggers onChange
    e.target.value = ''
  }, [uploadFile])

  // ── DiceBear preset: fetch SVG → upload as File ───────────────
  const handlePresetAvatar = useCallback(async (url: string) => {
    setAvatarUploading(true)
    setAvatarError('')
    setShowAvatarPicker(false)
    try {
      const res  = await fetch(url)
      const blob = await res.blob()
      // Force mime to image/svg+xml regardless of what the CDN sends
      // so the backend SVG detection is reliable
      const file = new File([blob], 'preset-avatar.svg', { type: 'image/svg+xml' })
      await uploadFile(file)
    } catch (err: any) {
      setAvatarError(err.message ?? 'Could not load preset avatar.')
      setAvatarUploading(false)
    }
  }, [uploadFile])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="page-container py-8" style={{ maxWidth: '680px' }}>

        <h1 className="text-2xl font-bold tracking-tight mb-8"
          style={{ color: 'var(--text-primary)' }}>
          My Account
        </h1>

        {/* ── Profile card ─────────────────────────────────── */}
        <div className="rounded-2xl p-6 mb-5"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>

          <div className="flex items-start gap-5 mb-6">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-20 h-20 rounded-2xl overflow-hidden flex items-center
                           justify-center text-2xl font-bold"
                style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
              >
                {avatarUploading ? (
                  <div className="animate-spin w-6 h-6 rounded-full"
                    style={{ border: '2px solid var(--border)', borderTop: '2px solid var(--accent)' }} />
                ) : user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  initial
                )}
              </div>
              <button
                onClick={() => setShowAvatarPicker(v => !v)}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg
                           flex items-center justify-center transition-opacity hover:opacity-80"
                style={{ background: 'var(--accent)', color: '#fff' }}
                title="Change photo"
              >
                <Camera size={13} />
              </button>
            </div>

            {/* Name + role */}
            <div className="flex-1 min-w-0">
              {editingName ? (
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
                      if (e.key === 'Enter')  saveProfile({ full_name: nameValue })
                      if (e.key === 'Escape') { setEditingName(false); setNameValue(user.full_name ?? '') }
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveProfile({ full_name: nameValue })}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                 text-sm font-semibold disabled:opacity-50"
                      style={{ background: 'var(--accent)', color: '#fff' }}
                    >
                      <Check size={13} />{saving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      onClick={() => { setEditingName(false); setNameValue(user.full_name ?? '') }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
                      style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                    >
                      <X size={13} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                    {user.full_name}
                  </h2>
                  <button
                    onClick={() => setEditingName(true)}
                    className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-subtle)]"
                    style={{ color: 'var(--text-muted)' }}
                    title="Edit name"
                  >
                    <Edit2 size={13} />
                  </button>
                </div>
              )}

              {saveSuccess && (
                <p className="text-xs mt-1" style={{ color: '#16a34a' }}>✓ {saveSuccess}</p>
              )}
              {saveError && (
                <p className="text-xs mt-1" style={{ color: 'var(--breaking)' }}>{saveError}</p>
              )}

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                  style={{ background: roleConfig.bg, color: roleConfig.color }}
                >
                  <Shield size={11} />
                  {roleConfig.label}
                </span>
                {!user.email_verified && (
                  <span className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                    style={{ background: 'rgba(185,28,28,0.08)', color: 'var(--breaking)' }}>
                    Email unverified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Avatar error */}
          {avatarError && (
            <p className="text-xs mb-4 -mt-2" style={{ color: 'var(--breaking)' }}>
              {avatarError}
            </p>
          )}

          {/* Avatar picker */}
          {showAvatarPicker && (
            <div className="rounded-xl p-4 mb-5"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>

              <p className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: 'var(--text-muted)' }}>
                Upload a photo
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm
                           font-medium transition-opacity hover:opacity-80 mb-4"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                <Camera size={14} /> Choose from device
              </button>
              {/* Hidden file input — device uploads: jpg/png/webp only */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />

              <p className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: 'var(--text-muted)' }}>
                Or choose a preset avatar
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {AVATAR_STYLES.map(style => {
                  const url = getDiceBearUrl(style, user.email)
                  return (
                    <button
                      key={style}
                      onClick={() => handlePresetAvatar(url)}
                      disabled={avatarUploading}
                      className="rounded-xl overflow-hidden transition-transform
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

          {/* Bio */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
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
                  <Edit2 size={12} />
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
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                 text-xs font-semibold disabled:opacity-50"
                      style={{ background: 'var(--accent)', color: '#fff' }}
                    >
                      <Check size={12} />{saving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      onClick={() => { setEditingBio(false); setBioValue(user.bio ?? '') }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                      style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                    >
                      <X size={12} /> Cancel
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
                {user.bio || 'Click to add a bio…'}
              </p>
            )}
          </div>

          {/* Info rows */}
          <div className="rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border)' }}>
            <InfoRow icon={Mail}  label="Email"        value={user.email} />
            <InfoRow icon={User}  label="Auth method"  value={
              user.auth_provider === 'google'      ? 'Google account'
              : user.auth_provider === 'magic_link' ? 'Magic link'
              : 'Email & password'
            } />
            {joinedDate && (
              <InfoRow icon={Clock} label="Member since" value={joinedDate} />
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="rounded-2xl overflow-hidden mb-5"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}>
              Quick access
            </p>
          </div>
          <QuickLink to="/saved"    icon={Bookmark}       label="Saved articles" description="Articles you've bookmarked" />
          <QuickLink to="/trending" icon={TrendingUp}     label="Trending"        description="Most-read stories right now" />
          {['author', 'editor', 'super_admin'].includes(user.role) && (
            <QuickLink to="/admin" icon={LayoutDashboard} label="Dashboard"       description="Manage articles and content" accent />
          )}
        </div>

        {/* Sign out */}
        <div className="rounded-2xl p-5"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
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
  )
}

// ── Sub-components ────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: {
  icon:  React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5"
      style={{ borderBottom: '1px solid var(--border)' }}>
      <Icon size={14} className="flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
      <span className="text-sm w-28 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
        {value}
      </span>
    </div>
  )
}

function QuickLink({ to, icon: Icon, label, description, accent = false }: {
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
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: accent ? 'var(--accent-light)' : 'var(--bg-subtle)',
          color:      accent ? 'var(--accent)'        : 'var(--text-muted)',
        }}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
        <p className="text-xs mt-0.5"        style={{ color: 'var(--text-muted)' }}>{description}</p>
      </div>
      <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
    </Link>
  )
}