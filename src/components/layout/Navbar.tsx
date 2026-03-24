import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Sun, Moon, Menu, X,
  Home, TrendingUp, Bookmark, BarChart2,
  ChevronRight, ChevronDown, Settings,
  Search, LogIn, UserPlus,
} from 'lucide-react'
import { useTheme }  from '../../context/ThemeContext'
import { useAuth }   from '../../context/AuthContext'
import { getCategories } from '../../api/categories'
import { getArticles }   from '../../api/articles'
import type { Category, Article, User } from '../../types'
import { SEED_CATEGORIES, SEED_ARTICLES } from '../../lib/seed'
import { timeAgo } from '../../lib/utils'

// ── Bottom nav items ──────────────────────────────────────────────
const BOTTOM_NAV = [
  { to: '/',                 icon: Home,       label: 'Home'     },
  { to: '/category/markets', icon: BarChart2,  label: 'Markets'  },
  { to: '/search',           icon: Search,     label: 'Search',  center: true },
  { to: '/trending',         icon: TrendingUp, label: 'Trending' },
  { to: '/saved',            icon: Bookmark,   label: 'Saved'    },
]

// ── Desktop user dropdown ─────────────────────────────────────────
function DesktopUserMenu({ user }: { user: User }) {
  const { logout } = useAuth()
  const navigate   = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    setOpen(false)
    navigate('/')
  }

  useEffect(() => {
    if (!open) return
    const handler = () => setOpen(false)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [open])

  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 h-9 px-3 rounded-lg
                   transition-all duration-200"
        style={{
          background: 'var(--bg-subtle)',
          border:     '1px solid var(--border)',
          color:      'var(--text-primary)',
        }}
      >
        {/* Avatar */}
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center
                     text-xs font-bold flex-shrink-0 overflow-hidden"
          style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
        >
          {user.avatar_url
            ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            : user.full_name.charAt(0).toUpperCase()
          }
        </div>
        <span className="text-sm font-semibold max-w-[100px] truncate">
          {user.full_name.split(' ')[0]}
        </span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          className={`flex-shrink-0 transition-transform duration-200
                      ${open ? 'rotate-180' : ''}`}
          style={{ color: 'var(--text-muted)' }}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-48 rounded-xl
                     overflow-hidden z-50"
          style={{
            background: 'var(--bg-surface)',
            border:     '1px solid var(--border)',
            boxShadow:  '0 8px 24px rgba(0,0,0,0.12)',
          }}
        >
          {/* User info */}
          <div
            className="px-4 py-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <p className="text-sm font-bold truncate"
              style={{ color: 'var(--text-primary)' }}>
              {user.full_name}
            </p>
            <p className="text-xs truncate mt-0.5"
              style={{ color: 'var(--text-muted)' }}>
              {user.email}
            </p>
          </div>

          {/* Links */}
          {[
            { to: '/account', label: 'My Account'    },
            { to: '/saved',   label: 'Saved Articles' },
          ].map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="flex items-center px-4 py-2.5 text-sm
                         transition-colors duration-150
                         hover:bg-[var(--bg-subtle)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              {item.label}
            </Link>
          ))}

          {/* Admin — editor+ only */}
          {(user.role === 'editor' || user.role === 'super_admin') && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center px-4 py-2.5 text-sm
                         transition-colors duration-150
                         hover:bg-[var(--bg-subtle)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              Admin Dashboard
            </Link>
          )}

          {/* Logout */}
          <div style={{ borderTop: '1px solid var(--border)' }}>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2.5 text-sm
                         transition-colors duration-150
                         hover:bg-[var(--bg-subtle)]"
              style={{ color: 'var(--breaking)' }}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Navbar ───────────────────────────────────────────────────
