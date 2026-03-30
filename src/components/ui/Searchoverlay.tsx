/**
 * SearchOverlay.tsx — src/components/ui/Searchoverlay.tsx
 *
 * Mobile  (< 640px): TOP-sheet anchored at top-0, slides DOWN from the
 *                    header. Input stays at the top so the keyboard opening
 *                    from the bottom NEVER covers the input or results.
 *
 * Desktop (≥ 640px): command-palette centred, drops from top with blur.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, TrendingUp, ArrowRight } from 'lucide-react'
import { getArticles } from '../../api/articles'
import type { Article } from '../../types'
import { timeAgo } from '../../lib/utils'

function useDebounce<T>(value: T, delay: number): T {
  const [dv, setDv] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return dv
}

interface Props {
  open:    boolean
  onClose: () => void
}

const POPULAR = ['Markets', 'Budget', 'RBI', 'Sensex', 'Startups', 'IPO']

export default function SearchOverlay({ open, onClose }: Props) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  const [query,    setQuery]    = useState('')
  const [results,  setResults]  = useState<Article[]>([])
  const [loading,  setLoading]  = useState(false)
  const [searched, setSearched] = useState(false)

  const debouncedQuery = useDebounce(query.trim(), 350)

  // ── Open / close ──────────────────────────────────────────
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      // Slight delay so the slide-down animation is visible before keyboard opens
      requestAnimationFrame(() => setTimeout(() => inputRef.current?.focus(), 80))
    } else {
      document.body.style.overflow = ''
      setQuery('')
      setResults([])
      setSearched(false)
      setLoading(false)
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // ── Escape ────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  // ── Live search ───────────────────────────────────────────
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]); setSearched(false); setLoading(false); return
    }
    let cancelled = false
    setLoading(true)
    getArticles({ search: debouncedQuery, limit: 6 })
      .then(res => { if (!cancelled) { setResults(res.data ?? []); setSearched(true) } })
      .catch(()  => { if (!cancelled) { setResults([]);            setSearched(true) } })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [debouncedQuery])

  // ── Navigation ────────────────────────────────────────────
  const goToArticle = useCallback((slug: string) => {
    onClose(); navigate(`/article/${slug}`)
  }, [navigate, onClose])

  const goToSearch = useCallback((term?: string) => {
    const q = (term ?? query).trim()
    if (!q) return
    onClose(); navigate(`/search?q=${encodeURIComponent(q)}`)
  }, [query, navigate, onClose])

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); goToSearch() }

  if (!open) return null

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────── */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[200]"
        style={{
          background:           'rgba(0,0,0,0.5)',
          backdropFilter:       'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          animation:            'srchFade 180ms ease both',
        }}
      />

      {/* ══════════════════════════════════════════════════════
          MOBILE — top-sheet (anchored top-0)
          Slides DOWN from beneath the sticky navbar.
          Input at top → keyboard opens from bottom → no conflict.
      ══════════════════════════════════════════════════════ */}
      <div
        className="sm:hidden fixed left-0 right-0 top-0 z-[201] flex flex-col"
        style={{
          // Full screen height minus a comfortable gap at the bottom
          // so the user can see/tap the backdrop to dismiss
          height:     '100dvh',
          maxHeight:  '100dvh',
          background: 'var(--bg-surface)',
          // Rounded bottom corners only — top is flush with the screen edge
          borderRadius: '0 0 24px 24px',
          borderBottom: '1px solid var(--border)',
          boxShadow:    '0 8px 48px rgba(0,0,0,0.22)',
          animation:    'srchSlideDown 260ms cubic-bezier(0.16, 1, 0.3, 1) both',
          // Stay above the sticky header
          paddingTop:   'env(safe-area-inset-top, 0px)',
        }}
      >
        {/* ── Top bar: back button + input ──────────────── */}
        <div
          className="flex items-center gap-3 px-4 flex-shrink-0"
          style={{
            height:      '64px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {/* Back / close button */}
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center
                       rounded-xl transition-colors hover:bg-[var(--bg-subtle)]"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Close search"
          >
            <X size={20} />
          </button>

          {/* Search form */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 flex items-center gap-3 rounded-2xl px-4"
            style={{
              height:     '44px',
              background: 'var(--bg)',
              border:     '1px solid var(--border)',
            }}
          >
            {loading
              ? <Spinner size={16} />
              : <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            }
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search news, topics, markets…"
              className="flex-1 text-base outline-none bg-transparent"
              style={{ color: 'var(--text-primary)' }}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              enterKeyHint="search"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); inputRef.current?.focus() }}
                className="flex-shrink-0 p-0.5 transition-opacity hover:opacity-60"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Clear"
              >
                <X size={15} />
              </button>
            )}
          </form>
        </div>

        {/* ── Scrollable results — fills remaining space ─── */}
        {/* Results are BELOW the input. Keyboard opens from the
            bottom but input is already at the top so nothing hides. */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain px-4 pb-8"
          style={{ minHeight: 0 }}
        >
          <Results
            query={query}
            debouncedQuery={debouncedQuery}
            results={results}
            loading={loading}
            searched={searched}
            onArticleClick={goToArticle}
            onTermClick={goToSearch}
            onViewAll={() => goToSearch()}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          DESKTOP — command-palette (drops from top, centred)
      ══════════════════════════════════════════════════════ */}
      <div
        className="hidden sm:flex fixed inset-0 z-[201] items-start
                   justify-center pt-[8vh] px-4"
        style={{ pointerEvents: 'none' }}
      >
        <div
          style={{
            width:         '100%',
            maxWidth:      '640px',
            background:    'var(--bg-surface)',
            border:        '1px solid var(--border)',
            borderRadius:  '16px',
            boxShadow:     '0 24px 80px rgba(0,0,0,0.22)',
            animation:     'srchDropDown 200ms cubic-bezier(0.16,1,0.3,1) both',
            pointerEvents: 'auto',
            overflow:      'hidden',
          }}
        >
          {/* Input row */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3 px-5"
            style={{ height: '60px', borderBottom: '1px solid var(--border)' }}
          >
            {loading
              ? <Spinner size={18} />
              : <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            }
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search articles, topics, keywords…"
              className="flex-1 text-base outline-none bg-transparent"
              style={{ color: 'var(--text-primary)' }}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            {query ? (
              <button
                type="button"
                onClick={() => { setQuery(''); inputRef.current?.focus() }}
                className="p-1.5 rounded-lg transition-opacity hover:opacity-60 flex-shrink-0"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Clear"
              >
                <X size={16} />
              </button>
            ) : (
              <kbd
                className="flex items-center px-2 py-1 rounded text-xs flex-shrink-0"
                style={{
                  background: 'var(--bg-subtle)',
                  color:      'var(--text-muted)',
                  border:     '1px solid var(--border)',
                }}
              >
                Esc
              </kbd>
            )}
          </form>

          {/* Results */}
          <div style={{ maxHeight: '440px', overflowY: 'auto' }}>
            <Results
              query={query}
              debouncedQuery={debouncedQuery}
              results={results}
              loading={loading}
              searched={searched}
              onArticleClick={goToArticle}
              onTermClick={goToSearch}
              onViewAll={() => goToSearch()}
              desktop
            />
          </div>
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes srchFade {
          from { opacity: 0 }
          to   { opacity: 1 }
        }
        @keyframes srchSlideDown {
          from { opacity: 0.4; transform: translateY(-100%) }
          to   { opacity: 1;   transform: translateY(0)     }
        }
        @keyframes srchDropDown {
          from { opacity: 0; transform: translateY(-10px) scale(0.98) }
          to   { opacity: 1; transform: translateY(0)     scale(1)    }
        }
      `}</style>
    </>
  )
}

// ── Results panel (shared mobile + desktop) ───────────────────

function Results({
  query, debouncedQuery, results, loading, searched,
  onArticleClick, onTermClick, onViewAll, desktop = false,
}: {
  query:          string
  debouncedQuery: string
  results:        Article[]
  loading:        boolean
  searched:       boolean
  onArticleClick: (slug: string) => void
  onTermClick:    (term: string) => void
  onViewAll:      () => void
  desktop?:       boolean
}) {
  const pad = desktop ? 'p-3' : 'py-3'

  // Idle
  if (!query || query.trim().length < 2) {
    return (
      <div className={pad}>
        <SectionLabel>Popular searches</SectionLabel>
        {POPULAR.map(term => (
          <button
            key={term}
            type="button"
            onClick={() => onTermClick(term)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl
                       text-left transition-colors hover:bg-[var(--bg-subtle)]"
          >
            <TrendingUp size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{term}</span>
          </button>
        ))}
      </div>
    )
  }

  // Loading
  if (loading) {
    return (
      <div className={`${pad} space-y-1`}>
        <SectionLabel>Searching…</SectionLabel>
        {[1, 2, 3].map(n => (
          <div key={n} className="flex gap-3 px-3 py-3 animate-pulse">
            <div className="skeleton rounded-lg flex-shrink-0"
              style={{ width: '56px', height: '44px' }} />
            <div className="flex-1 space-y-2 py-1">
              <div className="skeleton h-3 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // No results
  if (searched && results.length === 0) {
    return (
      <div className={`${pad} px-3 py-5`}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          No results for{' '}
          <strong style={{ color: 'var(--text-primary)' }}>"{debouncedQuery}"</strong>.
          {' '}Try different keywords.
        </p>
      </div>
    )
  }

  if (results.length === 0) return null

  return (
    <div className={pad}>
      <SectionLabel>Results</SectionLabel>

      {results.map(article => (
        <button
          key={article.id}
          type="button"
          onClick={() => onArticleClick(article.slug)}
          className="w-full flex items-start gap-3 px-3 py-3 rounded-xl
                     text-left transition-colors hover:bg-[var(--bg-subtle)]"
        >
          <div
            className="flex-shrink-0 rounded-lg overflow-hidden"
            style={{ width: '56px', height: '44px', background: 'var(--bg-subtle)' }}
          >
            {article.cover_image && (
              <img src={article.cover_image} alt=""
                className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {article.category_name && (
              <span
                className="text-[10px] font-bold uppercase tracking-wider block mb-0.5"
                style={{ color: article.category_color ?? 'var(--accent)' }}
              >
                {article.category_name}
              </span>
            )}
            <p
              className="text-sm font-medium leading-snug line-clamp-2"
              style={{ color: 'var(--text-primary)' }}
            >
              {article.title}
            </p>
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
              {timeAgo(article.published_at)}
            </p>
          </div>
        </button>
      ))}

      <button
        type="button"
        onClick={onViewAll}
        className="w-full flex items-center justify-between px-3 py-3 mt-1
                   rounded-xl transition-colors hover:bg-[var(--bg-subtle)]"
      >
        <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
          See all results for "{debouncedQuery}"
        </span>
        <ArrowRight size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
      </button>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest px-3 pb-1 pt-2"
      style={{ color: 'var(--text-muted)' }}>
      {children}
    </p>
  )
}

function Spinner({ size = 18 }: { size?: number }) {
  return (
    <div
      className="animate-spin flex-shrink-0"
      style={{
        width:        `${size}px`,
        height:       `${size}px`,
        border:       '2px solid var(--border)',
        borderTop:    '2px solid var(--accent)',
        borderRadius: '50%',
      }}
    />
  )
}