import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Clock, Eye } from 'lucide-react'
import { client } from '../api/client'
import { cloudinaryUrl, timeAgo, formatCount } from '../lib/utils'
import type { Article } from '../types'
import SEO from '../seo/Seo'

type Period = 'today' | 'week' | 'month' | 'all'

const PERIODS: { key: Period; label: string; days: number | null }[] = [
  { key: 'today', label: 'Today',      days: 1    },
  { key: 'week',  label: 'This Week',  days: 7    },
  { key: 'month', label: 'This Month', days: 30   },
  { key: 'all',   label: 'All Time',   days: 3650 },
]

// ── Skeleton ───────────────────────────────────────────────

function TrendingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-4 py-4" style={{ borderBottom: '1px solid var(--border-muted)' }}>
          <div className="skeleton w-8 h-8 rounded flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-5 w-full rounded" />
            <div className="skeleton h-5 w-3/4 rounded" />
            <div className="skeleton h-3 w-40 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Featured (rank #1) ─────────────────────────────────────

function FeaturedRow({ article, rank }: { article: Article; rank: number }) {
  return (
    <Link
      to={`/article/${article.slug}`}
      className="group flex flex-col md:flex-row gap-5 pb-6 mb-6"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      {/* Cover */}
      <div className="w-full md:w-72 flex-shrink-0 rounded-xl overflow-hidden">
        {article.cover_image ? (
          <img
            src={cloudinaryUrl(article.cover_image, 576, 324)}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ aspectRatio: '16/9' }}
            loading="eager"
            draggable={false}
          />
        ) : (
          <div
            className="w-full flex items-center justify-center text-xs font-bold"
            style={{ aspectRatio: '16/9', background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
          >
            No image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-3">
          <span className="font-display font-black text-2xl leading-none" style={{ color: 'var(--accent)' }}>
            #{rank}
          </span>
          {article.category_name && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded" style={{ background: article.category_color + '20', color: article.category_color }}>
              {article.category_name}
            </span>
          )}
        </div>

        <h2
          className="font-display font-bold leading-tight tracking-tight line-clamp-2 transition-colors duration-150 group-hover:text-[var(--accent)]"
          style={{
            fontSize: 'clamp(18px, 2.5vw, 28px)',
            color:    'var(--text-primary)',
          }}
        >
          {article.title}
        </h2>

        {article.excerpt && (
          <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
            {article.excerpt}
          </p>
        )}

        <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
            {article.author_name}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {timeAgo(article.published_at)}
          </span>
          <span>{article.reading_time} min read</span>
          {article.view_count > 0 && (
            <span className="flex items-center gap-1">
              <Eye size={10} />
              {formatCount(article.view_count)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

// ── Compact row (rank #2+) ─────────────────────────────────

function CompactRow({ article, rank }: { article: Article; rank: number }) {
  return (
    <Link
      to={`/article/${article.slug}`}
      className="group flex items-start gap-4 py-4 transition-colors hover:bg-[var(--bg-subtle)] px-3 -mx-3 rounded-xl"
      style={{ borderBottom: '1px solid var(--border-muted)' }}
    >
      <span
        className="font-display font-black text-xl leading-none flex-shrink-0 w-8 pt-0.5 select-none"
        style={{ color: rank <= 3 ? 'var(--accent)' : 'var(--border)' }}
      >
        {rank}
      </span>

      <div className="flex-1 min-w-0">
        {article.category_name && (
          <span className="cat-label text-[10px] block mb-0.5" style={{ color: article.category_color }}>
            {article.category_name}
          </span>
        )}
        <p
          className="text-sm font-bold leading-snug line-clamp-2 transition-colors duration-150 group-hover:text-[var(--accent)]"
          style={{ color: 'var(--text-primary)' }}
        >
          {article.title}
        </p>
        <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
            {article.author_name}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {timeAgo(article.published_at)}
          </span>
          <span>·</span>
          <span>{article.reading_time} min</span>
          {article.view_count > 0 && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Eye size={10} />
                {formatCount(article.view_count)}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}

// ── Main ───────────────────────────────────────────────────

export default function TrendingPage() {
  const [period, setPeriod] = useState<Period>('week')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  const { days } = PERIODS.find(p => p.key === period)!

  const handlePeriodChange = (key: Period) => {
    setLoading(true)
    setPeriod(key)
  }

  useEffect(() => {
    let cancelled = false

    client
      .get('/articles/trending', { params: { limit: 25, days } })
      .then(res => {
        if (cancelled) return

        // Strict client-side date filter
        const now = Date.now()
        const cutoff = days ? new Date(now - days * 86400000) : null

        const fetched: Article[] = res.data?.data ?? []
        const filtered = cutoff
          ? fetched.filter(a => new Date(a.published_at).getTime() >= cutoff.getTime())
          : fetched

        setArticles(filtered)
      })
      .catch(() => {
        if (!cancelled) setArticles([])
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [days])

  const top = articles[0] ?? null
  const rest = articles.slice(1)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <SEO title="Trending News" path="/trending" />
      <div className="page-container py-8">

        {/* ── Masthead ───────────────────────────────────────── */}
        <div
          className="pb-5 mb-6"
          style={{ borderBottom: '3px solid var(--text-primary)' }}
        >
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: 'var(--accent)' }}
                >
                  Most Read
                </span>
              </div>
              <h1
                className="font-display font-bold leading-none"
                style={{
                  fontSize:      'clamp(28px, 5vw, 42px)',
                  color:         'var(--text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                Trending Stories
              </h1>
            </div>

            {/* Period filter — tab-style, inline */}
            <div className="flex items-center gap-0" style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
              {PERIODS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handlePeriodChange(key)}
                  className="px-4 py-2 text-xs font-semibold transition-all duration-150"
                  style={{
                    background:  period === key ? 'var(--text-primary)' : 'transparent',
                    color:       period === key ? 'var(--bg)'           : 'var(--text-muted)',
                    borderRight: key !== 'all'  ? '1px solid var(--border)' : 'none',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────── */}
        {loading ? (
          <TrendingSkeleton />
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <TrendingUp size={32} style={{ color: 'var(--border)' }} />
            <p className="text-sm font-semibold mt-3" style={{ color: 'var(--text-muted)' }}>
              No trending stories for this period
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
              Try a different time range or check back later.
            </p>
          </div>
        ) : (
          <div>
            {top && (
              <FeaturedRow article={top} rank={1} />
            )}
            {rest.map((article, i) => (
              <CompactRow key={article.id} article={article} rank={i + 2} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