export default function Navbar() {
  const { theme, toggleTheme }  = useTheme()
  const { user, isLoggedIn, logout } = useAuth()
  const location                = useLocation()
  const navigate                = useNavigate()

  const [categories,   setCategories]   = useState<Category[]>([])
  const [menuArticles, setMenuArticles] = useState<Record<string, Article[]>>({})
  const [expanded,     setExpanded]     = useState<string | null>(null)
  const [scrolled,     setScrolled]     = useState(false)
  const [menuOpen,     setMenuOpen]     = useState(false)
  const [searchOpen,   setSearchOpen]   = useState(false)
  const [navVisible,   setNavVisible]   = useState(true)
  const [lastScrollY,  setLastScrollY]  = useState(0)
  const [query,        setQuery]        = useState('')

  // ── Fetch categories ──────────────────────────────────────────
  useEffect(() => {
    getCategories()
      .then(res => {
        if (res.data?.length > 0) setCategories(res.data)
        else setCategories(SEED_CATEGORIES)
      })
      .catch(() => setCategories(SEED_CATEGORIES))
  }, [])

  // ── Scroll detection ──────────────────────────────────────────
  useEffect(() => {
    const fn = () => {
      const current = window.scrollY
      setScrolled(current > 10)
      if (current > lastScrollY && current > 60) setNavVisible(false)
      else setNavVisible(true)
      setLastScrollY(current)
    }
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [lastScrollY])

  // ── Body scroll lock ──────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // ── Close on route change ─────────────────────────────────────
  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
    setExpanded(null)
  }, [location.pathname])

  // ── Lazy load articles per category ──────────────────────────
  const handleExpand = async (slug: string) => {
    if (expanded === slug) { setExpanded(null); return }
    setExpanded(slug)
    if (menuArticles[slug]) return
    try {
      const res = await getArticles({ category: slug, limit: 3 })
      const articles = res.data?.length > 0
        ? res.data
        : SEED_ARTICLES.filter(a => a.category_slug === slug).slice(0, 3)
      setMenuArticles(prev => ({ ...prev, [slug]: articles }))
    } catch {
      setMenuArticles(prev => ({
        ...prev,
        [slug]: SEED_ARTICLES.filter(a => a.category_slug === slug).slice(0, 3),
      }))
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim())
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`
  }

  const handleMobileLogout = async () => {
    await logout()
    setMenuOpen(false)
    navigate('/')
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
              {/* Search */}
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

              {/* Theme toggle */}
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

              {/* Auth — logged in or out */}
              {isLoggedIn && user ? (
                <DesktopUserMenu user={user} />
              ) : (
                <>
                  <Link to="/newsletter" className="btn-accent text-sm h-9 px-4">
                    Subscribe
                  </Link>
                  <Link to="/login" className="btn-ghost text-sm h-9 px-4">
                    Login
                  </Link>
                </>
              )}
            </div>

            {/* ── Mobile actions ── Theme + Hamburger only ── */}
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

          {/* Desktop category nav */}
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
                borderBottom: isActive('/') ? '2px solid var(--accent)' : '2px solid transparent',
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
                  color:        isActive(`/category/${cat.slug}`) ? cat.color : 'var(--text-secondary)',
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

        {/* Mobile category strip */}
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
                borderBottom: isActive('/') ? '2px solid var(--accent)' : '2px solid transparent',
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
                  color:        isActive(`/category/${cat.slug}`) ? cat.color : 'var(--text-secondary)',
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
          MOBILE FULL-SCREEN MENU
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

          {/* Auth block — top, always visible */}
          <div
            className="flex-shrink-0 px-4 py-4"
            style={{ borderBottom: '2px solid var(--border)' }}
          >
            {isLoggedIn && user ? (
              /* Logged in */
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center
                             justify-center flex-shrink-0 text-lg font-bold
                             overflow-hidden"
                  style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                >
                  {user.avatar_url
                    ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                    : user.full_name.charAt(0).toUpperCase()
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate"
                    style={{ color: 'var(--text-primary)' }}>
                    {user.full_name}
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
                  style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
                >
                  <Settings size={16} />
                </Link>
              </div>
            ) : (
              /* Logged out */
              <div className="space-y-2.5">
                <p className="text-xs font-semibold"
                  style={{ color: 'var(--text-muted)' }}>
                  Sign in to save articles, get personalised news and more.
                </p>
                <div className="flex gap-2.5 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2
                               py-2.5 rounded-xl text-sm font-bold btn-accent"
                  >
                    <LogIn size={15} /> Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2
                               py-2.5 rounded-xl text-sm font-bold btn-ghost"
                  >
                    <UserPlus size={15} /> Register
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Scrollable nav */}
          <div className="flex-1 overflow-y-auto overscroll-contain">

            <div className="px-4 pt-4 pb-2">
              <span
                className="text-[10px] font-black tracking-[0.22em] uppercase"
                style={{ color: 'var(--text-faint)' }}
              >
                Sections
              </span>
            </div>

            {/* Home */}
            <Link
              to="/"
              className="flex items-center justify-between px-4 py-3.5
                         transition-colors hover:bg-[var(--bg-subtle)] group"
              style={{ borderBottom: '1px solid var(--border-muted)' }}
            >
              <span
                className="font-display text-2xl font-bold tracking-tight
                           uppercase group-hover:text-[var(--accent)]
                           transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                Home
              </span>
              <ChevronRight size={15} style={{ color: 'var(--text-faint)' }} />
            </Link>

            {/* Category accordion */}
            {categories.map((cat, i) => (
              <div
                key={cat.id}
                style={{
                  borderBottom: i < categories.length - 1
                    ? '1px solid var(--border-muted)' : 'none',
                }}
              >
                <button
                  onClick={() => handleExpand(cat.slug)}
                  className="w-full flex items-center justify-between px-4
                             py-3.5 text-left transition-colors
                             hover:bg-[var(--bg-subtle)]"
                  aria-expanded={expanded === cat.slug}
                >
                  <span
                    className="font-display text-2xl font-bold tracking-tight
                               uppercase transition-colors"
                    style={{ color: expanded === cat.slug ? cat.color : 'var(--text-primary)' }}
                  >
                    {cat.name}
                  </span>
                  <ChevronDown
                    size={16}
                    className="flex-shrink-0 transition-transform duration-200"
                    style={{
                      color:     'var(--text-faint)',
                      transform: expanded === cat.slug ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>

                {expanded === cat.slug && (
                  <div
                    className="px-4 pb-3 animate-fade-in"
                    style={{ background: 'var(--bg-subtle)' }}
                  >
                    {/* Skeleton */}
                    {!menuArticles[cat.slug] && (
                      <div className="space-y-3 pt-3">
                        {[1, 2, 3].map(n => (
                          <div key={n} className="flex gap-3 items-start">
                            <div className="skeleton w-14 h-14 rounded-md flex-shrink-0" />
                            <div className="flex-1 space-y-2 pt-1">
                              <div className="skeleton h-3 w-full rounded" />
                              <div className="skeleton h-3 w-3/4 rounded" />
                              <div className="skeleton h-2.5 w-1/3 rounded" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Empty */}
                    {menuArticles[cat.slug]?.length === 0 && (
                      <p className="text-sm py-4 text-center"
                        style={{ color: 'var(--text-muted)' }}>
                        No articles yet.
                      </p>
                    )}

                    {/* Articles */}
                    {menuArticles[cat.slug]?.map((article, idx) => (
                      <Link
                        key={article.id}
                        to={`/article/${article.slug}`}
                        className="flex gap-3 py-3 group"
                        style={{
                          borderBottom: idx < menuArticles[cat.slug].length - 1
                            ? '1px solid var(--border-muted)' : 'none',
                        }}
                      >
                        {article.cover_image && (
                          <img
                            src={article.cover_image}
                            alt=""
                            className="w-14 h-14 object-cover rounded-md flex-shrink-0"
                            loading="lazy"
                          />
                        )}
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p
                            className="text-sm font-semibold leading-snug
                                       line-clamp-2 transition-colors
                                       group-hover:text-[var(--accent)]"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {article.title}
                          </p>
                          <p className="text-xs mt-1.5"
                            style={{ color: 'var(--text-muted)' }}>
                            {timeAgo(article.published_at)}
                            {article.reading_time && (
                              <span className="ml-2">· {article.reading_time} min read</span>
                            )}
                          </p>
                        </div>
                      </Link>
                    ))}

                    {menuArticles[cat.slug] && (
                      <Link
                        to={`/category/${cat.slug}`}
                        className="inline-flex items-center gap-1 mt-3
                                   text-xs font-bold tracking-wide uppercase
                                   hover:opacity-75 transition-opacity"
                        style={{ color: cat.color }}
                      >
                        See all {cat.name}
                        <ChevronRight size={11} />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* All News */}
            <Link
              to="/articles"
              className="flex items-center justify-between px-4 py-3.5
                         transition-colors hover:bg-[var(--bg-subtle)] group"
              style={{ borderTop: '2px solid var(--border)' }}
            >
              <span
                className="font-display text-2xl font-bold tracking-tight uppercase"
                style={{ color: 'var(--accent)' }}
              >
                All News
              </span>
              <ChevronRight size={15} style={{ color: 'var(--accent)' }} />
            </Link>

            {isLoggedIn && (
              <button
                onClick={handleMobileLogout}
                className="w-full flex items-center justify-between px-4 py-3.5
                          transition-colors hover:bg-[var(--bg-subtle)] group"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <span
                  className="font-display text-2xl font-bold tracking-tight uppercase"
                  style={{ color: 'var(--breaking)' }}
                >
                  Sign Out
                </span>
                <ChevronRight size={15} style={{ color: 'var(--breaking)' }} />
              </button>
            )}

            {/* Sign out — logged in only */}
            {isLoggedIn && (
              <div
                className="px-4 py-4"
                style={{ borderTop: '2px solid var(--border)' }}
              >
                <button
                  onClick={handleMobileLogout}
                  className="w-full py-3 rounded-xl text-sm font-bold
                             transition-colors hover:opacity-80"
                  style={{
                    background: 'var(--bg-subtle)',
                    color:      'var(--breaking)',
                    border:     '1px solid var(--border)',
                  }}
                >
                  Sign Out
                </button>
              </div>
            )}
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

      {!menuOpen && (
        <div className="md:hidden h-0" aria-hidden="true" />
      )}
    </>
  )
}