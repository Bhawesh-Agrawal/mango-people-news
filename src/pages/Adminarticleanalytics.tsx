import { useEffect, useState }         from 'react'
import { useParams, Link }             from 'react-router-dom'
import {
  ArrowLeft, Eye, Heart, MessageCircle,
  ExternalLink, Globe,
  TrendingUp, Calendar,
} from 'lucide-react'
import { useAdmin }         from '../context/AdminContext'
import { formatCount }      from '../lib/utils'

type Period = '7' | '30' | '90'

const PERIODS: { key: Period; label: string }[] = [
  { key: '7',  label: 'Last 7 days'  },
  { key: '30', label: 'Last 30 days' },
  { key: '90', label: 'Last 90 days' },
]

export default function AdminArticleAnalytics() {
  const { id }            = useParams<{ id: string }>()
  const { fetchAnalytics, analyticsCache, articles } = useAdmin()

  const [period,  setPeriod]  = useState<Period>('30')
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  const data = id ? analyticsCache[id] : null

  // Find article meta from articles list (for title/slug links)
  const articleMeta = articles.find(a => a.id === id)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)

    fetchAnalytics(id)
      .then(result => {
        if (!result) setError('Could not load analytics for this article.')
      })
      .catch(() => setError('Failed to load analytics.'))
      .finally(() => setLoading(false))
  }, [id, period])

  if (!id) {
    return (
      <div className="text-center py-20">
        <p style={{ color: 'var(--text-muted)' }}>No article selected.</p>
        <Link to="/admin/articles" className="text-sm mt-2 block"
          style={{ color: 'var(--accent)' }}>
          ← Back to articles
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">

      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-start gap-4">
        <Link
          to="/admin/articles"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm
                     font-medium transition-colors hover:bg-[var(--bg-subtle)]
                     flex-shrink-0 mt-0.5"
          style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
        >
          <ArrowLeft size={14} /> Back
        </Link>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider mb-1"
            style={{ color: 'var(--accent)' }}>
            Article Analytics
          </p>
          <h2
            className="text-xl font-bold tracking-tight line-clamp-2"
            style={{ color: 'var(--text-primary)' }}
          >
            {loading ? 'Loading…' : (data as any)?.title ?? articleMeta?.title ?? 'Article'}
          </h2>
          {articleMeta?.slug && (
            <Link
              to={`/article/${articleMeta.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-xs mt-1 hover:underline"
              style={{ color: 'var(--text-muted)' }}
            >
              View article <ExternalLink size={10} />
            </Link>
          )}
        </div>

        {/* Period filter */}
        <div className="flex items-center gap-1 p-1 rounded-xl flex-shrink-0"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: period === p.key ? 'var(--text-primary)' : 'transparent',
                color:      period === p.key ? 'var(--bg)'           : 'var(--text-muted)',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error ─────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(185,28,28,0.06)', color: 'var(--breaking)', border: '1px solid rgba(185,28,28,0.15)' }}>
          {error}
        </div>
      )}

      {/* ── Loading ───────────────────────────────────────── */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
          {[1,2,3,4].map(n => (
            <div key={n} className="rounded-2xl p-5"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div className="skeleton w-8 h-8 rounded-xl mb-3" />
              <div className="skeleton h-7 w-16 rounded mb-1" />
              <div className="skeleton h-3 w-20 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* ── Content ───────────────────────────────────────── */}
      {!loading && data && (
        <>
          {/* Totals row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Views',    value: data.view_count,    icon: Eye           },
              { label: 'Total Likes',    value: data.like_count,    icon: Heart         },
              { label: 'Total Comments', value: data.comment_count, icon: MessageCircle },
              {
                label: 'Period Views',
                value: data.views_by_day?.reduce((sum: number, d: any) => sum + Number(d.views ?? 0), 0),
                icon: TrendingUp,
              },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl p-5"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'var(--accent-light)' }}>
                  <Icon size={16} style={{ color: 'var(--accent)' }} />
                </div>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {formatCount(Number(value ?? 0))}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Views over time — bar chart using CSS */}
          {data.views_by_day && data.views_by_day.length > 0 && (
            <div className="rounded-2xl p-6"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 mb-5">
                <Calendar size={15} style={{ color: 'var(--accent)' }} />
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Views over time
                </h3>
              </div>
              <ViewsBarChart data={data.views_by_day} />
            </div>
          )}

          {/* Bottom row: referrers + audience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Referrers */}
            {data.top_referrers && data.top_referrers.length > 0 && (
              <div className="rounded-2xl p-5"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Globe size={14} style={{ color: 'var(--accent)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    Top referrers
                  </h3>
                </div>
                <div className="space-y-3">
                  {data.top_referrers.map((r: any) => {
                    const max   = data.top_referrers[0]?.views ?? 1
                    const pct   = Math.round((r.views / max) * 100)
                    return (
                      <div key={r.source}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium truncate max-w-[160px]"
                            style={{ color: 'var(--text-primary)' }}>
                            {r.source}
                          </span>
                          <span className="text-xs flex-shrink-0 ml-2"
                            style={{ color: 'var(--text-muted)' }}>
                            {formatCount(r.visits)}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden"
                          style={{ background: 'var(--bg-subtle)' }}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: 'var(--accent)' }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Audience breakdown */}
            {/* {data.audienceBreakdown && (
              <div className="rounded-2xl p-5"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Users size={14} style={{ color: 'var(--accent)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    Audience
                  </h3>
                </div>
                <AudienceSplit data={data.audienceBreakdown} />
              </div>
            )} */}
          </div>
        </>
      )}
    </div>
  )
}

// ── Mini bar chart (CSS-only, no library needed) ──────────────

function ViewsBarChart({ data }: { data: { date: string; views: number }[] }) {
  const max = Math.max(...data.map(d => Number(d.views ?? 0)), 1)

  // Show at most 30 bars — skip older ones if range is larger
  const visible = data.slice(-30)

  return (
    <div className="flex items-end gap-px h-32 w-full">
      {visible.map((d, i) => {
        const pct  = Math.round((Number(d.views) / max) * 100)
        const date = new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        return (
          <div
            key={i}
            className="flex-1 group relative flex flex-col justify-end"
            style={{ minWidth: '4px' }}
          >
            <div
              className="rounded-t-sm transition-all duration-300 group-hover:opacity-80"
              style={{
                height:     `${Math.max(pct, 2)}%`,
                background: 'var(--accent)',
                opacity:    0.7,
              }}
            />
            {/* Tooltip */}
            <div
              className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2
                         px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap
                         opacity-0 group-hover:opacity-100 pointer-events-none
                         transition-opacity z-10"
              style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}
            >
              {date}: {d.views}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Audience donut-style split ────────────────────────────────

/* function AudienceSplit({ data }: { data: { logged_in: number; anonymous: number } }) {
  const loggedIn  = Number(data.logged_in  ?? 0)
  const anonymous = Number(data.anonymous  ?? 0)
  const total     = loggedIn + anonymous || 1
  const liPct     = Math.round((loggedIn  / total) * 100)
  const anPct     = Math.round((anonymous / total) * 100)

  return (
    <div className="space-y-4">
      <AudienceBar label="Logged in"  count={loggedIn}  pct={liPct}  color="var(--accent)" />
      <AudienceBar label="Anonymous"  count={anonymous} pct={anPct}  color="var(--text-muted)" />
      <p className="text-xs pt-1" style={{ color: 'var(--text-muted)' }}>
        {formatCount(total)} total views tracked
      </p>
    </div>
  )
} */

/* function AudienceBar({ label, count, pct, color }: {
  label: string; count: number; pct: number; color: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {formatCount(count)} ({pct}%)
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-subtle)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
} */