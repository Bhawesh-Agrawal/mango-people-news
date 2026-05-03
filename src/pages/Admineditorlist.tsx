import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus, Search, FileText, Eye, Heart,
  Edit2, Trash2, ChevronLeft, ChevronRight,
  BarChart2, AlertTriangle, MessageSquare,
} from 'lucide-react'
import { client }      from '../api/client'
import { useAuth }     from '../context/AuthContext'
import { useCategories } from '../hooks/useCategories'
import { formatCount } from '../lib/utils'

// ── Types ─────────────────────────────────────────────────────

interface ArticleRow {
  id:             string
  slug:           string
  title:          string
  status:         'draft' | 'published' | 'archived'
  author_name:    string
  category_name:  string
  category_color: string
  view_count:     number
  like_count:     number
  comment_count:  number
  published_at:   string | null
  created_at:     string
  is_breaking:    boolean
  is_featured:    boolean
}

// ── Helpers ───────────────────────────────────────────────────

const STATUS_CONFIG = {
  draft:     { label: 'Draft',     color: 'var(--text-secondary)', bg: 'var(--bg-subtle)'     },
  published: { label: 'Published', color: '#16a34a',               bg: 'rgba(22,163,74,0.10)' },
  archived:  { label: 'Archived',  color: 'var(--breaking)',       bg: 'rgba(185,28,28,0.07)' },
}

