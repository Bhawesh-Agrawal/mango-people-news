/**
 * AdminUsers.tsx — /admin/users
 *
 * User management. Super admin only.
 * Search by name/email, filter by role.
 * Inline role change and account suspend/activate.
 */

import { useEffect, useState, useCallback } from 'react'
import {
  Search, X, CheckCircle2,
  XCircle, Clock, ChevronDown,
} from 'lucide-react'
import { useAdmin, type AdminUser } from '../context/AdminContext'
import { timeAgo }                  from '../lib/utils'

const ROLES   = ['all', 'reader', 'author', 'editor', 'super_admin']
const LIMIT   = 25

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  reader:      { label: 'Reader',      color: 'var(--text-muted)', bg: 'var(--bg-subtle)'       },
  author:      { label: 'Author',      color: '#2563eb',           bg: 'rgba(37,99,235,0.08)'   },
  editor:      { label: 'Editor',      color: '#7c3aed',           bg: 'rgba(124,58,237,0.08)'  },
  super_admin: { label: 'Super Admin', color: 'var(--accent)',     bg: 'var(--accent-light)'    },
}

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  active:               { icon: CheckCircle2, color: '#16a34a', label: 'Active'     },
  suspended:            { icon: XCircle,      color: '#dc2626', label: 'Suspended'  },
  pending_verification: { icon: Clock,        color: '#ca8a04', label: 'Unverified' },
}

export default function AdminUsers() {
  const {
    users, usersTotal, usersLoading, usersError,
    fetchUsers, updateUserRole, updateUserStatus,
  } = useAdmin()

  const [search,      setSearch]      = useState('')
  const [roleFilter,  setRoleFilter]  = useState('all')
  const [page,        setPage]        = useState(1)
  const [mutating,    setMutating]    = useState<string | null>(null)
  const [mutateError, setMutateError] = useState<string | null>(null)

  const load = useCallback(() => {
    fetchUsers({
      page,
      search: search || undefined,
      role:   roleFilter === 'all' ? undefined : roleFilter,
    })
  }, [page, search, roleFilter, fetchUsers])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load() }, 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => { load() }, [roleFilter, page])

  const totalPages = Math.ceil(usersTotal / LIMIT)

  const handleRoleChange = async (userId: string, newRole: string) => {
    setMutating(userId)
    setMutateError(null)
    try {
      await updateUserRole(userId, newRole)
    } catch (err: any) {
      setMutateError(err?.message ?? 'Could not update role.')
    } finally {
      setMutating(null)
    }
  }

  const handleStatusToggle = async (user: AdminUser) => {
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended'
    setMutating(user.id)
    setMutateError(null)
    try {
      await updateUserStatus(user.id, newStatus)
    } catch (err: any) {
      setMutateError(err?.message ?? 'Could not update status.')
    } finally {
      setMutating(null)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Users
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {usersTotal} total users
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl px-3"
          style={{ height: '40px', background: 'var(--bg-surface)', border: '1px solid var(--border)', minWidth: '220px' }}>
          <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: 'var(--text-primary)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ color: 'var(--text-muted)' }}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* Role filter */}
        <div className="flex items-center gap-1 p-1 rounded-xl flex-wrap"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          {ROLES.map(r => (
            <button
              key={r}
              onClick={() => { setRoleFilter(r); setPage(1) }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
              style={{
                background: roleFilter === r ? 'var(--text-primary)' : 'transparent',
                color:      roleFilter === r ? 'var(--bg)'           : 'var(--text-muted)',
              }}
            >
              {r === 'super_admin' ? 'Super Admin' : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Errors */}
      {(usersError || mutateError) && (
        <div className="rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(185,28,28,0.06)', color: 'var(--breaking)', border: '1px solid rgba(185,28,28,0.15)' }}>
          {usersError ?? mutateError}
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        {usersLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-center animate-pulse">
                <div className="skeleton w-9 h-9 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-3 w-32 rounded" />
                  <div className="skeleton h-3 w-48 rounded" />
                </div>
                <div className="skeleton w-20 h-6 rounded-lg" />
                <div className="skeleton w-24 h-6 rounded-lg" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                  {['User', 'Role', 'Status', 'Auth', 'Joined', 'Last login', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: 'var(--text-muted)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => {
                  const sc     = STATUS_CONFIG[user.status] ?? STATUS_CONFIG.active
                  const StatusIcon = sc.icon
                  const isMutating = mutating === user.id

                  return (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-[var(--bg-subtle)]"
                      style={{
                        borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none',
                        opacity:      isMutating ? 0.5 : 1,
                      }}
                    >
                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center
                                          text-xs font-bold flex-shrink-0 overflow-hidden"
                            style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                            {user.avatar_url
                              ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                              : user.full_name?.charAt(0)?.toUpperCase()
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[160px]"
                              style={{ color: 'var(--text-primary)' }}>
                              {user.full_name}
                            </p>
                            <p className="text-xs truncate max-w-[160px]"
                              style={{ color: 'var(--text-muted)' }}>
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role — inline select */}
                      <td className="px-4 py-3">
                        <RoleSelect
                          value={user.role}
                          onChange={role => handleRoleChange(user.id, role)}
                          disabled={isMutating}
                        />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap"
                          style={{ color: sc.color }}>
                          <StatusIcon size={12} />{sc.label}
                        </span>
                      </td>

                      {/* Auth provider */}
                      <td className="px-4 py-3 text-xs capitalize whitespace-nowrap"
                        style={{ color: 'var(--text-muted)' }}>
                        {user.auth_provider?.replace('_', ' ')}
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3 text-xs whitespace-nowrap"
                        style={{ color: 'var(--text-muted)' }}>
                        {new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </td>

                      {/* Last login */}
                      <td className="px-4 py-3 text-xs whitespace-nowrap"
                        style={{ color: 'var(--text-muted)' }}>
                        {user.last_login_at ? timeAgo(user.last_login_at) : 'Never'}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleStatusToggle(user)}
                          disabled={isMutating}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-opacity
                                     hover:opacity-80 disabled:opacity-40 whitespace-nowrap"
                          style={user.status === 'suspended'
                            ? { background: 'rgba(22,163,74,0.08)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.2)' }
                            : { background: 'rgba(185,28,28,0.06)', color: 'var(--breaking)', border: '1px solid rgba(185,28,28,0.15)' }
                          }
                        >
                          {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-40 hover:opacity-70"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-40 hover:opacity-70"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function RoleSelect({
  value, onChange, disabled,
}: {
  value:    string
  onChange: (role: string) => void
  disabled: boolean
}) {
  const config = ROLE_CONFIG[value] ?? ROLE_CONFIG.reader
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="appearance-none pl-2.5 pr-6 py-1 rounded-lg text-xs font-semibold
                   cursor-pointer outline-none border-0 disabled:cursor-not-allowed"
        style={{ background: config.bg, color: config.color }}
      >
        {['reader', 'author', 'editor', 'super_admin'].map(r => (
          <option key={r} value={r}>
            {r === 'super_admin' ? 'Super Admin' : r.charAt(0).toUpperCase() + r.slice(1)}
          </option>
        ))}
      </select>
      <ChevronDown size={10} className="absolute right-1.5 pointer-events-none"
        style={{ color: config.color }} />
    </div>
  )
}