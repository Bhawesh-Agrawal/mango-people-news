import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Sun, Moon, Menu, X,
  Home, TrendingUp, Bookmark, BarChart2, Settings,
  Search, LogIn, UserPlus,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { getCategories } from '../../api/categories'
import type { Category } from '../../types'
import { SEED_CATEGORIES } from '../../lib/seed'

const BOTTOM_NAV = [
  { to: '/',                 icon: Home,       label: 'Home'     },
  { to: '/category/markets', icon: BarChart2,  label: 'Markets'  },
  { to: '/search',           icon: Search,     label: 'Search',  center: true },
  { to: '/trending',         icon: TrendingUp, label: 'Trending' },
  { to: '/saved',            icon: Bookmark,   label: 'Saved'    },
]

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const location               = useLocation()

  const [categories, setCategories] = useState<Category[]>([])
  const [scrolled,   setScrolled]   = useState(false)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query,      setQuery]      = useState('')
  const [navVisible,    setNavVisible]    = useState(true)
  const [lastScrollY,   setLastScrollY]   = useState(0)

  const isLoggedIn = false
  const user       = { name: 'Bhawesh', avatar: null as string | null }

  useEffect(() => {
    getCategories()
      .then(res => {
        if (res.data && res.data.length > 0) setCategories(res.data)
        else setCategories(SEED_CATEGORIES)
      })
      .catch(() => setCategories(SEED_CATEGORIES))
  }, [])

  useEffect(() => {
    const fn = () => {
      const current = window.scrollY

      // Sticky header shadow
      setScrolled(current > 10)

      // Hide bottom nav on scroll down, show on scroll up
      // Only trigger after scrolling 60px to avoid jitter
      if (current > lastScrollY && current > 60) {
        setNavVisible(false)
      } else {
        setNavVisible(true)
      }
      setLastScrollY(current)
    }
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [lastScrollY])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim())
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`
  }

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <>
      {/* ══════════════════════════════════════════
          MAIN HEADER
      ══════════════════════════════════════════ */}
      <header
        className={`sticky top-0 z-50 transition-shadow duration-300
                   ${scrolled ? 'shadow-md' : ''}`}
        style={{
          background:   'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="page-container">

          {/* Logo + actions row */}
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 flex-shrink-0"
              aria-label="Mango People News"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center
                           text-xl flex-shrink-0 transition-transform
                           duration-200 hover:scale-105"
                style={{ background: 'var(--accent-light)' }}
              >
                🌳
              </div>
              <div className="leading-none select-none">
                <div
                  className="font-display text-xl font-black
                             tracking-tight leading-none"
                  style={{ color: 'var(--text-primary)' }}
                >
                  MANGO PEOPLE
                </div>
                <div
                  className="text-[9px] font-bold tracking-[0.16em]
                             uppercase mt-0.5"
                  style={{ color: 'var(--accent)' }}
                >
                  News for Every Indian
                </div>
              </div>
            </Link>

            {/* ── Desktop actions ───────────────── */}
            <div className="hidden md:flex items-center gap-2">
              <form onSubmit={handleSearch}>
                <div
                  className={`flex items-center gap-2 rounded-lg h-9
                              transition-all duration-300 overflow-hidden
                              ${searchOpen ? 'w-60 px-3' : 'w-9 justify-center'}`}
                  style={{
                    background: 'var(--bg-subtle)',
                    border:     '1px solid var(--border)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setSearchOpen(v => !v)}
                    className="flex-shrink-0 transition-colors
                               hover:text-[var(--accent)]"
                    style={{ color: 'var(--text-muted)' }}
                    aria-label="Search"
                  >
                    <Search size={15} />
                  </button>
                  {searchOpen && (
                    <input
                      autoFocus
                      type="text"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Search news, markets, companies…"
                      className="bg-transparent text-sm outline-none w-full"
                      style={{ color: 'var(--text-primary)' }}
                    />
                  )}
                </div>
              </form>

              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-lg flex items-center justify-center
                           transition-all duration-200"
                style={{
                  background: 'var(--bg-subtle)',
                  border:     '1px solid var(--border)',
                  color:      'var(--text-secondary)',
                }}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              </button>

              <Link to="/newsletter" className="btn-accent text-sm h-9 px-4">
                Subscribe
              </Link>
              <Link to="/login" className="btn-ghost text-sm h-9">
                Login
              </Link>
            </div>

            {/* ── Mobile actions ────────────────── */}
            <div className="flex md:hidden items-center gap-1.5">
              <button
                onClick={toggleTheme}
                className="w-9 h-9 flex items-center justify-center
                           rounded-lg transition-all duration-150"
                style={{
                  background: 'var(--bg-subtle)',
                  border:     '1px solid var(--border)',
                  color:      'var(--text-secondary)',
                }}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              <button
                onClick={() => setMenuOpen(v => !v)}
                className="w-9 h-9 flex items-center justify-center
                           rounded-lg transition-all duration-150"
                style={{
                  background: menuOpen ? 'var(--accent)' : 'var(--bg-subtle)',
                  border:     '1px solid var(--border)',
                  color:      menuOpen ? '#fff' : 'var(--text-secondary)',
                }}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {/* ── Desktop category nav ──────────────────── */}
          <nav
            className="hidden md:flex items-center overflow-x-auto scrollbar-none"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <Link
              to="/"
              className="flex-shrink-0 px-3 py-2.5 text-[11px] font-bold
                         tracking-widest uppercase transition-all duration-150"
              style={{
                color:        isActive('/') ? 'var(--accent)' : 'var(--text-secondary)',
                borderBottom: isActive('/')
                  ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              Home
            </Link>

            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="flex-shrink-0 px-3 py-2.5 text-[11px] font-bold
                           tracking-widest uppercase transition-all duration-150"
                style={{
                  color:        isActive(`/category/${cat.slug}`)
                    ? cat.color : 'var(--text-secondary)',
                  borderBottom: isActive(`/category/${cat.slug}`)
                    ? `2px solid ${cat.color}` : '2px solid transparent',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.color             = cat.color
                  el.style.borderBottomColor = cat.color
                }}
                onMouseLeave={e => {
                  if (isActive(`/category/${cat.slug}`)) return
                  const el = e.currentTarget as HTMLElement
                  el.style.color             = 'var(--text-secondary)'
                  el.style.borderBottomColor = 'transparent'
                }}
              >
                {cat.name}
              </Link>
            ))}

            <Link
              to="/articles"
              className="ml-auto flex-shrink-0 px-3 py-2.5 text-[11px]
                         font-bold tracking-widest uppercase
                         hover:opacity-75 transition-opacity"
              style={{ color: 'var(--accent)' }}
            >
              All News →
            </Link>
          </nav>
        </div>

        {/* ── Mobile category strip — below navbar ──── */}
        <div
          className="md:hidden overflow-x-auto scrollbar-none"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div className="flex items-center px-4 gap-1 py-0">
            <Link
              to="/"
              className="flex-shrink-0 px-3 py-2.5 text-[11px] font-bold
                         tracking-widest uppercase transition-all duration-150
                         whitespace-nowrap"
              style={{
                color:        isActive('/') ? 'var(--accent)' : 'var(--text-secondary)',
                borderBottom: isActive('/')
                  ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              Home
            </Link>

            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="flex-shrink-0 px-3 py-2.5 text-[11px] font-bold
                           tracking-widest uppercase transition-all duration-150
                           whitespace-nowrap"
                style={{
                  color:        isActive(`/category/${cat.slug}`)
                    ? cat.color : 'var(--text-secondary)',
                  borderBottom: isActive(`/category/${cat.slug}`)
                    ? `2px solid ${cat.color}` : '2px solid transparent',
                }}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          MOBILE FULL-SCREEN MENU — simplified
      ══════════════════════════════════════════ */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex flex-col animate-fade-in"
          style={{ background: 'var(--bg-surface)' }}
          role="dialog"
          aria-modal="true"
        >
          {/* Menu top bar */}
          <div
            className="flex items-center justify-between px-4 h-16 flex-shrink-0"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <span
              className="text-xs font-black tracking-[0.22em] uppercase"
              style={{ color: 'var(--text-muted)' }}
            >
              Menu
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-lg"
              style={{
                background: 'var(--bg-subtle)',
                border:     '1px solid var(--border)',
                color:      'var(--text-secondary)',
              }}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Auth block */}
          <div className="flex-1 flex flex-col justify-between px-4 py-6">
            <div>
              {isLoggedIn ? (
                /* Logged in */
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-12 h-12 rounded-full flex items-center
                               justify-center text-lg font-bold flex-shrink-0"
                    style={{
                      background: 'var(--accent-light)',
                      color:      'var(--accent)',
                    }}
                  >
                    {user.avatar
                      ? <img
                          src={user.avatar}
                          className="w-full h-full rounded-full object-cover"
                          alt=""
                        />
                      : user.name.charAt(0).toUpperCase()
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-base font-bold truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {user.name}
                    </p>
                    <Link
                      to="/account"
                      className="text-xs font-semibold"
                      style={{ color: 'var(--accent)' }}
                      onClick={() => setMenuOpen(false)}
                    >
                      View profile →
                    </Link>
                  </div>
                  <Link
                    to="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg"
                    style={{
                      background: 'var(--bg-subtle)',
                      border:     '1px solid var(--border)',
                      color:      'var(--text-secondary)',
                    }}
                  >
                    <Settings size={16} />
                  </Link>
                </div>
              ) : (
                /* Logged out */
                <div className="space-y-3 mb-6">
                  <p
                    className="text-sm"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Sign in to save articles and get personalised news.
                  </p>
                  <div className="flex gap-2.5">
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex-1 flex items-center justify-center gap-2
                                 py-3 rounded-xl text-sm font-bold btn-accent"
                    >
                      <LogIn size={15} />
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      className="flex-1 flex items-center justify-center gap-2
                                 py-3 rounded-xl text-sm font-bold btn-ghost"
                    >
                      <UserPlus size={15} />
                      Register
                    </Link>
                  </div>
                </div>
              )}

              {/* Divider */}
              <div
                className="mb-6"
                style={{ borderTop: '1px solid var(--border)' }}
              />

              {/* Newsletter subscribe */}
              <div
                className="rounded-2xl p-4 space-y-3"
                style={{
                  background: 'var(--accent-light)',
                  border:     '1px solid var(--border)',
                }}
              >
                <div>
                  <p
                    className="font-display text-lg font-bold tracking-tight uppercase"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Stay Informed
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Get top Indian business & market news in your inbox daily.
                  </p>
                </div>
                <Link
                  to="/newsletter"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2
                             w-full py-2.5 rounded-xl text-sm font-bold
                             btn-accent"
                >
                  Subscribe to Newsletter
                </Link>
              </div>
            </div>

            {/* App version at bottom */}
            <p
              className="text-center text-[10px] mt-6"
              style={{ color: 'var(--text-faint)' }}
            >
              Mango People News · News for Every Indian
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          BOTTOM FLOATING NAV
      ══════════════════════════════════════════ */}
      <nav
        className={`
          md:hidden fixed bottom-4 left-1/2 -translate-x-1/2
          z-50 flex items-center rounded-2xl px-1.5 py-1.5
          transition-all duration-300
          ${menuOpen || !navVisible
            ? 'opacity-0 pointer-events-none translate-y-4'
            : 'opacity-100 pointer-events-auto translate-y-0'
          }
        `}
        style={{
          background:           theme === 'dark'
            ? 'rgba(22,27,34,0.96)' : 'rgba(255,255,255,0.96)',
          backdropFilter:       'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border:               '1px solid var(--border)',
          minWidth:             '300px',
          boxShadow:            '0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        }}
        aria-label="Main navigation"
        aria-hidden={menuOpen}
      >
        {BOTTOM_NAV.map(({ to, icon: Icon, label, center }) => {
          const active = to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(to)

          if (center) {
            return (
              <Link
                key={to}
                to={to}
                className="flex items-center justify-center mx-1.5
                           rounded-xl transition-all duration-200 active:scale-90"
                style={{
                  width:      '48px',
                  height:     '44px',
                  background: 'var(--accent)',
                  color:      '#fff',
                  flexShrink: 0,
                  boxShadow:  '0 2px 12px rgba(232,160,32,0.35)',
                }}
                aria-label={label}
              >
                <Icon size={20} strokeWidth={2.2} />
              </Link>
            )
          }

          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center justify-center flex-1
                         py-1.5 px-1 rounded-xl transition-all duration-200
                         gap-0.5 min-w-[52px] active:scale-90"
              style={{
                background: active ? 'var(--accent-light)' : 'transparent',
                color:      active ? 'var(--accent)'       : 'var(--text-muted)',
              }}
              aria-label={label}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span
                className="text-[9px] font-bold tracking-wide leading-none"
                style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Spacer */}
      {!menuOpen && (
        <div className="md:hidden h-6" aria-hidden="true" />
      )}
    </>
  )
}