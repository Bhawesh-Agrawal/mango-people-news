import {
  useState, useEffect, useRef, useCallback,
} from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  Clock, Eye, Heart, Bookmark,
  Twitter, Link2, ChevronRight,
  MessageCircle, Send, Trash2, CornerDownRight,
} from 'lucide-react'
import {
  getArticle, getTrending, toggleLike, getLikeStatus,
  trackView, getComments, postComment, deleteComment,
} from '../api/articles'
import type { Comment } from '../api/articles'
import { useAuth }       from '../context/AuthContext'
import type { Article }  from '../types'
import { timeAgo, formatCount, formatDate } from '../lib/utils'
import { SEED_ARTICLES } from '../lib/seed'

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

// ── Action bar ────────────────────────────────────────────────
//
// Samsung S23 fix: fixed height (36px) on every button via inline style.
// Single row — never wraps. Text labels hidden below sm (640px).
// ml-auto on Save is reliable because there is always exactly one row.

function ActionBar({
  article,
  liked,
  likeCount,
  onLike,
}: {
  article:   Article
  liked:     boolean
  likeCount: number
  onLike:    () => void
}) {
  const [copied, setCopied] = useState(false)
  const [saved,  setSaved]  = useState(false)

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

  const baseStyle: React.CSSProperties = {
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
    transition:     'opacity 150ms, background 150ms, border-color 150ms',
    cursor:         'pointer',
    border:         '1px solid var(--border)',
    background:     'var(--bg-subtle)',
    color:          'var(--text-secondary)',
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

      {/* Like */}
      <button
        onClick={onLike}
        style={{
          ...baseStyle,
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

      {/* X / Twitter */}
      <button onClick={shareTwitter} style={baseStyle} title="Share on X" aria-label="Share on X">
        <Twitter size={14} style={{ flexShrink: 0 }} />
        <span className="hidden sm:inline">Share</span>
      </button>

      {/* WhatsApp */}
      <button onClick={shareWhatsApp} style={baseStyle} title="Share on WhatsApp" aria-label="Share on WhatsApp">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="hidden sm:inline">WhatsApp</span>
      </button>

      {/* Copy link */}
      <button
        onClick={copyLink}
        style={{
          ...baseStyle,
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

      {/* Save — marginLeft:auto pushes it to the far right in the single row */}
      <button
        onClick={() => setSaved(v => !v)}
        style={{
          ...baseStyle,
          marginLeft: 'auto',
          ...(saved ? {
            background: 'var(--accent-light)',
            border:     '1px solid var(--accent)',
            color:      'var(--accent)',
          } : {}),
        }}
        title={saved ? 'Saved' : 'Save article'}
        aria-label={saved ? 'Unsave article' : 'Save article'}
      >
        <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} style={{ flexShrink: 0 }} />
        <span className="hidden sm:inline">{saved ? 'Saved' : 'Save'}</span>
      </button>

    </div>
  )
}

// ── Comments section ──────────────────────────────────────────
//
// Rules:
// 1. Textarea is always visible and typeable — never blocked for guests.
// 2. Auth nudge only appears when the user actually clicks "Post" without
//    being logged in — NOT on focus or typing. Let them write first.
// 3. Login/Register links carry ?redirect= so the user returns here after auth.
// 4. Reply button appears below every comment. Clicking it opens an inline
//    reply composer beneath that comment (same gate logic as main form).

function CommentsSection({
  articleId,
  returnPath,
}: {
  articleId:  string
  returnPath: string   // e.g. /article/some-slug — passed in from parent
}) {
  const { user, isLoggedIn, emailVerified } = useAuth()

  const [comments,      setComments]      = useState<Comment[]>([])
  const [loading,       setLoading]       = useState(true)

  // Main new-comment form
  const [body,          setBody]          = useState('')
  const [submitting,    setSubmitting]    = useState(false)
  const [error,         setError]         = useState('')
  const [successMsg,    setSuccessMsg]    = useState('')
  const [showAuthNudge, setShowAuthNudge] = useState(false)

  // Reply state — tracks which comment_id has its reply box open
  const [replyingTo,      setReplyingTo]      = useState<string | null>(null)
  const [replyBody,       setReplyBody]       = useState('')
  const [replySubmitting, setReplySubmitting] = useState(false)
  const [replyError,      setReplyError]      = useState('')
  const [replyAuthNudge,  setReplyAuthNudge]  = useState(false)

  const replyRef = useRef<HTMLTextAreaElement>(null)

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

  // Focus the reply textarea when it opens
  useEffect(() => {
    if (replyingTo) {
      setTimeout(() => replyRef.current?.focus(), 50)
    }
  }, [replyingTo])

  // LoginPage reads redirect destination from location.state.from — not query params.
  // We must pass { state: { from: returnPath } } on the Link, not a ?redirect= param.
  const loginState    = { state: { from: returnPath } }
  const registerState = { state: { from: returnPath } }

  // ── Submit new top-level comment ──────────────────────────
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Show auth nudge only when they try to Post — not before
    if (!isLoggedIn) {
      setShowAuthNudge(true)
      return
    }
    if (!emailVerified) {
      setError('Please verify your email before posting comments.')
      return
    }
    if (!body.trim()) return

    setSubmitting(true)
    setError('')
    setSuccessMsg('')
    setShowAuthNudge(false)

    try {
      const result = await postComment(articleId, body.trim())
      setBody('')
      setSuccessMsg(result.message ?? 'Comment posted')
      setTimeout(() => setSuccessMsg(''), 6000)
      await load()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not post comment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Submit reply ──────────────────────────────────────────
  const submitReply = async (parentId: string) => {
    if (!isLoggedIn) {
      setReplyAuthNudge(true)
      return
    }
    if (!emailVerified) {
      setReplyError('Please verify your email before replying.')
      return
    }
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

  // ── Delete comment ────────────────────────────────────────
  const remove = async (commentId: string) => {
    try {
      await deleteComment(commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch {}
  }

  // ── Auth nudge banner ─────────────────────────────────────
  const AuthNudge = () => (
    <div
      className="flex items-center justify-between mt-2 px-4 py-2.5 rounded-lg"
      style={{ background: 'var(--accent-light)', border: '1px solid rgba(200,130,10,0.25)' }}
    >
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        Sign in to join the discussion.
      </span>
      <div className="flex items-center gap-3 ml-4 flex-shrink-0">
        <Link
          to="/login"
          {...loginState}
          className="text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: 'var(--accent)' }}
        >
          Sign in
        </Link>
        <span style={{ color: 'var(--border)' }}>|</span>
        <Link
          to="/register"
          {...registerState}
          className="text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: 'var(--accent)' }}
        >
          Register
        </Link>
      </div>
    </div>
  )

  return (
    <section className="mt-12">

      {/* Header */}
      <div
        className="flex items-center gap-3 pb-4 mb-6"
        style={{ borderBottom: '2px solid var(--text-primary)' }}
      >
        <MessageCircle size={18} style={{ color: 'var(--text-primary)' }} />
        <h3 className="font-display text-display-sm" style={{ color: 'var(--text-primary)' }}>
          Discussion
        </h3>
        {comments.length > 0 && (
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full ml-1"
            style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
          >
            {comments.length}
          </span>
        )}
      </div>

      {/* ── Main comment form — always visible, always typeable ── */}
      <form onSubmit={submit} className="mb-8">
        <div className="rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--border)' }}>
          <textarea
            value={body}
            onChange={e => {
              setBody(e.target.value)
              // Dismiss nudge once they start typing (they understand, let them write)
              if (showAuthNudge) setShowAuthNudge(false)
            }}
            placeholder="Share your thoughts…"
            rows={3}
            className="w-full px-4 pt-4 pb-2 text-sm resize-none outline-none"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
          />
          <div
            className="flex items-center justify-between px-4 py-2"
            style={{ background: 'var(--bg-subtle)', borderTop: '1px solid var(--border-muted)' }}
          >
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {isLoggedIn
                ? <><span>Posting as </span><strong>{user?.full_name}</strong></>
                : 'Join the discussion'
              }
            </span>
            <button
              type="submit"
              disabled={submitting || (isLoggedIn && !body.trim())}
              className="btn-accent text-sm px-4 py-1.5 flex items-center gap-1.5 disabled:opacity-40"
            >
              <Send size={13} />
              {submitting ? 'Posting…' : 'Post'}
            </button>
          </div>
        </div>

        {/* Auth nudge — only shown after clicking Post without being logged in */}
        {showAuthNudge && <AuthNudge />}

        {/* Email unverified */}
        {isLoggedIn && !emailVerified && (
          <p className="text-xs mt-2" style={{ color: 'var(--breaking)' }}>
            Please verify your email to post comments.
          </p>
        )}

        {error && (
          <p className="text-xs mt-2" style={{ color: 'var(--breaking)' }}>{error}</p>
        )}
        {successMsg && (
          <p className="text-xs mt-2" style={{ color: 'var(--positive, #16a34a)' }}>{successMsg}</p>
        )}
      </form>

      {/* ── Comment list ──────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="flex gap-3">
              <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-32 rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-3/4 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
          No comments yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div className="space-y-8">
          {comments.map(comment => (
            <div key={comment.id}>

              {/* ── Top-level comment ── */}
              <div className="flex gap-3 group">
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center
                             flex-shrink-0 text-xs font-bold overflow-hidden"
                  style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                >
                  {comment.author_avatar
                    ? <img src={comment.author_avatar} alt="" className="w-full h-full object-cover" />
                    : (comment.author_name?.charAt(0) ?? '?').toUpperCase()
                  }
                </div>

                <div className="flex-1 min-w-0">
                  {/* Name + timestamp */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {comment.author_name ?? 'Anonymous'}
                    </span>
                    {comment.is_pinned && (
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm uppercase tracking-wide"
                        style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                      >
                        Pinned
                      </span>
                    )}
                    <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
                      {timeAgo(comment.created_at)}
                    </span>
                  </div>

                  {/* Body */}
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {comment.body}
                  </p>

                  {/* Reply button — shown for everyone, gated on click */}
                  <button
                    onClick={() => {
                      if (replyingTo === comment.id) {
                        // Toggle — clicking Reply again collapses the box
                        setReplyingTo(null)
                        setReplyBody('')
                        setReplyError('')
                        setReplyAuthNudge(false)
                      } else {
                        setReplyingTo(comment.id)
                        setReplyBody('')
                        setReplyError('')
                        setReplyAuthNudge(false)
                      }
                    }}
                    className="mt-2 flex items-center gap-1 text-xs font-medium
                               transition-colors hover:text-[var(--accent)]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <CornerDownRight size={12} />
                    Reply
                  </button>

                  {/* ── Inline reply composer ── */}
                  {replyingTo === comment.id && (
                    <div className="mt-3">
                      <div className="rounded-xl overflow-hidden"
                        style={{ border: '1px solid var(--border)' }}>
                        <textarea
                          ref={replyRef}
                          value={replyBody}
                          onChange={e => {
                            setReplyBody(e.target.value)
                            if (replyAuthNudge) setReplyAuthNudge(false)
                          }}
                          placeholder={`Reply to ${comment.author_name ?? 'this comment'}…`}
                          rows={2}
                          className="w-full px-3 pt-3 pb-2 text-sm resize-none outline-none"
                          style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                        />
                        <div
                          className="flex items-center justify-end gap-2 px-3 py-2"
                          style={{ background: 'var(--bg-subtle)', borderTop: '1px solid var(--border-muted)' }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingTo(null)
                              setReplyBody('')
                              setReplyError('')
                              setReplyAuthNudge(false)
                            }}
                            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                            style={{ color: 'var(--text-muted)', background: 'var(--bg-subtle)' }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => submitReply(comment.id)}
                            disabled={replySubmitting || (isLoggedIn && !replyBody.trim())}
                            className="btn-accent text-xs px-3 py-1.5 flex items-center
                                       gap-1.5 disabled:opacity-40"
                          >
                            <Send size={11} />
                            {replySubmitting ? 'Posting…' : 'Reply'}
                          </button>
                        </div>
                      </div>

                      {/* Reply auth nudge */}
                      {replyAuthNudge && <AuthNudge />}

                      {/* Reply errors */}
                      {replyError && (
                        <p className="text-xs mt-1.5" style={{ color: 'var(--breaking)' }}>
                          {replyError}
                        </p>
                      )}
                      {isLoggedIn && !emailVerified && (
                        <p className="text-xs mt-1.5" style={{ color: 'var(--breaking)' }}>
                          Please verify your email to reply.
                        </p>
                      )}
                    </div>
                  )}

                  {/* ── Existing replies ── */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-4 pl-4"
                      style={{ borderLeft: '2px solid var(--border)' }}>
                      {comment.replies.map(reply => (
                        <div key={reply.id} className="flex gap-3 group/reply">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center
                                       flex-shrink-0 text-[10px] font-bold overflow-hidden"
                            style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
                          >
                            {reply.author_avatar
                              ? <img src={reply.author_avatar} alt="" className="w-full h-full object-cover" />
                              : (reply.author_name?.charAt(0) ?? '?').toUpperCase()
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-semibold"
                                style={{ color: 'var(--text-primary)' }}>
                                {reply.author_name ?? 'Anonymous'}
                              </span>
                              <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
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
                                         p-1 rounded self-start mt-0.5"
                              style={{ color: 'var(--text-faint)' }}
                              title="Delete reply"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Delete top-level comment */}
                {user?.id && (
                  <button
                    onClick={() => remove(comment.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity
                               p-1 rounded self-start mt-1"
                    style={{ color: 'var(--text-faint)' }}
                    title="Delete comment"
                  >
                    <Trash2 size={13} />
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
  const navigate       = useNavigate()
  const location       = useLocation()
  const { isLoggedIn } = useAuth()

  const [article,   setArticle]   = useState<Article | null>(null)
  const [related,   setRelated]   = useState<Article[]>([])
  const [loading,   setLoading]   = useState(true)
  const [liked,     setLiked]     = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [notFound,  setNotFound]  = useState(false)

  const viewTracked = useRef(false)

  // ── FIX: Scroll to top whenever the article slug changes ────
  // This covers: opening a fresh article, clicking a related article link,
  // and navigating back/forward in history to a different article.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [slug])

  // ── Load article ────────────────────────────────────────────
  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setNotFound(false)
    viewTracked.current = false

    getArticle(slug)
      .then(res => {
        const a = res.data
        if (!a) {
          const seed = SEED_ARTICLES.find(s => s.slug === slug)
          if (seed) { setArticle(seed); setLikeCount(seed.like_count) }
          else setNotFound(true)
          return
        }
        setArticle(a)
        setLikeCount(a.like_count)
      })
      .catch(() => {
        const seed = SEED_ARTICLES.find(s => s.slug === slug)
        if (seed) { setArticle(seed); setLikeCount(seed.like_count) }
        else setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [slug])

  // ── Track view ──────────────────────────────────────────────
  useEffect(() => {
    if (!article?.id || viewTracked.current) return
    viewTracked.current = true
    trackView(article.id)
  }, [article?.id])

  // ── Load like status + count ────────────────────────────────
  useEffect(() => {
    if (!article?.id) return
    getLikeStatus(article.id)
      .then(res => {
        setLiked(res.data?.liked ?? false)
        if (res.data?.like_count !== undefined) setLikeCount(res.data.like_count)
      })
      .catch(() => {})
  }, [article?.id, isLoggedIn])

  // ── Related articles ────────────────────────────────────────
  useEffect(() => {
    if (!article) return
    getTrending(4)
      .then(res => {
        const others = (res.data ?? []).filter(a => a.slug !== slug).slice(0, 3)
        setRelated(others.length > 0 ? others : SEED_ARTICLES.slice(0, 3))
      })
      .catch(() => setRelated(SEED_ARTICLES.slice(0, 3)))
  }, [article, slug])

  // ── Handle like ─────────────────────────────────────────────
  const handleLike = async () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
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

  // ── 404 ─────────────────────────────────────────────────────
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
  if (!article)  return null

  // The full path of this article — used to build the login redirect URL
  const articlePath = location.pathname

  return (
    <>
      <ReadingProgress />

      <div style={{ background: 'var(--bg)' }}>
        <div className="page-container">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 py-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Link to="/" className="transition-colors hover:text-[var(--accent)]">Home</Link>
            <ChevronRight size={12} />
            <Link to={`/category/${article.category_slug}`}
              className="transition-colors hover:text-[var(--accent)]">
              {article.category_name}
            </Link>
            <ChevronRight size={12} />
            <span className="truncate max-w-[200px]" style={{ color: 'var(--text-faint)' }}>
              {article.title}
            </span>
          </nav>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 pb-16">

            {/* ══ Article ══ */}
            <article>

              {/* Category + breaking */}
              <div className="flex items-center gap-2 mb-4">
                {article.is_breaking && (
                  <span className="breaking-strip">● Breaking</span>
                )}
                <Link to={`/category/${article.category_slug}`}
                  className="cat-label transition-colors hover:opacity-70"
                  style={{ color: article.category_color }}>
                  {article.category_name}
                </Link>
              </div>

              {/* Headline */}
              <h1 className="font-display text-display-xl mb-3 leading-tight"
                style={{ color: 'var(--text-primary)' }}>
                {article.title}
              </h1>

              {/* Subtitle */}
              {article.subtitle && (
                <p className="serif-text text-xl mb-5 leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}>
                  {article.subtitle}
                </p>
              )}

              {/* Meta row */}
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

              {/* Action bar — top */}
              {article.id && (
                <div className="mb-6">
                  <ActionBar article={article} liked={liked} likeCount={likeCount} onLike={handleLike} />
                </div>
              )}

              {/* Cover image */}
              {article.cover_image && (
                <figure className="mb-8 -mx-4 sm:mx-0">
                  <div className="img-zoom sm:rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                    <img src={article.cover_image} alt={article.title}
                      className="w-full h-full object-cover" />
                  </div>
                </figure>
              )}

              {/* Article body */}
              {article.body ? (
                <div className="article-body prose-article"
                  dangerouslySetInnerHTML={{ __html: article.body }} />
              ) : article.excerpt ? (
                <div className="article-body"><p>{article.excerpt}</p></div>
              ) : null}

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-10 pt-6"
                  style={{ borderTop: '1px solid var(--border)' }}>
                  {article.tags.map(tag => (
                    <span
                      key={tag.id}
                      className="text-xs font-medium px-3 py-1.5 rounded-full cursor-pointer
                                 transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Action bar — bottom */}
              {article.id && (
                <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                  <ActionBar article={article} liked={liked} likeCount={likeCount} onLike={handleLike} />
                </div>
              )}

              {/* Author card */}
              <div className="mt-10 p-5 rounded-xl flex gap-4 items-center"
                style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center
                             text-lg font-bold flex-shrink-0 overflow-hidden"
                  style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                >
                  {article.author_avatar
                    ? <img src={article.author_avatar} alt="" className="w-full h-full object-cover" />
                    : (article.author_name?.charAt(0) ?? '?').toUpperCase()
                  }
                </div>
                <div>
                  <p className="text-xs mb-0.5 section-label">Written by</p>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {article.author_name ?? 'Mango People News'}
                  </p>
                </div>
              </div>

              {/* Comments */}
              {article.id && (
                <CommentsSection
                  articleId={article.id}
                  returnPath={articlePath}
                />
              )}

            </article>

            {/* ══ Sidebar ══ */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-8">

                <div>
                  <div className="flex items-center gap-2 pb-3 mb-4"
                    style={{ borderBottom: '2px solid var(--text-primary)' }}>
                    <span className="section-label">Related</span>
                  </div>
                  <div className="space-y-5">
                    {related.map((a, i) => (
                      <Link key={a.id ?? i} to={`/article/${a.slug}`} className="flex gap-3 group">
                        {a.cover_image && (
                          <div className="flex-shrink-0 rounded-lg overflow-hidden img-zoom"
                            style={{ width: '72px', height: '60px' }}>
                            <img src={a.cover_image} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="cat-label text-[10px] block mb-1"
                            style={{ color: a.category_color }}>
                            {a.category_name}
                          </span>
                          <p className="text-sm font-medium leading-snug line-clamp-2 transition-colors
                                        group-hover:text-[var(--accent)]"
                            style={{ color: 'var(--text-primary)' }}>
                            {a.title}
                          </p>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                            {timeAgo(a.published_at)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-xl"
                  style={{ background: 'var(--accent-light)', border: '1px solid rgba(200,130,10,0.2)' }}>
                  <p className="section-label mb-2">Newsletter</p>
                  <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
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

          {/* Mobile related */}
          {related.length > 0 && (
            <div className="lg:hidden pb-16">
              <div className="flex items-center gap-2 pb-3 mb-5"
                style={{ borderBottom: '2px solid var(--text-primary)' }}>
                <span className="section-label">Related stories</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map((a, i) => (
                  <Link key={a.id ?? i} to={`/article/${a.slug}`}
                    className="flex sm:flex-col gap-3 group">
                    {a.cover_image && (
                      <div className="flex-shrink-0 rounded-lg overflow-hidden img-zoom sm:w-full"
                        style={{ width: '80px', height: '68px' }}>
                        <img src={a.cover_image} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 sm:mt-2">
                      <span className="cat-label text-[10px] block mb-1"
                        style={{ color: a.category_color }}>
                        {a.category_name}
                      </span>
                      <p className="text-sm font-medium leading-snug line-clamp-2 transition-colors
                                    group-hover:text-[var(--accent)]"
                        style={{ color: 'var(--text-primary)' }}>
                        {a.title}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
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