function timeAgo(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (secs < 60)     return 'just now'
  if (secs < 3600)   return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400)  return `${Math.floor(secs / 3600)}h ago`
  if (secs < 604800) return `${Math.floor(secs / 86400)}d ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
}

// ── Component ─────────────────────────────────────────────────

const PAGE_SIZE = 15

export default function AdminEditorList() {
  const { user }        = useAuth()
  const { categories }  = useCategories()
  const isEditorOrAbove = user?.role === 'editor' || user?.role === 'super_admin'

  const [articles,     setArticles]     = useState<ArticleRow[]>([])
  const [hasNextPage,  setHasNextPage]  = useState(false)
  const [page,         setPage]         = useState(1)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [search,       setSearch]       = useState('')
  const [status,       setStatus]       = useState('all')
  const [category,     setCategory]     = useState('all')

  // Delete dialog
  const [deleteId,    setDeleteId]    = useState<string | null>(null)
  const [deleting,    setDeleting]    = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Fetch ─────────────────────────────────────────────────
  // Backend scopes results to the author's own articles when JWT role is
  // 'author'. Editors see everything. We omit `status` entirely when 'all'
  // so the backend's role-aware defaults kick in (returns all statuses for
  // the authenticated user).

  const fetchList = useCallback(async (pg: number, q: string, st: string, cat: string) => {
    setLoading(true)
    setError('')
    try {
      const params: Record<string, any> = {
        page:  pg,
        limit: PAGE_SIZE,
        mine : true,
      }
      if (q)          params.search = q
      if (st !== 'all') params.status = st
      if (cat !== 'all') params.category = cat
      // When st === 'all', omit status entirely — backend defaults to
      // returning all statuses for authenticated staff (authors/editors).

      const res        = await client.get('/articles', { params })
      const data       = res.data?.data ?? []
      const pagination = res.data?.pagination ?? {}

      setArticles(data)
      // Use the backend's hasNextPage directly — avoids off-by-one errors
      setHasNextPage(pagination.hasNextPage ?? false)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load articles.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Re-fetch whenever page, status, or category filter changes
  useEffect(() => {
    fetchList(page, search, status, category)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, category])

  const handleSearchChange = (val: string) => {
    setSearch(val)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setPage(1)
      fetchList(1, val, status, category)
    }, 350)
  }

  const handleStatusChange = (val: string) => {
    setStatus(val)
    setPage(1)
    // Effect will fire because status changed
  }

  const handleCategoryChange = (val: string) => {
    setCategory(val)
    setPage(1)
    // Effect will fire because category changed
  }

  // ── Delete ────────────────────────────────────────────────

  const confirmDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    setDeleteError('')
    try {
      await client.delete(`/articles/${deleteId}`)
      setDeleteId(null)
      fetchList(page, search, status, category)
    } catch (e: any) {
      setDeleteError(e?.response?.data?.message ?? 'Delete failed.')
    } finally {
      setDeleting(false)
    }
  }

  const hasPrevPage = page > 1

  // ── Render ────────────────────────────────────────────────

  return (
    <div style={{ color: 'var(--text-primary)' }}>

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {isEditorOrAbove ? 'All Articles' : 'My Articles'}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {isEditorOrAbove
              ? 'Manage articles from all authors'
              : 'Your drafts and published articles'}
          </p>
        </div>
        <Link
          to="/admin/editor/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm
                     font-semibold transition-opacity hover:opacity-85"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          <Plus size={15} /> New Article
        </Link>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl flex-1 min-w-[180px]"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search articles…"
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>

        <select
          value={status}
          onChange={e => handleStatusChange(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-sm font-medium outline-none cursor-pointer"
          style={{
            background: 'var(--bg-surface)',
            border:     '1px solid var(--border)',
            color:      'var(--text-primary)',
          }}
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>

        <select
          value={category}
          onChange={e => handleCategoryChange(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-sm font-medium outline-none cursor-pointer"
          style={{
            background: 'var(--bg-surface)',
            border:     '1px solid var(--border)',
            color:      'var(--text-primary)',
          }}
        >
          <option value="all">All categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* ── Error ── */}
      {error && (
        <div
          className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm"
          style={{ background: 'rgba(185,28,28,0.07)', color: 'var(--breaking)', border: '1px solid rgba(185,28,28,0.12)' }}
        >
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* ── Table ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        {/* Table header — desktop only */}
        <div
          className="hidden md:grid gap-4 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider"
          style={{
            gridTemplateColumns: isEditorOrAbove
              ? '1fr 100px 130px 110px 90px 100px'
              : '1fr 100px 130px 110px 90px 80px',
            borderBottom: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}
        >
          <span>Title</span>
          <span>Status</span>
          <span>Category</span>
          <span>Engagement</span>
          <span>Date</span>
          <span className="text-right">Actions</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div
              className="w-6 h-6 rounded-full animate-spin"
              style={{ border: '2px solid var(--border)', borderTop: '2px solid var(--accent)' }}
            />
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <FileText size={36} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              {search
                ? `No articles matching "${search}"`
                : status !== 'all'
                  ? `No ${status} articles`
                  : 'No articles yet'}
            </p>
            <Link
              to="/admin/editor/new"
              className="flex items-center gap-1.5 text-sm font-semibold mt-1
                         transition-opacity hover:opacity-75"
              style={{ color: 'var(--accent)' }}
            >
              <Plus size={14} />
              Write your first article
            </Link>
          </div>
        ) : (
          <div>
            {articles.map((article, idx) => {
              const sc = STATUS_CONFIG[article.status] ?? STATUS_CONFIG.draft
              return (
                <div
                  key={article.id}
                  className="flex flex-col md:grid gap-3 md:gap-4 px-5 py-4
                             transition-colors hover:bg-[var(--bg-subtle)]"
                  style={{
                    gridTemplateColumns: isEditorOrAbove
                      ? '1fr 100px 130px 110px 90px 100px'
                      : '1fr 100px 130px 110px 90px 80px',
                    borderBottom: idx < articles.length - 1
                      ? '1px solid var(--border)' : 'none',
                  }}
                >
                  {/* Title + badges */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      {article.is_breaking && (
                        <span
                          className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md"
                          style={{ background: 'var(--breaking)', color: '#fff' }}
                        >
                          Breaking
                        </span>
                      )}
                      {article.is_featured && (
                        <span
                          className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md"
                          style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                        >
                          Featured
                        </span>
                      )}
                    </div>
                    <p
                      className="text-sm font-semibold leading-snug line-clamp-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {article.title}
                    </p>
                    {isEditorOrAbove && (
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        by {article.author_name}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                      style={{ background: sc.bg, color: sc.color }}
                    >
                      {sc.label}
                    </span>
                  </div>

                  {/* Category */}
                  <div className="flex items-center">
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-lg truncate max-w-[120px]"
                      style={{
                        background: article.category_color
                          ? `${article.category_color}18` : 'var(--bg-subtle)',
                        color: article.category_color ?? 'var(--text-muted)',
                      }}
                    >
                      {article.category_name || '—'}
                    </span>
                  </div>

                  {/* Engagement */}
                  <div className="flex items-center gap-3">
                    <span
                      className="flex items-center gap-1 text-xs"
                      style={{ color: 'var(--text-muted)' }}
                      title="Views"
                    >
                      <Eye size={11} /> {formatCount(article.view_count)}
                    </span>
                    <span
                      className="flex items-center gap-1 text-xs"
                      style={{ color: 'var(--text-muted)' }}
                      title="Likes"
                    >
                      <Heart size={11} /> {formatCount(article.like_count)}
                    </span>
                    <span
                      className="flex items-center gap-1 text-xs"
                      style={{ color: 'var(--text-muted)' }}
                      title="Comments"
                    >
                      <MessageSquare size={11} /> {formatCount(article.comment_count)}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {article.published_at
                        ? timeAgo(article.published_at)
                        : timeAgo(article.created_at)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-start md:justify-end gap-1">
                    <Link
                      to={`/admin/editor/${article.id}`}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs
                                 font-semibold transition-colors hover:bg-[var(--accent-light)]"
                      style={{ color: 'var(--accent)' }}
                      title="Edit article"
                    >
                      <Edit2 size={12} /> Edit
                    </Link>
                    {isEditorOrAbove && (
                      <Link
                        to={`/admin/analytics/${article.id}`}
                        className="p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-subtle)]"
                        style={{ color: 'var(--text-muted)' }}
                        title="View analytics"
                      >
                        <BarChart2 size={13} />
                      </Link>
                    )}
                    <button
                      onClick={() => { setDeleteId(article.id); setDeleteError('') }}
                      className="p-1.5 rounded-lg transition-colors
                                 hover:bg-[rgba(185,28,28,0.08)]"
                      style={{ color: 'var(--breaking)' }}
                      title="Delete article"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {(hasPrevPage || hasNextPage) && (
        <div className="flex items-center justify-between mt-5">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Page {page}
          </p>
          <div className="flex gap-2">
            <button
              disabled={!hasPrevPage}
              onClick={() => setPage(p => p - 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm
                         font-medium disabled:opacity-40 transition-colors
                         hover:bg-[var(--bg-surface)]"
              style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              disabled={!hasNextPage}
              onClick={() => setPage(p => p + 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm
                         font-medium disabled:opacity-40 transition-colors
                         hover:bg-[var(--bg-surface)]"
              style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Delete confirm dialog ── */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => !deleting && setDeleteId(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(185,28,28,0.08)' }}
            >
              <Trash2 size={18} style={{ color: 'var(--breaking)' }} />
            </div>
            <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
              Delete this article?
            </h3>
            <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              This is permanent and cannot be undone. All views, likes, and
              comments on this article will also be removed.
            </p>
            {deleteError && (
              <p className="text-xs mb-3" style={{ color: 'var(--breaking)' }}>{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold
                           disabled:opacity-50 transition-opacity hover:opacity-80"
                style={{ background: 'var(--breaking)', color: '#fff' }}
              >
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium
                           transition-colors hover:bg-[var(--bg-subtle)]"
                style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}