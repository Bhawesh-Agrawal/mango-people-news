import {
  useState, useEffect, useRef, useCallback,
} from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import {
  Clock, Eye, Heart, Bookmark,
  Twitter, Link2, ChevronRight,
  Trash2, CornerDownRight, X,
} from 'lucide-react'
import {
  getArticle, getTrending, toggleLike, getLikeStatus,
  trackView, getComments, postComment, deleteComment,
} from '../api/articles'
import type { Comment } from '../api/articles'
import { useAuth }        from '../context/AuthContext'
import type { Article }   from '../types'
import { timeAgo, formatCount, formatDate } from '../lib/utils'
import {
  toggleSaveArticle,
  getInitialSaveStatus,
} from './Savedpage'
import SEO from '../seo/Seo'

// ── Reading progress bar ──────────────────────────────────────

function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const el  = document.documentElement
      const top = el.scrollTop || document.body.scrollTop
      const h   = el.scrollHeight - el.clientHeight
      setProgress(h > 0 ? (top / h) * 100 : 0)
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div
      className="fixed top-0 left-0 z-[60] h-[3px] transition-all duration-100"
      style={{ width: `${progress}%`, background: 'var(--accent)' }}
    />
  )
}

// ── Article skeleton ──────────────────────────────────────────

function ArticleSkeleton() {
  return (
    <div className="page-container py-8 space-y-6 animate-pulse">
      <div className="skeleton h-3 w-24 rounded" />
      <div className="skeleton h-10 w-full rounded" />
      <div className="skeleton h-10 w-3/4 rounded" />
      <div className="skeleton h-4 w-48 rounded" />
      <div className="skeleton h-[420px] w-full rounded-xl" />
      <div className="space-y-3 max-w-2xl">
        {[1, 2, 3, 4, 5, 6].map(n => (
          <div key={n} className="skeleton h-4 w-full rounded" />
        ))}
      </div>
    </div>
  )
}

// ── Save gate modal ───────────────────────────────────────────

