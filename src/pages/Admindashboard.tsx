
import { useEffect }           from 'react'
import { Link }                from 'react-router-dom'
import {
  FileText, Eye, Heart, MessageCircle,
  Users, TrendingUp, PenLine, Clock,
  ArrowRight,
} from 'lucide-react'
import { useAdmin } from '../context/AdminContext'
import { formatCount } from '../lib/utils'

export default function AdminDashboard() {
  const { stats, statsLoading, statsError, fetchStats, fetchArticles, articles } = useAdmin()

  useEffect(() => {
    fetchStats()
    fetchArticles({ limit: 5, status: 'published' })
  }, [])

  return (
    <div className="space-y-8 max-w-5xl">

      {/* ── Welcome ───────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-1"
          style={{ color: 'var(--text-primary)' }}>
          Dashboard
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Overview of your platform's performance.
        </p>
      </div>

      {/* ── Error ─────────────────────────────────────────── */}
      {statsError && (
        <div className="rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(185,28,28,0.06)', color: 'var(--breaking)', border: '1px solid rgba(185,28,28,0.15)' }}>
          {statsError}
        </div>
      )}

      {/* ── Stat cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : stats && [
              { label: 'Total Articles',  value: stats.articles?.total,             icon: FileText,       sub: `${stats.articles?.published} published` },
              { label: 'Total Views',     value: stats.articles?.total_views,       icon: Eye,            sub: 'all time'                              },
              { label: 'Total Likes',     value: stats.articles?.total_likes,       icon: Heart,          sub: 'all articles'                          },
              { label: 'Total Comments',  value: stats.articles?.total_comments,    icon: MessageCircle,  sub: 'all articles'                          },
              { label: 'Total Users',     value: stats.users?.total,       icon: Users,          sub: `${stats.users?.new_this_month} today`         },
            ].map(({ label, value, icon: Icon, sub }) => (
              <StatCard key={label} label={label} value={value} icon={Icon} sub={sub} />
            ))
        }
      </div>

      {/* ── Recent articles ────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            Recent Articles
          </h3>
          <Link to="/admin/articles"
            className="flex items-center gap-1 text-xs font-semibold hover:opacity-70 transition-opacity"
            style={{ color: 'var(--accent)' }}>
            View all <ArrowRight size={12} />
          </Link>
        </div>

        <div className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
          {articles.length === 0 && !statsLoading ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
              No articles yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                  {['Title', 'Status', 'Views', 'Likes', 'Date'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {articles.map((a, i) => (
                  <tr
                    key={a.id}
                    style={{ borderBottom: i < articles.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium line-clamp-1 max-w-xs"
                        style={{ color: 'var(--text-primary)' }}>
                        {a.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {a.author_name}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formatCount(a.view_count)}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formatCount(a.like_count)}
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                      {a.published_at
                        ? new Date(a.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        : '—'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, sub }: {
  label: string; value: number; icon: React.ElementType; sub: string
}) {
  return (
    <div className="rounded-2xl p-5"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--accent-light)' }}>
          <Icon size={16} style={{ color: 'var(--accent)' }} />
        </div>
      </div>
      <p className="text-2xl font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>
        {formatCount(value)}
      </p>
      <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
        {label}
      </p>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-5 animate-pulse"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      <div className="skeleton w-9 h-9 rounded-xl mb-3" />
      <div className="skeleton h-7 w-16 rounded mb-1" />
      <div className="skeleton h-3 w-24 rounded mb-1" />
      <div className="skeleton h-3 w-16 rounded" />
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string; bg: string }> = {
    published: { label: 'Published', color: '#16a34a', bg: 'rgba(22,163,74,0.08)'    },
    draft:     { label: 'Draft',     color: '#ca8a04', bg: 'rgba(202,138,4,0.08)'    },
    archived:  { label: 'Archived',  color: '#6b7280', bg: 'rgba(107,114,128,0.08)' },
  }
  const c = config[status] ?? config.draft
  return (
    <span className="inline-flex px-2 py-0.5 rounded-lg text-[11px] font-semibold"
      style={{ background: c.bg, color: c.color }}>
      {c.label}
    </span>
  )
}