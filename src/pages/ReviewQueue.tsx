import { useState, useEffect } from 'react'
import {
  CheckCircle, XCircle, RotateCcw, Eye, Clock,
  AlertTriangle, FileText, ChevronDown, ChevronUp,
  User, Tag, BookOpen,
} from 'lucide-react'
import { getReviewQueue, reviewAction } from '../api/articles'
import { cloudinaryUrl } from '../lib/utils'
import type { ApiResponse, ReviewArticle } from '../types'

type ActionState = 'idle' | 'loading' | 'done' | 'error'

type ReviewActionResponse = ApiResponse<{ id: string; slug: string; title: string; status: string }>

// ── Helpers ──────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (secs < 60)     return 'just now'
  if (secs < 3600)   return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400)  return `${Math.floor(secs / 3600)}h ago`
  if (secs < 604800) return `${Math.floor(secs / 86400)}d ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
}

// ── ArticleReviewCard ────────────────────────────────────────

function ArticleReviewCard({
  article,
  onAction,
}: {
  article:  ReviewArticle
  onAction: (id: string, action: 'approve' | 'request_changes' | 'reject') => Promise<ReviewActionResponse>
}) {
  const [expanded,     setExpanded]     = useState(false)
  const [actionState,  setActionState]  = useState<ActionState>('idle')
  const [actionError,  setActionError]  = useState('')
  const [activeAction, setActiveAction] = useState<string | null>(null)

  const handle = async (action: 'approve' | 'request_changes' | 'reject') => {
    if (actionState === 'loading') return
    setActionState('loading')
    setActiveAction(action)
    setActionError('')
    try {
      const response = await onAction(article.id, action)
      if (!response.success) {
        throw new Error(response.message || 'Action failed.')
      }
      setActionState('done')
    } catch (e: any) {
      setActionError(e?.response?.data?.message ?? e?.message ?? 'Action failed.')
      setActionState('error')
      setActiveAction(null)
    }
  }

  if (actionState === 'done') return null // card disappears after action

  return (
    <div
      className="rounded-2xl overflow-hidden transition-shadow hover:shadow-md"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
    >
      {/* ── Card header ── */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">

            {/* Badges */}
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              {article.is_breaking && (
                <span
                  className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md"
                  style={{ background: 'var(--breaking)', color: '#fff' }}
                >Breaking</span>
              )}
              {article.is_featured && (
                <span
                  className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md"
                  style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                >Featured</span>
              )}
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                style={{
                  background: article.category_color ? `${article.category_color}18` : 'var(--bg-subtle)',
                  color:      article.category_color ?? 'var(--text-muted)',
                }}
              >{article.category_name}</span>
            </div>

            {/* Title */}
            <h2 className="text-base font-bold leading-snug mb-1" style={{ color: 'var(--text-primary)' }}>
              {article.title}
            </h2>
            {article.subtitle && (
              <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                {article.subtitle}
              </p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1">
                <User size={11} /> {article.author_name}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={11} /> Submitted {timeAgo(article.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen size={11} /> {article.reading_time} min read
              </span>
              {article.tags?.length > 0 && (
                <span className="flex items-center gap-1">
                  <Tag size={11} />
                  {article.tags.map(t => t.name).join(', ')}
                </span>
              )}
            </div>
          </div>

          {/* Cover thumbnail */}
          {article.cover_image && (
            <img
              src={cloudinaryUrl(article.cover_image, 80, 64)}
              alt=""
              className="w-20 h-16 rounded-xl object-cover flex-shrink-0"
              width={80}
              height={64}
            />
          )}
        </div>

        {/* Excerpt */}
        {article.excerpt && (
          <p
            className="text-sm mt-3 leading-relaxed line-clamp-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            {article.excerpt}
          </p>
        )}

        {/* Error */}
        {actionState === 'error' && (
          <div
            className="flex items-center gap-2 mt-3 p-2.5 rounded-xl text-xs"
            style={{ background: 'rgba(185,28,28,0.07)', color: 'var(--breaking)', border: '1px solid rgba(185,28,28,0.12)' }}
          >
            <AlertTriangle size={12} /> {actionError}
          </div>
        )}
      </div>

      {/* ── Preview panel ── */}
      {expanded && (
        <div
          className="px-5 pb-4 pt-2 text-sm leading-relaxed max-h-[480px] overflow-y-auto"
          style={{
            borderTop: '1px solid var(--border)',
            color:     'var(--text-secondary)',
          }}
          dangerouslySetInnerHTML={{ __html: article.body }}
        />
      )}

      {/* ── Action bar ── */}
      <div
        className="flex flex-wrap items-center gap-2 px-5 py-3"
        style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-subtle)' }}
      >
        {/* Preview toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
                     transition-colors hover:bg-[var(--bg-surface)]"
          style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        >
          <Eye size={12} />
          {expanded ? 'Hide preview' : 'Preview article'}
          {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>

        <div className="flex-1" />

        {/* Request changes */}
        <button
          onClick={() => handle('request_changes')}
          disabled={actionState === 'loading'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                     disabled:opacity-50 transition-opacity hover:opacity-80"
          style={{ background: 'rgba(217,119,6,0.10)', color: '#d97706', border: '1px solid rgba(217,119,6,0.25)' }}
        >
          <RotateCcw size={12} />
          {actionState === 'loading' && activeAction === 'request_changes'
            ? 'Sending…' : 'Request changes'}
        </button>

        {/* Reject */}
        <button
          onClick={() => handle('reject')}
          disabled={actionState === 'loading'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                     disabled:opacity-50 transition-opacity hover:opacity-80"
          style={{ background: 'rgba(185,28,28,0.07)', color: 'var(--breaking)', border: '1px solid rgba(185,28,28,0.15)' }}
        >
          <XCircle size={12} />
          {actionState === 'loading' && activeAction === 'reject'
            ? 'Rejecting…' : 'Reject'}
        </button>

        {/* Approve */}
        <button
          onClick={() => handle('approve')}
          disabled={actionState === 'loading'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                     disabled:opacity-50 transition-opacity hover:opacity-80"
          style={{ background: 'rgba(22,163,74,0.10)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.25)' }}
        >
          <CheckCircle size={12} />
          {actionState === 'loading' && activeAction === 'approve'
            ? 'Approving…' : 'Approve & publish'}
        </button>
      </div>
    </div>
  )
}

// ── ReviewQueue (page) ───────────────────────────────────────

export default function ReviewQueue() {
  const [articles, setArticles] = useState<ReviewArticle[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  const fetchQueue = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getReviewQueue()
      setArticles(res.data ?? [])
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to load review queue.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchQueue() }, [])

  const handleAction = async (
    id:     string,
    action: 'approve' | 'request_changes' | 'reject',
  ) => {
    const response = await reviewAction(id, action)
    if (!response.success) {
      throw new Error(response.message || 'Unable to complete review action.')
    }
    // Optimistically remove from local list — re-fetch for count accuracy
    setArticles(prev => prev.filter(a => a.id !== id))
    setSuccess(response.message ?? 'Article approved successfully.')
    window.setTimeout(() => setSuccess(''), 3000)
    return response
  }

  return (
    <div style={{ color: 'var(--text-primary)' }}>

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Review Queue
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {loading ? 'Loading…' : `${articles.length} article${articles.length !== 1 ? 's' : ''} awaiting review`}
          </p>
        </div>
      </div>

      {/* ── Success ── */}
      {success && (
        <div
          className="flex items-center gap-2 p-3 rounded-xl mb-5 text-sm"
          style={{ background: 'rgba(22,163,74,0.08)', color: '#166534', border: '1px solid rgba(22,163,74,0.18)' }}
        >
          <CheckCircle size={14} /> {success}
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div
          className="flex items-center gap-2 p-3 rounded-xl mb-5 text-sm"
          style={{ background: 'rgba(185,28,28,0.07)', color: 'var(--breaking)', border: '1px solid rgba(185,28,28,0.12)' }}
        >
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div
            className="w-6 h-6 rounded-full animate-spin"
            style={{ border: '2px solid var(--border)', borderTop: '2px solid var(--accent)' }}
          />
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && articles.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <FileText size={40} style={{ color: 'var(--text-muted)', opacity: 0.25 }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            No articles pending review
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
            When authors submit articles they'll appear here
          </p>
        </div>
      )}

      {/* ── Cards ── */}
      {!loading && articles.length > 0 && (
        <div className="flex flex-col gap-4">
          {articles.map(article => (
            <ArticleReviewCard
              key={article.id}
              article={article}
              onAction={handleAction}
            />
          ))}
        </div>
      )}
    </div>
  )
}