function SaveGateModal({ onClose }: { onClose: () => void }) {
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center
                 justify-center p-4 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={handleBackdrop}
    >
      <div
        className="w-full rounded-2xl p-6 relative"
        style={{
          maxWidth:   '400px',
          background: 'var(--bg-surface)',
          border:     '1px solid var(--border)',
          boxShadow:  '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors
                     hover:bg-[var(--bg-subtle)]"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
        >
          <Bookmark size={22} />
        </div>

        <h2
          className="text-lg font-bold mb-1.5 tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Save this article
        </h2>
        <p
          className="text-sm leading-relaxed mb-5"
          style={{ color: 'var(--text-muted)' }}
        >
          Sign in to save articles and access them from any device — completely free.
        </p>

        <div className="flex flex-col gap-2.5">
          <Link
            to="/login"
            state={{ from: window.location.pathname }}
            onClick={onClose}
            className="flex items-center justify-center w-full rounded-xl
                       text-sm font-bold transition-opacity hover:opacity-90"
            style={{
              height:     '46px',
              background: 'var(--accent)',
              color:      '#fff',
            }}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            state={{ from: window.location.pathname }}
            onClick={onClose}
            className="flex items-center justify-center w-full rounded-xl
                       text-sm font-semibold transition-opacity hover:opacity-80"
            style={{
              height:     '46px',
              background: 'var(--bg-subtle)',
              color:      'var(--text-secondary)',
              border:     '1px solid var(--border)',
            }}
          >
            Create free account
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Action bar ────────────────────────────────────────────────

function ActionBar({
  article,
  liked,
  likeCount,
  saved,
  savePending,
  onLike,
  onSave,
}: {
  article:     Article
  liked:       boolean
  likeCount:   number
  saved:       boolean
  savePending: boolean
  onLike:      () => void
  onSave:      () => void
}) {
  const [copied, setCopied] = useState(false)

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareTwitter = () => {
    const text = encodeURIComponent(article.title)
    const url  = encodeURIComponent(window.location.href)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
  }

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`${article.title} ${window.location.href}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const base: React.CSSProperties = {
    display:        'inline-flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            '5px',
    height:         '36px',
    padding:        '0 11px',
    borderRadius:   '8px',
    fontSize:       '13px',
    fontWeight:     500,
    whiteSpace:     'nowrap',
    flexShrink:     0,
    cursor:         'pointer',
    border:         '1px solid var(--border)',
    background:     'var(--bg-subtle)',
    color:          'var(--text-secondary)',
    transition:     'opacity 150ms',
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

      <button
        onClick={onLike}
        style={{
          ...base,
          ...(liked ? {
            background: 'var(--breaking-bg, #fef2f2)',
            border:     '1px solid var(--breaking)',
            color:      'var(--breaking)',
          } : {}),
        }}
        aria-label="Like article"
      >
        <Heart size={15} fill={liked ? 'currentColor' : 'none'} style={{ flexShrink: 0 }} />
        <span>{formatCount(likeCount)}</span>
      </button>

      <button 
        onClick={shareTwitter} 
        style={base} 
        title="Share on X" 
        aria-label="Share on X"
      >
        {/* Replacing <Twitter /> with the official X SVG */}
        <svg 
          width="14" 
          height="14" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          style={{ flexShrink: 0 }}
        >
          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
        </svg>
        <span className="hidden sm:inline">Share</span>
      </button>

      <button onClick={shareWhatsApp} style={base} title="Share on WhatsApp" aria-label="Share on WhatsApp">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="hidden sm:inline">WhatsApp</span>
      </button>

      <button
        onClick={copyLink}
        style={{
          ...base,
          ...(copied ? {
            background: 'var(--positive-bg, #f0fdf4)',
            border:     '1px solid var(--positive, #16a34a)',
            color:      'var(--positive, #16a34a)',
          } : {}),
        }}
        aria-label="Copy link"
      >
        <Link2 size={14} style={{ flexShrink: 0 }} />
        <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
      </button>

      <button
        onClick={onSave}
        disabled={savePending}
        style={{
          ...base,
          marginLeft:  'auto',
          opacity:     savePending ? 0.6 : 1,
          cursor:      savePending ? 'not-allowed' : 'pointer',
          ...(saved ? {
            background: 'var(--accent-light)',
            border:     '1px solid var(--accent)',
            color:      'var(--accent)',
          } : {}),
        }}
        aria-label={saved ? 'Unsave article' : 'Save article'}
      >
        <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} style={{ flexShrink: 0 }} />
        <span className="hidden sm:inline">{saved ? 'Saved' : 'Save'}</span>
      </button>

    </div>
  )
}

// ── Comments section ──────────────────────────────────────────

function CommentsSection({
  articleId,
  returnPath,
}: {
  articleId:  string
  returnPath: string
}) {
  const { user, isLoggedIn, emailVerified } = useAuth()

  const [comments,      setComments]      = useState<Comment[]>([])
  const [loading,       setLoading]       = useState(true)

  const draftKey = `mpn_comment_draft_${articleId}`
  const [body,          setBody]          = useState<string>(() => {
    try { return sessionStorage.getItem(`mpn_comment_draft_${articleId}`) ?? '' } catch { return '' }
  })
  const [submitting,    setSubmitting]    = useState(false)
  const [error,         setError]         = useState('')
  const [successMsg,    setSuccessMsg]    = useState('')
  const [showAuthNudge, setShowAuthNudge] = useState(false)

  const [replyingTo,      setReplyingTo]      = useState<string | null>(null)
  const [replyBody,       setReplyBody]       = useState('')
  const [replySubmitting, setReplySubmitting] = useState(false)
  const [replyError,      setReplyError]      = useState('')
  const [replyAuthNudge,  setReplyAuthNudge]  = useState(false)

  const replyRef = useRef<HTMLTextAreaElement>(null)

  const loginState    = { state: { from: returnPath } }
  const registerState = { state: { from: returnPath } }

  const load = useCallback(async () => {
    try {
      const res = await getComments(articleId)
      setComments(res.data ?? [])
    } catch {
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [articleId])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (replyingTo) setTimeout(() => replyRef.current?.focus(), 50)
  }, [replyingTo])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoggedIn) { setShowAuthNudge(true); return }
    if (!emailVerified) { setError('Please verify your email before posting.'); return }
    if (!body.trim()) return

    setSubmitting(true)
    setError('')
    setSuccessMsg('')
    setShowAuthNudge(false)

    try {
      const result = await postComment(articleId, body.trim())
      setBody('')
      try { sessionStorage.removeItem(draftKey) } catch {}
      setSuccessMsg(result.message ?? 'Comment posted')
      setTimeout(() => setSuccessMsg(''), 6000)
      await load()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not post comment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const submitReply = async (parentId: string) => {
    if (!isLoggedIn) { setReplyAuthNudge(true); return }
    if (!emailVerified) { setReplyError('Please verify your email before replying.'); return }
    if (!replyBody.trim()) return

    setReplySubmitting(true)
    setReplyError('')
    setReplyAuthNudge(false)

    try {
      await postComment(articleId, replyBody.trim(), parentId)
      setReplyBody('')
      setReplyingTo(null)
      await load()
    } catch (err: any) {
      setReplyError(err?.response?.data?.message ?? 'Could not post reply. Please try again.')
    } finally {
      setReplySubmitting(false)
    }
  }

  const remove = async (commentId: string) => {
    try {
      await deleteComment(commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch {}
  }

  const closeReply = () => {
    setReplyingTo(null)
    setReplyBody('')
    setReplyError('')
    setReplyAuthNudge(false)
  }

  const SignInPrompt = () => (
    <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
      <Link to="/login" {...loginState}
        className="font-semibold hover:underline"
        style={{ color: 'var(--text-secondary)' }}>
        Sign in
      </Link>
      {' '}or{' '}
      <Link to="/register" {...registerState}
        className="font-semibold hover:underline"
        style={{ color: 'var(--text-secondary)' }}>
        create an account
      </Link>
      {' '}to post comments.
    </p>
  )

  return (
    <section className="mt-12">

      <div
        className="flex items-center gap-3 pb-4 mb-8"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <h3 className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}>
          Discussion
        </h3>
        {comments.length > 0 && (
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </span>
        )}
      </div>

      <form onSubmit={submit} className="mb-10">
        <textarea
          value={body}
          onChange={e => {
            const val = e.target.value
            setBody(val)
            try { sessionStorage.setItem(draftKey, val) } catch {}
            if (showAuthNudge) setShowAuthNudge(false)
          }}
          placeholder="Share your thoughts…"
          rows={3}
          className="w-full px-0 py-3 text-sm resize-none outline-none"
          style={{
            background:   'transparent',
            color:        'var(--text-primary)',
            borderBottom: '1px solid var(--border)',
            borderTop:    'none',
            borderLeft:   'none',
            borderRight:  'none',
            borderRadius: 0,
            lineHeight:   '1.6',
          }}
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {isLoggedIn ? user?.full_name : 'Not signed in'}
          </span>
          <button
            type="submit"
            disabled={submitting || (isLoggedIn && !body.trim())}
            className="text-xs font-semibold px-4 py-2 rounded disabled:opacity-40
                       transition-opacity hover:opacity-80"
            style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}
          >
            {submitting ? 'Posting…' : 'Post comment'}
          </button>
        </div>
        {showAuthNudge && <SignInPrompt />}
        {isLoggedIn && !emailVerified && (
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            Please verify your email to post comments.
          </p>
        )}
        {error && (
          <p className="text-xs mt-2" style={{ color: 'var(--breaking)' }}>{error}</p>
        )}
        {successMsg && (
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{successMsg}</p>
        )}
      </form>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="flex gap-3">
              <div className="skeleton w-7 h-7 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="skeleton h-3 w-28 rounded" />
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton h-3 w-3/4 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm py-6" style={{ color: 'var(--text-muted)' }}>
          No comments yet.
        </p>
      ) : (
        <div className="space-y-8">
          {comments.map(comment => (
            <div key={comment.id}>
              <div className="flex gap-3 group">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center
                             flex-shrink-0 text-[11px] font-semibold overflow-hidden mt-0.5"
                  style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
                >
                  {comment.author_avatar
                    ? <img src={comment.author_avatar} alt="" className="w-full h-full object-cover" />
                    : (comment.author_name?.charAt(0) ?? '?').toUpperCase()
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {comment.author_name ?? 'Anonymous'}
                    </span>
                    {comment.is_pinned && (
                      <span className="text-[10px] uppercase tracking-wide"
                        style={{ color: 'var(--accent)' }}>
                        Pinned
                      </span>
                    )}
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {timeAgo(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {comment.body}
                  </p>
                  <button
                    onClick={() => replyingTo === comment.id
                      ? closeReply()
                      : (setReplyingTo(comment.id), setReplyBody(''), setReplyError(''), setReplyAuthNudge(false))
                    }
                    className="mt-2 text-[11px] flex items-center gap-1 transition-opacity hover:opacity-60"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <CornerDownRight size={11} />
                    {replyingTo === comment.id ? 'Cancel' : 'Reply'}
                  </button>

                  {replyingTo === comment.id && (
                    <div className="mt-3 pl-4" style={{ borderLeft: '2px solid var(--border)' }}>
                      <textarea
                        ref={replyRef}
                        value={replyBody}
                        onChange={e => {
                          setReplyBody(e.target.value)
                          if (replyAuthNudge) setReplyAuthNudge(false)
                        }}
                        placeholder={`Reply to ${comment.author_name ?? 'this comment'}…`}
                        rows={2}
                        className="w-full px-0 py-2 text-sm resize-none outline-none"
                        style={{
                          background:   'transparent',
                          color:        'var(--text-primary)',
                          borderBottom: '1px solid var(--border)',
                          borderTop:    'none',
                          borderLeft:   'none',
                          borderRight:  'none',
                          borderRadius: 0,
                          lineHeight:   '1.6',
                        }}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <button type="button" onClick={closeReply}
                          className="text-[11px] transition-opacity hover:opacity-60"
                          style={{ color: 'var(--text-muted)' }}>
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => submitReply(comment.id)}
                          disabled={replySubmitting || (isLoggedIn && !replyBody.trim())}
                          className="text-[11px] font-semibold px-3 py-1.5 rounded
                                     disabled:opacity-40 transition-opacity hover:opacity-80"
                          style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}
                        >
                          {replySubmitting ? 'Posting…' : 'Reply'}
                        </button>
                      </div>
                      {replyAuthNudge && <SignInPrompt />}
                      {replyError && (
                        <p className="text-xs mt-1" style={{ color: 'var(--breaking)' }}>{replyError}</p>
                      )}
                    </div>
                  )}

                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-5 space-y-5 pl-4"
                      style={{ borderLeft: '2px solid var(--border)' }}>
                      {comment.replies.map(reply => (
                        <div key={reply.id} className="flex gap-3 group/reply">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center
                                       flex-shrink-0 text-[10px] font-semibold overflow-hidden mt-0.5"
                            style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
                          >
                            {reply.author_avatar
                              ? <img src={reply.author_avatar} alt="" className="w-full h-full object-cover" />
                              : (reply.author_name?.charAt(0) ?? '?').toUpperCase()
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {reply.author_name ?? 'Anonymous'}
                              </span>
                              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                                {timeAgo(reply.created_at)}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                              {reply.body}
                            </p>
                          </div>
                          {user?.id && (
                            <button
                              onClick={() => remove(reply.id)}
                              className="opacity-0 group-hover/reply:opacity-100 transition-opacity
                                         p-1 self-start mt-0.5"
                              style={{ color: 'var(--text-muted)' }}
                              title="Delete"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {user?.id && (
                  <button
                    onClick={() => remove(comment.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity
                               p-1 self-start mt-0.5"
                    style={{ color: 'var(--text-muted)' }}
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ── Main Article Page ─────────────────────────────────────────

export default function ArticlePage() {
  const { slug }       = useParams<{ slug: string }>()
  const location       = useLocation()
  const { isLoggedIn } = useAuth()

  const [article,      setArticle]      = useState<Article | null>(null)
  const [related,      setRelated]      = useState<Article[]>([])
  const [loading,      setLoading]      = useState(true)
  const [liked,        setLiked]        = useState(false)
  const [likeCount,    setLikeCount]    = useState(0)
  const [notFound,     setNotFound]     = useState(false)

  const [saved,        setSaved]        = useState(false)
  const [savePending,  setSavePending]  = useState(false)
  const [showSaveGate, setShowSaveGate] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [slug])

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setNotFound(false)
    setArticle(null)
    setSaved(false)

    getArticle(slug)
      .then(res => {
        const a = res.data
        if (!a) {
          setNotFound(true)
          return
        }
        setArticle(a)
        setLikeCount(a.like_count)
        trackView(a.id)
      })
      .catch(() => {
        setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!article?.id) return
    getLikeStatus(article.id)
      .then(res => {
        setLiked(res.data?.liked ?? false)
        if (res.data?.like_count !== undefined) setLikeCount(res.data.like_count)
      })
      .catch(() => {})
  }, [article?.id, isLoggedIn])

  useEffect(() => {
    if (!article?.id) return
    getInitialSaveStatus(article.id, isLoggedIn)
      .then(isSaved => setSaved(isSaved))
      .catch(() => setSaved(false))
  }, [article?.id, isLoggedIn])

  useEffect(() => {
    if (!article) return
    getTrending(4)
      .then(res => {
        const others = (res.data ?? []).filter(a => a.slug !== slug).slice(0, 3)
        setRelated(others)
      })
      .catch(() => setRelated([]))
  }, [article, slug])

  const handleLike = async () => {
    if (!article?.id) return
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikeCount(c => wasLiked ? c - 1 : c + 1)
    try {
      const res = await toggleLike(article.id)
      setLiked(res.data.liked)
      setLikeCount(res.data.like_count)
    } catch {
      setLiked(wasLiked)
      setLikeCount(c => wasLiked ? c + 1 : c - 1)
    }
  }

  const handleSave = async () => {
    if (!article) return

    if (!isLoggedIn) {
      setShowSaveGate(true)
      return
    }

    const wasSaved = saved
    setSaved(!wasSaved)
    setSavePending(true)

    try {
      const result = await toggleSaveArticle(article, true)
      setSaved(result.saved)
    } catch {
      setSaved(wasSaved)
    } finally {
      setSavePending(false)
    }
  }

  if (notFound) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center"
        style={{ background: 'var(--bg)' }}
      >
        <p className="text-6xl">📰</p>
        <h1 className="font-display text-display-xl" style={{ color: 'var(--text-primary)' }}>
          Article not found
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          This article may have been removed or the link is incorrect.
        </p>
        <Link to="/" className="btn-accent mt-2">Back to homepage</Link>
      </div>
    )
  }

  if (loading) return <ArticleSkeleton />
  if (!article) return null

  const articlePath = location.pathname

  return (
    <>
      {/*
        SEO — uses real article data once loaded.
        cover_image from Cloudinary is already an absolute URL so
        SEO.tsx passes it straight through to og:image.
        Falls back to /og-default.png if no cover image.
      */}
      <SEO
        title={article.title}
        description={article.excerpt ?? undefined}
        path={`/article/${article.slug}`}
        ogImage={article.cover_image ?? undefined}
        ogType="article"
        article={{
          publishedTime: article.published_at,
          authorName:    article.author_name,
          section:       article.category_name,
          tags:          article.tags?.map(t => t.name),
        }}
      />

      <ReadingProgress />

      {showSaveGate && (
        <SaveGateModal onClose={() => setShowSaveGate(false)} />
      )}

      <div style={{ background: 'var(--bg)' }}>
        <div className="page-container">

          <nav className="flex items-center gap-2 py-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Link to="/" className="transition-opacity hover:opacity-70">Home</Link>
            <ChevronRight size={12} />
            <Link to={`/category/${article.category_slug}`}
              className="transition-opacity hover:opacity-70">
              {article.category_name}
            </Link>
            <ChevronRight size={12} />
            <span className="truncate max-w-[200px]" style={{ color: 'var(--text-faint)' }}>
              {article.title}
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 pb-16">

            <article>

              <div className="flex items-center gap-2 mb-4">
                {article.is_breaking && (
                  <span className="breaking-strip">● Breaking</span>
                )}
                <Link to={`/category/${article.category_slug}`}
                  className="cat-label transition-opacity hover:opacity-70"
                  style={{ color: article.category_color }}>
                  {article.category_name}
                </Link>
              </div>

              <h1 className="font-display text-display-xl mb-3 leading-tight"
                style={{ color: 'var(--text-primary)' }}>
                {article.title}
              </h1>

              {article.subtitle && (
                <p className="serif-text text-xl mb-5 leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}>
                  {article.subtitle}
                </p>
              )}

              <div
                className="flex flex-wrap items-center gap-x-4 gap-y-1 pb-5 mb-6 text-sm"
                style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}
              >
                <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {article.author_name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={13} />{formatDate(article.published_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={13} />{article.reading_time} min read
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={13} />{formatCount(article.view_count)} views
                </span>
              </div>

              {article.id && (
                <div className="mb-6">
                  <ActionBar
                    article={article}
                    liked={liked}
                    likeCount={likeCount}
                    saved={saved}
                    savePending={savePending}
                    onLike={handleLike}
                    onSave={handleSave}
                  />
                </div>
              )}

              {article.cover_image && (
                <figure className="mb-8 -mx-4 sm:mx-0">
                  <div className="img-zoom sm:rounded-xl overflow-hidden"
                    style={{ aspectRatio: '16/9' }}>
                    <img src={article.cover_image} alt={article.title}
                      className="w-full h-full object-cover" />
                  </div>
                </figure>
              )}

              {article.body ? (
                <div className="article-body prose-article"
                  dangerouslySetInnerHTML={{ __html: article.body }} />
              ) : article.excerpt ? (
                <div className="article-body"><p>{article.excerpt}</p></div>
              ) : null}

              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-10 pt-6"
                  style={{ borderTop: '1px solid var(--border)' }}>
                  {article.tags.map(tag => (
                    <span
                      key={tag.id}
                      className="text-xs font-medium px-3 py-1.5 rounded-full cursor-pointer
                                 transition-opacity hover:opacity-70"
                      style={{
                        background: 'var(--bg-subtle)',
                        color:      'var(--text-muted)',
                        border:     '1px solid var(--border)',
                      }}
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}

              {article.id && (
                <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                  <ActionBar
                    article={article}
                    liked={liked}
                    likeCount={likeCount}
                    saved={saved}
                    savePending={savePending}
                    onLike={handleLike}
                    onSave={handleSave}
                  />
                </div>
              )}

              {article.id && (
                <CommentsSection
                  articleId={article.id}
                  returnPath={articlePath}
                />
              )}

            </article>

            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-8">
                <div>
                  <div className="pb-3 mb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}>
                      Related
                    </span>
                  </div>
                  <div className="space-y-5">
                    {related.map((a, i) => (
                      <Link key={a.id ?? i} to={`/article/${a.slug}`}
                        className="flex gap-3 group">
                        {a.cover_image && (
                          <div className="flex-shrink-0 rounded-lg overflow-hidden img-zoom"
                            style={{ width: '72px', height: '56px' }}>
                            <img src={a.cover_image} alt=""
                              className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="cat-label text-[10px] block mb-1"
                            style={{ color: a.category_color }}>
                            {a.category_name}
                          </span>
                          <p className="text-sm font-medium leading-snug line-clamp-2
                                        transition-opacity group-hover:opacity-70"
                            style={{ color: 'var(--text-primary)' }}>
                            {a.title}
                          </p>
                          <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                            {timeAgo(a.published_at)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="py-6" style={{ borderTop: '1px solid var(--border)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: 'var(--text-muted)' }}>
                    Newsletter
                  </p>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                    Stay informed
                  </p>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Get India's top business and market stories every morning.
                  </p>
                  <Link to="/#newsletter" className="btn-accent text-sm w-full justify-center">
                    Subscribe free
                  </Link>
                </div>
              </div>
            </aside>
          </div>

          {related.length > 0 && (
            <div className="lg:hidden pb-16">
              <div className="pb-3 mb-5" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}>
                  Related stories
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map((a, i) => (
                  <Link key={a.id ?? i} to={`/article/${a.slug}`}
                    className="flex sm:flex-col gap-3 group">
                    {a.cover_image && (
                      <div className="flex-shrink-0 rounded-lg overflow-hidden img-zoom sm:w-full"
                        style={{ width: '80px', height: '64px' }}>
                        <img src={a.cover_image} alt=""
                          className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 sm:mt-2">
                      <span className="cat-label text-[10px] block mb-1"
                        style={{ color: a.category_color }}>
                        {a.category_name}
                      </span>
                      <p className="text-sm font-medium leading-snug line-clamp-2
                                    transition-opacity group-hover:opacity-70"
                        style={{ color: 'var(--text-primary)' }}>
                        {a.title}
                      </p>
                      <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                        {timeAgo(a.published_at)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}