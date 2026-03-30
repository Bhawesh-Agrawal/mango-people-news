/**
 * SearchPage.tsx — /search?q=query
 *
 * URL-driven: reads ?q= and ?category= from the URL so the page is
 * shareable, bookmarkable, and works with the browser's back button.
 *
 * Features:
 *   - Debounced input (350ms) synced to URL via replace (no history spam)
 *   - Category filter chips
 *   - Infinite scroll with "Load more" button (pagination)
 *   - Empty state, loading skeleton, error state
 *   - Keyboard: Enter submits, Escape clears
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useSearchParams }                      from 'react-router-dom'
import { Search, X, Clock, Eye, SlidersHorizontal }   from 'lucide-react'
import { getArticles }                                from '../api/articles'
import { getCategories }                              from '../api/categories'
import type { Article, Category }                     from '../types'
import { timeAgo, formatCount }                       from '../lib/utils'

const LIMIT = 12

// ── Debounce hook ─────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)

  // Read initial values from URL
  const initialQ        = searchParams.get('q')        ?? ''
  const initialCategory = searchParams.get('category') ?? ''

  const [inputValue,      setInputValue]      = useState(initialQ)
  const [activeCategory,  setActiveCategory]  = useState(initialCategory)
  const [articles,        setArticles]        = useState<Article[]>([])
  const [categories,      setCategories]      = useState<Category[]>([])
  const [loading,         setLoading]         = useState(false)
  const [loadingMore,     setLoadingMore]     = useState(false)
  const [hasMore,         setHasMore]         = useState(false)
  const [page,            setPage]            = useState(1)
  const [totalCount,      setTotalCount]      = useState(0)
  const [error,           setError]           = useState('')
  const [hasSearched,     setHasSearched]     = useState(!!initialQ)

  const debouncedQuery = useDebounce(inputValue, 350)

  // ── Load categories once ──────────────────────────────────
  useEffect(() => {
    getCategories()
      .then(res => setCategories(res.data ?? []))
      .catch(() => {})
  }, [])

  // Focus input on mount
  useEffect(() => {
    if (!initialQ) inputRef.current?.focus()
  }, [])

  // ── Sync input → URL (replaces history so back works cleanly) ──
  useEffect(() => {
    const params: Record<string, string> = {}
    if (debouncedQuery)  params.q        = debouncedQuery
    if (activeCategory)  params.category = activeCategory
    setSearchParams(params, { replace: true })
  }, [debouncedQuery, activeCategory])

  // ── Fire search when URL params change ───────────────────
  const searchQuery    = searchParams.get('q')        ?? ''
  const searchCategory = searchParams.get('category') ?? ''

  const runSearch = useCallback(async (pg: number, append: boolean) => {
    if (!searchQuery && !searchCategory) {
      setArticles([])
      setHasSearched(false)
      return
    }

    if (pg === 1) setLoading(true)
    else setLoadingMore(true)
    setError('')

    try {
      const res = await getArticles({
        search:   searchQuery || undefined,
        category: searchCategory || undefined,
        page:     pg,
        limit:    LIMIT,
      })

      const incoming = res.data ?? []
      setArticles(prev => append ? [...prev, ...incoming] : incoming)
      setTotalCount(res.pagination.total ?? incoming.length)
      setHasMore((res.pagination.page ?? pg) < (res.pagination.totalPages ?? 1))
      setPage(pg)
      setHasSearched(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [searchQuery, searchCategory])

  // Re-run search when URL query/category changes
  useEffect(() => {
    runSearch(1, false)
  }, [searchQuery, searchCategory])

  const handleCategoryClick = (slug: string) => {
    setActiveCategory(prev => prev === slug ? '' : slug)
  }

  const clearSearch = () => {
    setInputValue('')
    setActiveCategory('')
    setArticles([])
    setHasSearched(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') clearSearch()
  }

  const isEmpty = hasSearched && articles.length === 0 && !loading

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="page-container py-8">

        {/* ── Search header ─────────────────────────────── */}
        <div className="mb-8">

          {/* Page title */}
          <h1
            className="text-2xl font-bold mb-6 tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Search
          </h1>

          {/* Search input */}
          <div
            className="flex items-center gap-3 rounded-2xl px-5"
            style={{
              height:     '56px',
              background: 'var(--bg-surface)',
              border:     '1px solid var(--border)',
              boxShadow:  '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            {loading
              ? <LoadingSpinner />
              : <Search size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            }
            <input
              ref={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search articles, topics, keywords…"
              className="flex-1 text-base outline-none bg-transparent"
              style={{ color: 'var(--text-primary)' }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {(inputValue || activeCategory) && (
              <button
                onClick={clearSearch}
                className="p-1.5 rounded-lg transition-opacity hover:opacity-60 flex-shrink-0"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Result count */}
          {hasSearched && !loading && (
            <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>
              {articles.length === 0
                ? 'No results'
                : <>
                    <strong style={{ color: 'var(--text-primary)' }}>{totalCount}</strong>
                    {' '}result{totalCount !== 1 ? 's' : ''}
                    {searchQuery && <> for <strong style={{ color: 'var(--text-primary)' }}>"{searchQuery}"</strong></>}
                  </>
              }
            </p>
          )}
        </div>

        {/* ── Category filter chips ────────────────────────── */}
        {categories.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <SlidersHorizontal size={14} style={{ color: 'var(--text-muted)' }} />
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Filter by category
              </span>
            </div>
            <div
              className="flex gap-2 flex-wrap"
              role="group"
              aria-label="Category filters"
            >
              {/* All chip */}
              <button
                onClick={() => setActiveCategory('')}
                className="px-4 py-2 rounded-full text-sm font-medium
                           transition-all duration-150"
                style={{
                  background: !activeCategory ? 'var(--text-primary)' : 'var(--bg-surface)',
                  color:      !activeCategory ? 'var(--bg)'           : 'var(--text-secondary)',
                  border:     `1px solid ${!activeCategory ? 'var(--text-primary)' : 'var(--border)'}`,
                }}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.slug)}
                  className="px-4 py-2 rounded-full text-sm font-medium
                             transition-all duration-150"
                  style={{
                    background: activeCategory === cat.slug
                      ? cat.color ?? 'var(--accent)'
                      : 'var(--bg-surface)',
                    color: activeCategory === cat.slug
                      ? '#ffffff'
                      : 'var(--text-secondary)',
                    border: `1px solid ${
                      activeCategory === cat.slug
                        ? cat.color ?? 'var(--accent)'
                        : 'var(--border)'
                    }`,
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Initial idle state ───────────────────────────── */}
        {!hasSearched && !loading && (
          <IdleState />
        )}

        {/* ── Loading skeleton — first page ────────────────── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* ── Error state ──────────────────────────────────── */}
        {error && (
          <div
            className="rounded-2xl px-6 py-5 text-sm"
            style={{
              background: 'rgba(185,28,28,0.06)',
              border:     '1px solid rgba(185,28,28,0.15)',
              color:      'var(--breaking)',
            }}
          >
            {error}
          </div>
        )}

        {/* ── Empty state ──────────────────────────────────── */}
        {isEmpty && <EmptyState query={searchQuery} />}

        {/* ── Results grid ─────────────────────────────────── */}
        {!loading && articles.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => runSearch(page + 1, true)}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl
                             text-sm font-semibold transition-opacity
                             disabled:opacity-50 hover:opacity-80"
                  style={{
                    background: 'var(--bg-surface)',
                    border:     '1px solid var(--border)',
                    color:      'var(--text-primary)',
                  }}
                >
                  {loadingMore ? (
                    <>
                      <LoadingSpinner size={14} />
                      Loading…
                    </>
                  ) : (
                    'Load more results'
                  )}
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}

// ── Article result card ───────────────────────────────────────

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      to={`/article/${article.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden
                 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: 'var(--bg-surface)',
        border:     '1px solid var(--border)',
        boxShadow:  '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      {/* Cover image */}
      {article.cover_image ? (
        <div
          className="overflow-hidden flex-shrink-0"
          style={{ aspectRatio: '16/9' }}
        >
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full h-full object-cover transition-transform
                       duration-300 group-hover:scale-[1.03]"
          />
        </div>
      ) : (
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{
            aspectRatio: '16/9',
            background:  'var(--bg-subtle)',
          }}
        >
          <span className="text-3xl opacity-20">📰</span>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Category */}
        {article.category_name && (
          <span
            className="text-[10px] font-bold uppercase tracking-wider mb-2 block"
            style={{ color: article.category_color ?? 'var(--accent)' }}
          >
            {article.category_name}
          </span>
        )}

        {/* Title */}
        <h2
          className="text-base font-semibold leading-snug line-clamp-2 mb-3
                     transition-colors group-hover:text-[var(--accent)]"
          style={{ color: 'var(--text-primary)' }}
        >
          {article.title}
        </h2>

        {/* Excerpt */}
        {article.excerpt && (
          <p
            className="text-sm leading-relaxed line-clamp-2 mb-4 flex-1"
            style={{ color: 'var(--text-muted)' }}
          >
            {article.excerpt}
          </p>
        )}

        {/* Meta row */}
        <div
          className="flex items-center gap-4 text-[11px] pt-3 mt-auto"
          style={{
            color:     'var(--text-muted)',
            borderTop: '1px solid var(--border)',
          }}
        >
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {timeAgo(article.published_at)}
          </span>
          {article.reading_time && (
            <span>{article.reading_time} min read</span>
          )}
          {article.view_count !== undefined && (
            <span className="flex items-center gap-1 ml-auto">
              <Eye size={11} />
              {formatCount(article.view_count)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

// ── Skeleton card ─────────────────────────────────────────────

function ArticleCardSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden animate-pulse"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
    >
      <div className="skeleton" style={{ aspectRatio: '16/9', width: '100%' }} />
      <div className="p-5 space-y-3">
        <div className="skeleton h-2.5 w-16 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded mt-4" />
      </div>
    </div>
  )
}

// ── Idle / empty / loading spinner ───────────────────────────

function IdleState() {
  const suggestions = ['Markets', 'RBI policy', 'Budget 2025', 'Sensex', 'Startups', 'IPO']

  return (
    <div className="py-8">
      <p
        className="text-xs font-semibold uppercase tracking-wider mb-4"
        style={{ color: 'var(--text-muted)' }}
      >
        Popular searches
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map(term => (
          <Link
            key={term}
            to={`/search?q=${encodeURIComponent(term)}`}
            className="px-4 py-2 rounded-full text-sm font-medium
                       transition-opacity hover:opacity-70"
            style={{
              background: 'var(--bg-surface)',
              color:      'var(--text-secondary)',
              border:     '1px solid var(--border)',
            }}
          >
            {term}
          </Link>
        ))}
      </div>
    </div>
  )
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="py-16 text-center">
      <p className="text-4xl mb-4">🔍</p>
      <h2
        className="text-xl font-semibold mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        No results found
      </h2>
      <p className="text-base max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
        {query
          ? <>Nothing matched <strong>"{query}"</strong>. Try broader keywords or check the spelling.</>
          : 'Select a category above to browse articles.'
        }
      </p>
    </div>
  )
}

function LoadingSpinner({ size = 18 }: { size?: number }) {
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