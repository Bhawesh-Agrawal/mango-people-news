import { Link } from 'react-router-dom'
import { useArticles } from '../../hooks/useArticles'
import { timeAgo } from '../../lib/utils'
import type { Article } from '../../types'

function AISummaryItem({ article }: { article: Article }) {
  const publishedDate  = new Date(article.published_at)
  const yesterdayStart = new Date()
  yesterdayStart.setDate(yesterdayStart.getDate() - 1)
  yesterdayStart.setHours(0, 0, 0, 0)

  if (!article.ai_summary || publishedDate < yesterdayStart) return null

  return (
    <Link
      to={`/article/${article.slug}`}
      className="block group"
    >
      <div
        className="px-4 py-4 rounded-2xl transition-colors duration-150 active:scale-[0.99]"
        style={{
          background:   'var(--bg-surface)',
          border:       '1px solid var(--border-muted)',
          transition:   'background 150ms, transform 100ms',
        }}
      >
        {/* Category + time row */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span
            className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-md"
            style={{
              background: article.category_color + '18',
              color:      article.category_color,
            }}
          >
            {article.category_name}
          </span>
          <span
            className="text-[10px] tabular-nums flex-shrink-0"
            style={{ color: 'var(--text-muted)' }}
          >
            {timeAgo(article.published_at)}
          </span>
        </div>

        {/* Summary — strip any "Here is a summary..." style preamble */}
        <p
          className="text-[15px] leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          {article.ai_summary.replace(/^here is (a |an )?(ai[- ])?summary[^:]*:\s*/i, '')}
        </p>

        {/* Read more */}
        <div className="mt-3 flex items-center justify-between">
          <span
            className="text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            {article.reading_time} min read
          </span>
          <span
            className="text-xs font-semibold group-hover:opacity-70 transition-opacity"
            style={{ color: 'var(--accent)' }}
          >
            Read full article →
          </span>
        </div>
      </div>
    </Link>
  )
}

function AISummarySkeleton() {
  return (
    <section className="page-container py-4">
      <div className="mb-5">
        <div className="skeleton h-4 w-36 rounded mb-1.5" />
        <div className="skeleton h-3 w-52 rounded" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="px-4 py-4 rounded-2xl"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-muted)' }}
          >
            <div className="skeleton h-3 w-16 rounded mb-3" />
            <div className="skeleton h-4 w-full rounded mb-1.5" />
            <div className="skeleton h-4 w-5/6 rounded mb-1.5" />
            <div className="skeleton h-4 w-3/4 rounded" />
          </div>
        ))}
      </div>
    </section>
  )
}

export default function DailyAISummary() {
  const { articles, loading } = useArticles({ limit: 20 })

  if (loading) return <AISummarySkeleton />

  const yesterdayStart = new Date()
  yesterdayStart.setDate(yesterdayStart.getDate() - 1)
  yesterdayStart.setHours(0, 0, 0, 0)

  const aiSummaryArticles = articles
    .filter(a => a.ai_summary && new Date(a.published_at) >= yesterdayStart)
    .slice(0, 6)

  if (aiSummaryArticles.length === 0) return null

  return (
    <section className="page-container py-4 md:py-6">
      {/* Heading — no icon, subtle AI mention in subtext */}
      <div className="mb-4 md:mb-6">
        <h2
          className="font-display font-semibold uppercase tracking-wide mb-0.5"
          style={{ fontSize: '15px', color: 'var(--text-secondary)' }}
        >
          Today's Key Stories
        </h2>
        <p
          className="text-[11px]"
          style={{ color: 'var(--text-muted)' }}
        >
          AI-curated summaries
        </p>
      </div>

      {/* Card list — tighter on mobile */}
      <div className="space-y-3">
        {aiSummaryArticles.map(article => (
          <AISummaryItem key={article.id} article={article} />
        ))}
      </div>
    </section>
  )
}