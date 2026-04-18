/**
 * AdminLayout.tsx
 *
 * Persistent sidebar + topbar shell for all /admin/* pages.
 * Sidebar collapses to icon-only on tablet, hidden on mobile with a toggle.
 * Role-aware: super_admin sections are hidden from editors.
 */

import { useState, useEffect }           from 'react'
import { Link, useLocation, Outlet }     from 'react-router-dom'
import {
  LayoutDashboard, FileText, Users, Mail,
  Settings, ChevronLeft,
  ChevronRight, Menu, X, LogOut,
  Shield,
} from 'lucide-react'
import { useAuth }  from '../../context/AuthContext'
/* import { useTheme } from '../../context/ThemeContext' */
import { AdminProvider } from '../../context/AdminContext'

interface NavItem {
  to:       string
  icon:     React.ElementType
  label:    string
  minRole:  'editor' | 'super_admin'
  badge?:   number
}

const NAV_ITEMS: NavItem[] = [
  { to: '/admin/dashboard',   icon: LayoutDashboard, label: 'Dashboard',  minRole: 'editor'      },
  { to: '/admin/articles',    icon: FileText,        label: 'Articles',   minRole: 'editor'      },
  { to: '/admin/users',       icon: Users,           label: 'Users',      minRole: 'super_admin' },
  { to: '/admin/newsletter',  icon: Mail,            label: 'Newsletter', minRole: 'super_admin' },
  { to: '/admin/settings',    icon: Settings,        label: 'Settings',   minRole: 'super_admin' },
]

const ROLE_WEIGHT: Record<string, number> = {
  reader: 0, author: 1, editor: 2, super_admin: 3,
}

export default function AdminLayout() {
  const { user, logout } = useAuth()
  /* const { theme }        = useTheme() */
  const location         = useLocation()

  const [collapsed,   setCollapsed]   = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)

  // Close mobile sidebar on navigation
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const userWeight = ROLE_WEIGHT[user?.role ?? 'reader']

  const visibleItems = NAV_ITEMS.filter(
    item => userWeight >= ROLE_WEIGHT[item.minRole]
  )

  const isActive = (to: string) =>
    to === '/admin/dashboard'
      ? location.pathname === to
      : location.pathname.startsWith(to)

  return (
    <AdminProvider>
      <div
        className="flex min-h-screen"
        style={{ background: 'var(--bg)' }}
      >
        {/* ── Mobile backdrop ──────────────────────────────── */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* ── Sidebar ──────────────────────────────────────── */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 flex flex-col
            transition-all duration-300
            md:relative md:translate-x-0
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            ${collapsed   ? 'w-16'         : 'w-60'}
          `}
          style={{
            background:  'var(--bg-surface)',
            borderRight: '1px solid var(--border)',
          }}
        >
          {/* Logo / brand */}
          <div
            className="flex items-center gap-3 px-4 h-16 flex-shrink-0"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center
                         text-base flex-shrink-0"
              style={{ background: 'var(--accent-light)' }}
            >
              🌳
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-bold truncate"
                  style={{ color: 'var(--text-primary)' }}>
                  Admin
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--accent)' }}>
                  {user?.role === 'super_admin' ? 'Super Admin' : 'Editor'}
                </p>
              </div>
            )}
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
            {visibleItems.map(({ to, icon: Icon, label, minRole }) => {
              const active = isActive(to)
              const isSuperOnly = minRole === 'super_admin'

              return (
                <Link
                  key={to}
                  to={to}
                  title={collapsed ? label : undefined}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-all duration-150 group relative
                    ${collapsed ? 'justify-center' : ''}
                  `}
                  style={{
                    background: active ? 'var(--accent-light)' : 'transparent',
                    color:      active ? 'var(--accent)'       : 'var(--text-secondary)',
                  }}
                >
                  <Icon
                    size={18}
                    strokeWidth={active ? 2.2 : 1.8}
                    className="flex-shrink-0"
                  />
                  {!collapsed && (
                    <span className="text-sm font-medium truncate">{label}</span>
                  )}
                  {!collapsed && isSuperOnly && (
                    <Shield
                      size={10}
                      className="ml-auto flex-shrink-0 opacity-40"
                    />
                  )}

                  {/* Tooltip when collapsed */}
                  {collapsed && (
                    <span
                      className="absolute left-full ml-2 px-2 py-1 rounded-lg text-xs
                                 font-medium whitespace-nowrap opacity-0 pointer-events-none
                                 group-hover:opacity-100 transition-opacity z-50"
                      style={{
                        background: 'var(--text-primary)',
                        color:      'var(--bg)',
                      }}
                    >
                      {label}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User + collapse control */}
          <div
            className="flex-shrink-0 p-3 space-y-2"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            {/* User info */}
            {!collapsed && (
              <div className="flex items-center gap-2 px-2 py-2 rounded-xl"
                style={{ background: 'var(--bg-subtle)' }}>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center
                             text-xs font-bold flex-shrink-0 overflow-hidden"
                  style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                >
                  {user?.avatar_url
                    ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                    : user?.full_name?.charAt(0)?.toUpperCase()
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate"
                    style={{ color: 'var(--text-primary)' }}>
                    {user?.full_name}
                  </p>
                  <p className="text-[10px] truncate"
                    style={{ color: 'var(--text-muted)' }}>
                    {user?.email}
                  </p>
                </div>
              </div>
            )}

            {/* Collapse toggle (desktop only) */}
            <button
              onClick={() => setCollapsed(v => !v)}
              className="hidden md:flex w-full items-center justify-center gap-2
                         py-2 rounded-xl text-xs font-medium transition-colors
                         hover:bg-[var(--bg-subtle)]"
              style={{ color: 'var(--text-muted)' }}
            >
              {collapsed
                ? <ChevronRight size={16} />
                : <><ChevronLeft size={16} /><span>Collapse</span></>
              }
            </button>
          </div>
        </aside>

        {/* ── Main content area ─────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Topbar */}
          <header
            className="sticky top-0 z-30 flex items-center justify-between
                       px-4 sm:px-6 h-16 flex-shrink-0"
            style={{
              background:   'var(--bg-surface)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg transition-colors
                         hover:bg-[var(--bg-subtle)]"
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* Page title — inferred from path */}
            <h1
              className="text-base font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {visibleItems.find(i => isActive(i.to))?.label ?? 'Admin'}
            </h1>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <Link
                to="/"
                target="_blank"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5
                           rounded-lg text-xs font-medium transition-colors
                           hover:bg-[var(--bg-subtle)]"
                style={{ color: 'var(--text-muted)' }}
              >
                View site →
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                           text-xs font-medium transition-colors hover:opacity-80"
                style={{
                  background: 'rgba(185,28,28,0.06)',
                  color:      'var(--breaking)',
                  border:     '1px solid rgba(185,28,28,0.15)',
                }}
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminProvider>
  )
}