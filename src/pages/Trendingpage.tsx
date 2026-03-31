/**
 * TrendingPage.tsx — /trending
 *
 * Editorial news trending — dense, information-rich, not card-grid YouTube style.
 * Layout: masthead → time filter → ranked article rows like a newspaper "Most Read" column.
 * Each row is a compact horizontal strip: rank number, category, headline, byline, stats.
 * Top story gets a feature treatment with image. Rest are pure text rows.
 *
 * Backend: GET /api/v1/articles/trending?limit=25&days=1|7|30
 */

import { useState, useEffect } from 'react'
import { Link }                 from 'react-router-dom'
import { TrendingUp, Eye, Heart, MessageCircle, Clock } from 'lucide-react'
import { client }               from '../api/client'
import type { Article }         from '../types'
import { timeAgo, formatCount } from '../lib/utils'
import { SEED_ARTICLES }        from '../lib/seed'

type Period = 'today' | 'week' | 'month' | 'all'

const PERIODS: { key: Period; label: string; days: number | null }[] = [
  { key: 'today', label: 'Today',      days: 1    },
  { key: 'week',  label: 'This Week',  days: 7    },
  { key: 'month', label: 'This Month', days: 30   },
  { key: 'all',   label: 'All Time',   days: 3650 },
]

export default function TrendingPage() {
  const [period,   setPeriod]   = useState<Period>('week')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading,  setLoading]  = useState(true)

  const { days } = PERIODS.find(p => p.key === period)!

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    client
      .get('/articles/trending', { params: { limit: 25, days } })
      .then(res => {
        if (cancelled) return
        const data: Article[] = res.data?.data ?? []
        setArticles(data.length > 0 ? data : SEED_ARTICLES.slice(0, 15))
      })
      .catch(() => {
        if (!cancelled) setArticles(SEED_ARTICLES.slice(0, 15))
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [days])

  const [lead, ...rest] = articles

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
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
                  onClick={() => setPeriod(key)}
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

        {/* ── Loading ────────────────────────────────────────── */}
        {loading && (
          <div className="space-y-0">
            {/* Lead skeleton */}
            <div
              className="flex gap-6 pb-6 mb-6 animate-pulse"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className="skeleton rounded-xl flex-shrink-0"
                style={{ width: '200px', height: '140px' }} />
              <div className="flex-1 space-y-3 py-2">
                <div className="skeleton h-3 w-20 rounded" />
                <div className="skeleton h-6 w-full rounded" />
                <div className="skeleton h-6 w-4/5 rounded" />
                <div className="skeleton h-3 w-1/3 rounded mt-4" />
              </div>
            </div>
            {/* Row skeletons */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 py-4 animate-pulse"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div className="skeleton w-6 h-4 rounded flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-16 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-3 w-1/4 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Content ────────────────────────────────────────── */}
        {!loading && articles.length > 0 && (
          <>
            {/* ── #1 Lead story — with image ─────────────────── */}
            {lead && (
              <Link
                to={`/article/${lead.slug}`}
                className="group flex gap-6 pb-6 mb-2"
                style={{ borderBottom: '2px solid var(--text-primary)' }}
              >
                {/* Image */}
                {lead.cover_image && (
                  <div
                    className="flex-shrink-0 rounded-xl overflow-hidden hidden sm:block"
                    style={{ width: '220px', height: '148px' }}
                  >
                    <img
                      src={lead.cover_image}
                      alt={lead.title}
                      className="w-full h-full object-cover transition-transform
                                 duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {/* Rank + category */}
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="font-display font-bold text-5xl leading-none
                                 select-none flex-shrink-0"
                      style={{ color: 'var(--accent)', opacity: 0.25 }}
                    >
                      1
                    </span>
                    {lead.category_name && (
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: lead.category_color ?? 'var(--accent)' }}
                      >
                        {lead.category_name}
                      </span>
                    )}
                    {lead.is_breaking && (
                      <span className="breaking-strip text-[9px]">● Breaking</span>
                    )}
                  </div>

                  {/* Headline */}
                  <h2
                    className="font-display font-bold leading-tight mb-3
                               transition-colors group-hover:text-[var(--accent)]"
                    style={{
                      fontSize:      'clamp(18px, 3vw, 24px)',
                      color:         'var(--text-primary)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {lead.title}
                  </h2>

                  {/* Excerpt */}
                  {lead.excerpt && (
                    <p
                      className="text-sm leading-relaxed line-clamp-2 mb-3"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {lead.excerpt}
                    </p>
                  )}

                  {/* Meta */}
                  <StatsRow article={lead} />
                </div>
              </Link>
            )}

            {/* ── #2–25 Ranked rows — dense text list ────────── */}
            <div>
              {rest.map((article, index) => (
                <RankedRow
                  key={article.id ?? index}
                  article={article}
                  rank={index + 2}
                />
              ))}
            </div>
          </>
        )}

        {/* ── Empty ──────────────────────────────────────────── */}
        {!loading && articles.length === 0 && (
          <p className="py-16 text-center text-sm"
            style={{ color: 'var(--text-muted)' }}>
            No trending stories yet. Check back soon.
          </p>
        )}

      </div>
    </div>
  )
}

// ── Ranked row — compact text strip ──────────────────────────

function RankedRow({ article, rank }: { article: Article; rank: number }) {
  // Visual weight changes: top 5 are heavier than the rest
  const isTop5 = rank <= 5

  return (
    <Link
      to={`/article/${article.slug}`}
      className="group flex items-start gap-4 py-4 transition-colors
                 hover:bg-[var(--bg-subtle)] -mx-4 px-4 rounded-xl"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      {/* Rank number */}
      <span
        className="font-display font-bold flex-shrink-0 mt-0.5 w-6 text-right"
        style={{
          fontSize: isTop5 ? '18px' : '14px',
          color:    isTop5 ? 'var(--accent)' : 'var(--text-muted)',
          opacity:  isTop5 ? 0.6 : 0.4,
          lineHeight: 1.2,
        }}
      >
        {rank}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Category + breaking */}
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
        </div>

        {/* Headline */}
        <h3
          className="leading-snug mb-1.5 transition-colors
                     group-hover:text-[var(--accent)]"
          style={{
            fontSize:   isTop5 ? '15px' : '14px',
            fontWeight: isTop5 ? 600 : 500,
            color:      'var(--text-primary)',
          }}
        >
          {article.title}
        </h3>

        {/* Stats + byline */}
        <StatsRow article={article} compact />
      </div>

      {/* Thumbnail — only shown for top 5, small */}
      {isTop5 && article.cover_image && (
        <div
          className="flex-shrink-0 rounded-lg overflow-hidden hidden sm:block"
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

// ── Shared stats row ──────────────────────────────────────────

function StatsRow({ article, compact = false }: { article: Article; compact?: boolean }) {
  const sz = compact ? 10 : 11

  return (
    <div
      className="flex items-center flex-wrap gap-x-3 gap-y-1"
      style={{ fontSize: `${sz}px`, color: 'var(--text-muted)' }}
    >
      {article.author_name && (
        <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
          {article.author_name}
        </span>
      )}
      <span className="flex items-center gap-1">
        <Clock size={sz} />
        {timeAgo(article.published_at)}
      </span>
      {(article.view_count ?? 0) > 0 && (
        <span className="flex items-center gap-1">
          <Eye size={sz} />{formatCount(article.view_count!)}
        </span>
      )}
      {(article.like_count ?? 0) > 0 && (
        <span className="flex items-center gap-1">
          <Heart size={sz} />{formatCount(article.like_count!)}
        </span>
      )}
      {(article.comment_count ?? 0) > 0 && (
        <span className="flex items-center gap-1">
          <MessageCircle size={sz} />{formatCount(article.comment_count!)}
        </span>
      )}
      {article.reading_time && (
        <span>{article.reading_time} min read</span>
      )}
    </div>
  )
}