import { Link }        from 'react-router-dom'
import { useArticles } from '../hooks/useArticles'
import { timeAgo }     from '../lib/utils'
import type { Article } from '../types'

// Strip preamble AI often adds
function clean(summary: string) {
  return summary.replace(/^here is (a |an )?(ai[- ])?summary[^:]*:\s*/i, '')
}

// ── Single summary pill ───────────────────────────────────────────
function SummaryPill({ article }: { article: Article }) {
  return (
    <Link
      to={`/article/${article.slug}`}
      className="group flex flex-col gap-2"
    >
      {/* Category dot + name */}
      <div className="flex items-center gap-1.5">
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: article.category_color ?? 'var(--accent)' }}
        />
        <span
          className="text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: article.category_color ?? 'var(--accent)' }}
        >
          {article.category_name}
        </span>
        <span
          className="text-[10px] ml-auto"
          style={{ color: 'var(--text-muted)' }}
        >
          {timeAgo(article.published_at)}
        </span>
      </div>

      {/* Full summary */}
      <p
        className="text-sm leading-relaxed transition-colors duration-150
                   group-hover:text-[var(--accent)]"
        style={{ color: 'var(--text-secondary)' }}
      >
        {clean(article.ai_summary!)}
      </p>

      <span
        className="text-[11px] font-semibold mt-auto opacity-0 group-hover:opacity-100
                   transition-opacity"
        style={{ color: 'var(--accent)' }}
      >
        Read full article →
      </span>
    </Link>
  )
}

// ── Main ─────────────────────────────────────────────────────────
export default function AISummaryStrip() {
  const { articles, loading } = useArticles({ limit: 20 })

  if (loading) return null // silent — no skeleton for interstitials

  const yesterdayStart = new Date()
  yesterdayStart.setDate(yesterdayStart.getDate() - 1)
  yesterdayStart.setHours(0, 0, 0, 0)

  const summaries = articles
    .filter(a => a.ai_summary && new Date(a.published_at) >= yesterdayStart)
    .slice(0, 3)

  if (summaries.length === 0) return null

  return (
    <div
      className="w-full py-6 md:py-8"
      style={{ background: 'var(--bg-subtle, var(--bg-surface))' }}
    >
      <div className="page-container">

        {/* Label */}
        <div className="flex items-center gap-3 mb-5">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.15em]"
            style={{ color: 'var(--text-muted)' }}
          >
            In Brief
          </span>
          <div
            className="flex-1 h-px"
            style={{ background: 'var(--border-muted)' }}
          />
          <span
            className="text-[10px]"
            style={{ color: 'var(--text-muted)' }}
          >
            AI-curated
          </span>
        </div>

        {/* ── Mobile: stacked, divider between ── */}
        <div className="md:hidden space-y-5">
          {summaries.map((article, i) => (
            <div key={article.id}>
              <SummaryPill article={article} />
              {i < summaries.length - 1 && (
                <div
                  className="mt-5 h-px"
                  style={{ background: 'var(--border-muted)' }}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── Desktop: 3-col side by side with vertical dividers ── */}
        <div className="hidden md:grid md:grid-cols-3 md:gap-8">
          {summaries.map((article, i) => (
            <div
              key={article.id}
              className="relative"
              style={{
                paddingLeft:  i > 0 ? '32px' : undefined,
                borderLeft:   i > 0 ? '1px solid var(--border-muted)' : undefined,
              }}
            >
              <SummaryPill article={article} />
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}