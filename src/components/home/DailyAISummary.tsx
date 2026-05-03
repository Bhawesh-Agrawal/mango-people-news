import { Link } from 'react-router-dom'
import { Clock, Eye, Sparkles } from 'lucide-react'
import { useArticles } from '../../hooks/useArticles'
import { timeAgo, formatCount } from '../../lib/utils'
import type { Article } from '../../types'

function AISummaryItem({ article }: { article: Article }) {
  // Only show if article has AI summary and is from today or yesterday
  const publishedDate = new Date(article.published_at)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const isRecent = publishedDate >= yesterday.setHours(0, 0, 0, 0)

  if (!article.ai_summary || !isRecent) return null

  return (
    <div className="py-6" style={{ borderBottom: '1px solid var(--border-muted)' }}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div
            className="w-3 h-3 rounded-full mt-1"
            style={{ background: article.category_color }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-xs px-2 py-1 rounded-md font-medium uppercase tracking-wide"
              style={{
                background: article.category_color + '15',
                color: article.category_color,
              }}
            >
              {article.category_name}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {timeAgo(article.published_at)}
            </span>
          </div>

          <Link
            to={`/article/${article.slug}`}
            className="group block"
          >
            <h3
              className="font-bold text-lg leading-tight mb-3 transition-colors duration-150 group-hover:text-[var(--accent)]"
              style={{ color: 'var(--text-primary)' }}
            >
              {article.title}
            </h3>
          </Link>

          <div
            className="text-sm leading-relaxed mb-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            {article.ai_summary}
          </div>

          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>{article.reading_time} min read</span>
            {article.view_count > 100 && (
              <span className="flex items-center gap-1">
                <Eye size={10} />
                {formatCount(article.view_count)} views
              </span>
            )}
            <Link
              to={`/article/${article.slug}`}
              className="text-xs font-medium hover:opacity-70 transition-opacity ml-auto"
              style={{ color: 'var(--accent)' }}
            >
              Read full article →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function AISummarySkeleton() {
  return (
    <section className="page-container py-4 md:py-6">
      <div className="mb-8 pb-4" style={{ borderBottom: '1px solid var(--border-muted)' }}>
        <div className="skeleton h-6 w-48 rounded mb-2" />
        <div className="skeleton h-4 w-64 rounded" />
      </div>

      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="py-6" style={{ borderBottom: '1px solid var(--border-muted)' }}>
            <div className="flex items-start gap-4">
              <div className="skeleton w-3 h-3 rounded-full mt-1" />
              <div className="flex-1">
                <div className="skeleton h-4 w-20 rounded mb-3" />
                <div className="skeleton h-5 w-full rounded mb-2" />
                <div className="skeleton h-5 w-4/5 rounded mb-4" />
                <div className="skeleton h-3 w-32 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function DailyAISummary() {
  const { articles, loading } = useArticles({ limit: 20 }) // Get more articles to filter for recent ones with AI summaries

  if (loading) return <AISummarySkeleton />

  // Filter articles that have AI summaries and are from today or yesterday
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const aiSummaryArticles = articles.filter(article => {
    if (!article.ai_summary) return false

    const publishedDate = new Date(article.published_at)
    const todayStart = new Date(today)
    todayStart.setHours(0, 0, 0, 0)
    const yesterdayStart = new Date(yesterday)
    yesterdayStart.setHours(0, 0, 0, 0)

    return publishedDate >= yesterdayStart
  }).slice(0, 6) // Show up to 6 AI summaries

  if (aiSummaryArticles.length === 0) return null

  return (
    <section className="page-container py-4 md:py-6">
      {/* ── Subtle Heading ── */}
      <div
        className="mb-8 pb-4"
        style={{ borderBottom: '1px solid var(--border-muted)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} style={{ color: 'var(--text-muted)' }} />
          <h2
            className="font-display font-semibold uppercase tracking-wide"
            style={{
              fontSize: '18px',
              color:    'var(--text-secondary)',
            }}
          >
            Today's Key Stories
          </h2>
        </div>
        <p
          className="text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          AI-curated summaries of the day's most important news
        </p>
      </div>

      {/* ── AI Summary List ── */}
      <div className="space-y-0">
        {aiSummaryArticles.map(article => (
          <AISummaryItem key={article.id} article={article} />
        ))}
      </div>
    </section>
  )
}