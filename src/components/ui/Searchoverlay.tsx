/**
 * SearchOverlay.tsx — src/components/ui/Searchoverlay.tsx
 *
 * Mobile  (< 640px): bottom-sheet sliding up with blurred backdrop
 * Desktop (≥ 640px): command-palette dropping from top with blurred backdrop
 *
 * Props:
 *   open    — controlled by parent (Navbar's searchOpen state)
 *   onClose — called on Escape, backdrop click, or after navigation
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, TrendingUp, ArrowRight } from 'lucide-react'
import { getArticles } from '../../api/articles'
import type { Article } from '../../types'
import { timeAgo } from '../../lib/utils'

// ── Debounce hook ─────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

interface Props {
  open:    boolean
  onClose: () => void
}

// Popular search terms shown in the idle state
const POPULAR_TERMS = ['Markets', 'Budget', 'RBI', 'Sensex', 'Startups', 'IPO']

export default function SearchOverlay({ open, onClose }: Props) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  const [query,    setQuery]    = useState('')
  const [results,  setResults]  = useState<Article[]>([])
  const [loading,  setLoading]  = useState(false)
  const [searched, setSearched] = useState(false)

  const debouncedQuery = useDebounce(query.trim(), 350)

  // ── Open/close side-effects ───────────────────────────────
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      // Focus after animation starts
      requestAnimationFrame(() => setTimeout(() => inputRef.current?.focus(), 60))
    } else {
      document.body.style.overflow = ''
      // Reset state when overlay closes
      setQuery('')
      setResults([])
      setSearched(false)
      setLoading(false)
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // ── Escape key ────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // ── Debounced live search ─────────────────────────────────
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([])
      setSearched(false)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    getArticles({ search: debouncedQuery, limit: 6 })
      .then(res => {
        if (cancelled) return
        setResults(res.data ?? [])
        setSearched(true)
      })
      .catch(() => {
        if (cancelled) return
        setResults([])
        setSearched(true)
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [debouncedQuery])

  // ── Navigation helpers ────────────────────────────────────
  const goToArticle = useCallback((slug: string) => {
    onClose()
    navigate(`/article/${slug}`)
  }, [navigate, onClose])

  const goToSearch = useCallback((term?: string) => {
    const q = (term ?? query).trim()
    if (!q) return
    onClose()
    navigate(`/search?q=${encodeURIComponent(q)}`)
  }, [query, navigate, onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    goToSearch()
  }

  // Don't render anything when closed — keeps the DOM clean
  if (!open) return null

  return (
    <>
      {/* ── Backdrop — click to dismiss ─────────────────────── */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[200]"
        style={{
          background:           'rgba(0,0,0,0.5)',
          backdropFilter:       'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          animation:            'searchFadeIn 180ms ease both',
        }}
      />

      {/* ── Mobile: bottom-sheet ────────────────────────────── */}
      {/* Slides up from bottom. Matches the bottom-nav gestural language. */}
      <div
        className="sm:hidden fixed left-0 right-0 bottom-0 z-[201] flex flex-col"
        style={{
          background:   'var(--bg-surface)',
          borderRadius: '20px 20px 0 0',
          border:       '1px solid var(--border)',
          borderBottom: 'none',
          maxHeight:    '88vh',
          boxShadow:    '0 -8px 48px rgba(0,0,0,0.20)',
          animation:    'searchSlideUp 260ms cubic-bezier(0.32,0.72,0,1) both',
        }}
      >
        {/* Drag handle pill */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div
            className="rounded-full"
            style={{ width: '36px', height: '4px', background: 'var(--border)' }}
          />
        </div>

        {/* Search input */}
        <div className="px-4 pt-1 pb-3 flex-shrink-0">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3 rounded-2xl px-4"
            style={{
              height:     '52px',
              background: 'var(--bg)',
              border:     '1px solid var(--border)',
            }}
          >
            {loading
              ? <Spinner size={18} />
              : <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
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
                className="p-1 flex-shrink-0 transition-opacity hover:opacity-60"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Clear"
              >
                <X size={16} />
              </button>
            )}
          </form>
        </div>

        {/* Scrollable results area */}
        <div className="flex-1 overflow-y-auto px-4 pb-8" style={{ minHeight: 0 }}>
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

      {/* ── Desktop: command-palette modal ──────────────────── */}
      {/* Drops from top, centred. Hidden on mobile. */}
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
            animation:     'searchDropDown 200ms cubic-bezier(0.16,1,0.3,1) both',
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

      {/* Keyframe animations */}
      <style>{`
        @keyframes searchFadeIn {
          from { opacity: 0 }
          to   { opacity: 1 }
        }
        @keyframes searchSlideUp {
          from { transform: translateY(100%) }
          to   { transform: translateY(0)    }
        }
        @keyframes searchDropDown {
          from { opacity: 0; transform: translateY(-10px) scale(0.98) }
          to   { opacity: 1; transform: translateY(0)     scale(1)    }
        }
      `}</style>
    </>
  )
}

// ── Results panel ─────────────────────────────────────────────

function Results({
  query,
  debouncedQuery,
  results,
  loading,
  searched,
  onArticleClick,
  onTermClick,
  onViewAll,
  desktop = false,
}: {
  query:          string
  debouncedQuery: string
  results:        Article[]
  loading:        boolean
  searched:       boolean
  onArticleClick: (slug: string)  => void
  onTermClick:    (term: string)  => void
  onViewAll:      () => void
  desktop?:       boolean
}) {
  const pad = desktop ? 'p-3' : 'py-2'

  // Idle — nothing typed yet or less than 2 chars
  if (!query || query.trim().length < 2) {
    return (
      <div className={pad}>
        <SectionLabel>Popular searches</SectionLabel>
        {POPULAR_TERMS.map(term => (
          <button
            key={term}
            type="button"
            onClick={() => onTermClick(term)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                       text-left transition-colors hover:bg-[var(--bg-subtle)]"
          >
            <TrendingUp size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{term}</span>
          </button>
        ))}
      </div>
    )
  }

  // Loading skeleton
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
      <div className={`${pad} px-3 py-4`}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          No results for{' '}
          <strong style={{ color: 'var(--text-primary)' }}>"{debouncedQuery}"</strong>.
          {' '}Try different keywords.
        </p>
      </div>
    )
  }

  // Results list
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
          {/* Thumbnail */}
          <div
            className="flex-shrink-0 rounded-lg overflow-hidden"
            style={{ width: '56px', height: '44px', background: 'var(--bg-subtle)' }}
          >
            {article.cover_image && (
              <img src={article.cover_image} alt=""
                className="w-full h-full object-cover" />
            )}
          </div>

          {/* Text */}
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

      {/* View all */}
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

// ── Small helpers ─────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[10px] font-bold uppercase tracking-widest px-3 pb-1 pt-1"
      style={{ color: 'var(--text-muted)' }}
    >
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