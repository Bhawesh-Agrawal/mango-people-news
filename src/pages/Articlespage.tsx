/**
 * ArticlesPage.tsx — /articles  (also linked as "All News")
 * SEO: noIndex — this is a filterable archive, not a page
 * Google should index. Individual articles are indexed instead.
 */

import {
  useState, useEffect, useRef, useCallback,
} from 'react'
import { Link, useSearchParams }  from 'react-router-dom'
import { Clock, Eye, Search, X }  from 'lucide-react'
import { getArticles }            from '../api/articles'
import { getCategories }          from '../api/categories'
import type { Article, Category } from '../types'
import { formatCount }            from '../lib/utils'
import { SEED_ARTICLES }          from '../lib/seed'
import SEO                        from '../seo/Seo'

const LIMIT = 20

// ── Date grouping helpers ─────────────────────────────────────

function dateLabel(iso: string): string {
  const d     = new Date(iso)
  const today = new Date()
  const yest  = new Date(today); yest.setDate(yest.getDate() - 1)

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()

  if (sameDay(d, today)) return 'Today'
  if (sameDay(d, yest))  return 'Yesterday'

  const daysAgo = Math.floor((today.getTime() - d.getTime()) / 86_400_000)
  if (daysAgo < 7) {
    return d.toLocaleDateString('en-IN', { weekday: 'long' })
  }
  if (daysAgo < 30) {
    return `${Math.floor(daysAgo / 7)} week${Math.floor(daysAgo / 7) > 1 ? 's' : ''} ago`
  }
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

function groupByDate(articles: Article[]): Map<string, Article[]> {
  const groups = new Map<string, Article[]>()
  for (const a of articles) {
    const label = dateLabel(a.published_at)
    if (!groups.has(label)) groups.set(label, [])
    groups.get(label)!.push(a)
  }
  return groups
}

// ── Main component ────────────────────────────────────────────

export default function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [articles,    setArticles]    = useState<Article[]>([])
  const [categories,  setCategories]  = useState<Category[]>([])
  const [loading,     setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore,     setHasMore]     = useState(true)
  const [page,        setPage]        = useState(1)
  const [query,       setQuery]       = useState(searchParams.get('q') ?? '')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') ?? '')

  const sentinelRef = useRef<HTMLDivElement>(null)
  const isFetching  = useRef(false)

  useEffect(() => {
    getCategories()
      .then(res => setCategories(res.data ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const params: Record<string, string> = {}
    if (query)          params.q        = query
    if (activeCategory) params.category = activeCategory
    setSearchParams(params, { replace: true })
  }, [query, activeCategory])

  const load = useCallback(async (pg: number, append: boolean) => {
    if (isFetching.current) return
    isFetching.current = true

    if (pg === 1) setLoading(true)
    else          setLoadingMore(true)

    try {
      const res = await getArticles({
        page:     pg,
        limit:    LIMIT,
        search:   query   || undefined,
        category: activeCategory || undefined,
      })
      const incoming: Article[] = res.data ?? []

      if (incoming.length === 0 && pg === 1) {
        setArticles(SEED_ARTICLES.slice(0, 10))
        setHasMore(false)
      } else {
        setArticles(prev => append ? [...prev, ...incoming] : incoming)
        setHasMore(incoming.length === LIMIT)
        setPage(pg)
      }
    } catch {
      if (!append) setArticles(SEED_ARTICLES.slice(0, 10))
      setHasMore(false)
    } finally {
      setLoading(false)
      setLoadingMore(false)
      isFetching.current = false
    }
  }, [query, activeCategory])

  useEffect(() => {
    setArticles([])
    setPage(1)
    setHasMore(true)
    load(1, false)
  }, [query, activeCategory])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          load(page + 1, true)
        }
      },
      { rootMargin: '400px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, loading, page, load])

  const grouped = groupByDate(articles)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/*
        noIndex — filtered/paginated archive pages should not be
        indexed. Google finds articles via their individual URLs.
      */}
      <SEO
        title="All News"
        description="Browse every published article on Mango People News — India's financial and business news platform."
        path="/articles"
        noIndex={true}
      />

      <div className="page-container py-8">

        <div
          className="pb-5 mb-6"
          style={{ borderBottom: '3px solid var(--text-primary)' }}
        >
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <span
                className="text-xs font-bold uppercase tracking-widest block mb-1"
                style={{ color: 'var(--accent)' }}
              >
                Complete Archive
              </span>
              <h1
                className="font-display font-bold leading-none"
                style={{
                  fontSize:      'clamp(28px, 5vw, 42px)',
                  color:         'var(--text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                All News
              </h1>
            </div>

            <div
              className="flex items-center gap-2 rounded-xl px-4"
              style={{
                height:     '40px',
                background: 'var(--bg-surface)',
                border:     '1px solid var(--border)',
                minWidth:   '220px',
              }}
            >
              <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search all stories…"
                className="flex-1 text-sm outline-none bg-transparent"
                style={{ color: 'var(--text-primary)' }}
                autoComplete="off"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="transition-opacity hover:opacity-60 flex-shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-6">
            <button
              onClick={() => setActiveCategory('')}
              className="px-3 py-1.5 rounded-full text-xs font-semibold
                         transition-all duration-150"
              style={{
                background: !activeCategory ? 'var(--text-primary)' : 'var(--bg-surface)',
                color:      !activeCategory ? 'var(--bg)'           : 'var(--text-muted)',
                border:     `1px solid ${!activeCategory ? 'var(--text-primary)' : 'var(--border)'}`,
              }}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(
                  activeCategory === cat.slug ? '' : cat.slug
                )}
                className="px-3 py-1.5 rounded-full text-xs font-semibold
                           transition-all duration-150"
                style={{
                  background: activeCategory === cat.slug
                    ? (cat.color ?? 'var(--accent)') : 'var(--bg-surface)',
                  color: activeCategory === cat.slug
                    ? '#ffffff' : 'var(--text-muted)',
                  border: `1px solid ${
                    activeCategory === cat.slug
                      ? (cat.color ?? 'var(--accent)') : 'var(--border)'
                  }`,
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div>
            {[...Array(3)].map((_, gi) => (
              <div key={gi} className="mb-6">
                <div className="skeleton h-3 w-20 rounded mb-3" />
                {[...Array(4)].map((__, ri) => (
                  <div
                    key={ri}
                    className="flex gap-3 py-4 animate-pulse"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-3 w-16 rounded" />
                      <div className="skeleton h-4 w-full rounded" />
                      <div className="skeleton h-3 w-1/4 rounded" />
                    </div>
                    <div className="skeleton rounded-lg flex-shrink-0"
                      style={{ width: '72px', height: '54px' }} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <>
            {articles.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-4xl mb-4">📰</p>
                <p className="text-base font-semibold mb-1"
                  style={{ color: 'var(--text-primary)' }}>
                  No articles found
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Try different keywords or remove the category filter.
                </p>
              </div>
            ) : (
              <div>
                {Array.from(grouped.entries()).map(([label, group]) => (
                  <DateGroup key={label} label={label} articles={group} />
                ))}
              </div>
            )}

            <div ref={sentinelRef} className="h-1" />

            {loadingMore && (
              <div className="flex justify-center py-8">
                <div
                  className="animate-spin"
                  style={{
                    width:        '22px',
                    height:       '22px',
                    border:       '2px solid var(--border)',
                    borderTop:    '2px solid var(--accent)',
                    borderRadius: '50%',
                  }}
                />
              </div>
            )}

            {!hasMore && articles.length > 0 && (
              <div
                className="flex items-center gap-4 py-10"
                style={{ color: 'var(--text-muted)' }}
              >
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span className="text-xs uppercase tracking-widest font-semibold">
                  End of archive
                </span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}

// ── Date group section ────────────────────────────────────────

function DateGroup({ label, articles }: { label: string; articles: Article[] }) {
  return (
    <div className="mb-2">
      <div
        className="flex items-center gap-3 py-3 sticky top-[105px] z-10"
        style={{ background: 'var(--bg)' }}
      >
        <span
          className="text-xs font-bold uppercase tracking-widest flex-shrink-0"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>

      {articles.map(article => (
        <ArticleRow key={article.id} article={article} />
      ))}
    </div>
  )
}

// ── Article row ───────────────────────────────────────────────

function ArticleRow({ article }: { article: Article }) {
  const publishTime = new Date(article.published_at).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })

  return (
    <Link
      to={`/article/${article.slug}`}
      className="group flex items-start gap-4 py-4 -mx-4 px-4 rounded-xl
                 transition-colors hover:bg-[var(--bg-subtle)]"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {article.category_name && (
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: article.category_color ?? 'var(--accent)' }}
            >
              {article.category_name}
            </span>
          )}
          {article.is_breaking && (
            <span className="breaking-strip text-[9px]">● Breaking</span>
          )}
          {article.is_featured && (
            <span
              className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
            >
              Featured
            </span>
          )}
        </div>

        <h2
          className="text-sm font-semibold leading-snug mb-1.5 transition-colors
                     group-hover:text-[var(--accent)]"
          style={{ color: 'var(--text-primary)' }}
        >
          {article.title}
        </h2>

        {article.excerpt && (
          <p
            className="text-xs leading-relaxed line-clamp-1 mb-2 hidden sm:block"
            style={{ color: 'var(--text-muted)' }}
          >
            {article.excerpt}
          </p>
        )}

        <div
          className="flex items-center flex-wrap gap-x-3 gap-y-0.5 text-[11px]"
          style={{ color: 'var(--text-muted)' }}
        >
          {article.author_name && (
            <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
              {article.author_name}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {publishTime}
          </span>
          {article.reading_time && (
            <span>{article.reading_time} min read</span>
          )}
          {(article.view_count ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <Eye size={10} />{formatCount(article.view_count!)}
            </span>
          )}
        </div>
      </div>

      {article.cover_image && (
        <div
          className="flex-shrink-0 rounded-lg overflow-hidden"
          style={{ width: '72px', height: '54px' }}
        >
          <img
            src={article.cover_image}
            alt=""
            className="w-full h-full object-cover transition-transform
                       duration-300 group-hover:scale-105"
          />
        </div>
      )}
    </Link>
  )
}