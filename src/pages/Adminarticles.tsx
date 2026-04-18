
import { useEffect, useState, useCallback } from 'react'
import { Link }                              from 'react-router-dom'
import {
  Search, X,  Eye, Heart,
  MessageCircle, ExternalLink, BarChart2,
} from 'lucide-react'
import { useAdmin }           from '../context/AdminContext'
import { StatusBadge }        from './Admindashboard'
import { formatCount } from '../lib/utils'

const STATUSES = ['all', 'published', 'draft', 'archived']
const LIMIT    = 20

export default function AdminArticles() {
  const { articles, articlesTotal, articlesLoading, articlesError, fetchArticles } = useAdmin()

  const [search,  setSearch]  = useState('')
  const [status,  setStatus]  = useState('all')
  const [page,    setPage]    = useState(1)

  const load = useCallback(() => {
    fetchArticles({
      page,
      limit:  LIMIT,
      search: search || undefined,
      status: status === 'all' ? undefined : status,
    })
  }, [page, search, status, fetchArticles])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load() }, 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => { load() }, [status, page])

  const totalPages = Math.ceil(articlesTotal / LIMIT)

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Header + controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--text-primary)' }}>
            Articles
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {articlesTotal} total
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl px-3"
          style={{ height: '40px', background: 'var(--bg-surface)', border: '1px solid var(--border)', minWidth: '220px' }}>
          <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search articles…"
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: 'var(--text-primary)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ color: 'var(--text-muted)' }}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1) }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
              style={{
                background: status === s ? 'var(--text-primary)' : 'transparent',
                color:      status === s ? 'var(--bg)'           : 'var(--text-muted)',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {articlesError && (
        <div className="rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(185,28,28,0.06)', color: 'var(--breaking)', border: '1px solid rgba(185,28,28,0.15)' }}>
          {articlesError}
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        {articlesLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="skeleton flex-1 h-4 rounded" />
                <div className="skeleton w-20 h-4 rounded" />
                <div className="skeleton w-16 h-4 rounded" />
                <div className="skeleton w-16 h-4 rounded" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📰</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No articles found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                  {['Article', 'Status', 'Category', 'Views', 'Likes', 'Comments', 'Published', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
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
                    className="transition-colors hover:bg-[var(--bg-subtle)]"
                    style={{ borderBottom: i < articles.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-medium line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                        {a.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        by {a.author_name}
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                      {a.category_name}
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1">
                        <Eye size={11} />{formatCount(a.view_count)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1">
                        <Heart size={11} />{formatCount(a.like_count)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={11} />{formatCount(a.comment_count)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                      {a.published_at
                        ? new Date(a.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/analytics/${a.id}`}
                          className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-subtle)]"
                          style={{ color: 'var(--text-muted)' }}
                          title="Analytics"
                        >
                          <BarChart2 size={14} />
                        </Link>
                        <Link
                          to={`/article/${a.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-subtle)]"
                          style={{ color: 'var(--text-muted)' }}
                          title="View article"
                        >
                          <ExternalLink size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-40 transition-opacity hover:opacity-70"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-40 transition-opacity hover:opacity-70"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}