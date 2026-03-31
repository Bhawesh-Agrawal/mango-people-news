/**
 * SavedPage.tsx — /saved
 *
 * Logged-in users: reads from GET /users/me/saved (persisted in DB)
 * Guest users:     reads from localStorage key 'mpn_saved_articles'
 *                  with a clear warning that it's ephemeral
 *
 * The ActionBar "Save" button in ArticlePage should call saveSavedArticle()
 * from this module's shared util (exported below) — it handles both cases.
 */

import { useState, useEffect }  from 'react'
import { Link }                  from 'react-router-dom'
import { Bookmark, Trash2, Clock, Eye, AlertTriangle } from 'lucide-react'
import { useAuth }    from '../context/AuthContext'
import { client }     from '../api/client'
import type { Article } from '../types'
import { timeAgo, formatCount } from '../lib/utils'

const LOCAL_SAVED_KEY = 'mpn_saved_articles'

// ── Shared save utility — import this in ArticlePage ActionBar ─
// Handles both guest (localStorage) and authenticated (API) saves.

export async function toggleSaveArticle(
  article:    Article,
  isLoggedIn: boolean,
): Promise<{ saved: boolean }> {
  if (isLoggedIn) {
    try {
      // Check current status
      const statusRes = await client.get(`/users/me/saved/${article.id}/status`)
      const isSaved   = statusRes.data?.data?.saved ?? false

      if (isSaved) {
        await client.delete(`/users/me/saved/${article.id}`)
        return { saved: false }
      } else {
        await client.post('/users/me/saved', { article_id: article.id })
        return { saved: true }
      }
    } catch {
      return { saved: false }
    }
  } else {
    // Guest — use localStorage
    try {
      const stored: Article[] = JSON.parse(
        localStorage.getItem(LOCAL_SAVED_KEY) ?? '[]'
      )
      const exists = stored.some(a => a.id === article.id)
      if (exists) {
        const updated = stored.filter(a => a.id !== article.id)
        localStorage.setItem(LOCAL_SAVED_KEY, JSON.stringify(updated))
        return { saved: false }
      } else {
        // Store minimal article data to keep localStorage small
        const minimal: Partial<Article> = {
          id:            article.id,
          slug:          article.slug,
          title:         article.title,
          cover_image:   article.cover_image,
          excerpt:       article.excerpt,
          category_name: article.category_name,
          category_color: article.category_color,
          category_slug: article.category_slug,
          author_name:   article.author_name,
          published_at:  article.published_at,
          reading_time:  article.reading_time,
          view_count:    article.view_count,
        }
        localStorage.setItem(
          LOCAL_SAVED_KEY,
          JSON.stringify([...stored, minimal])
        )
        return { saved: true }
      }
    } catch {
      return { saved: false }
    }
  }
}

export async function getInitialSaveStatus(
  articleId:  string,
  isLoggedIn: boolean,
): Promise<boolean> {
  if (isLoggedIn) {
    try {
      const res = await client.get(`/users/me/saved/${articleId}/status`)
      return res.data?.data?.saved ?? false
    } catch {
      return false
    }
  } else {
    try {
      const stored: Article[] = JSON.parse(
        localStorage.getItem(LOCAL_SAVED_KEY) ?? '[]'
      )
      return stored.some(a => a.id === articleId)
    } catch {
      return false
    }
  }
}

// ── Page component ────────────────────────────────────────────

export default function SavedPage() {
  const { isLoggedIn } = useAuth()

  const [articles,   setArticles]   = useState<Article[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [isGuest,    setIsGuest]    = useState(false)

  useEffect(() => {
    if (isLoggedIn) {
      setIsGuest(false)
      client
        .get('/users/me/saved')
        .then(res => setArticles(res.data?.data ?? []))
        .catch(err => {
          if (err?.response?.status === 404) {
            setArticles([]) // endpoint not built yet — silent empty state
          } else {
            setError('Could not load saved articles. Please try again.')
          }
        })
        .finally(() => setLoading(false))
    } else {
      // Guest — read from localStorage
      setIsGuest(true)
      try {
        const stored: Article[] = JSON.parse(
          localStorage.getItem(LOCAL_SAVED_KEY) ?? '[]'
        )
        setArticles(stored)
      } catch {
        setArticles([])
      }
      setLoading(false)
    }
  }, [isLoggedIn])

  const handleRemove = async (articleId: string) => {
    if (isLoggedIn) {
      try {
        await client.delete(`/users/me/saved/${articleId}`)
      } catch {}
    } else {
      try {
        const stored: Article[] = JSON.parse(
          localStorage.getItem(LOCAL_SAVED_KEY) ?? '[]'
        )
        localStorage.setItem(
          LOCAL_SAVED_KEY,
          JSON.stringify(stored.filter(a => a.id !== articleId))
        )
      } catch {}
    }
    setArticles(prev => prev.filter(a => a.id !== articleId))
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="page-container py-8 max-w-2xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Bookmark size={22} style={{ color: 'var(--accent)' }} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}>
              Saved Articles
            </h1>
            {articles.length > 0 && (
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {articles.length} {articles.length === 1 ? 'article' : 'articles'}
              </p>
            )}
          </div>
        </div>

        {/* Guest warning banner */}
        {isGuest && articles.length > 0 && (
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-xl mb-6 text-sm"
            style={{
              background: 'rgba(200,130,10,0.08)',
              border:     '1px solid rgba(200,130,10,0.2)',
              color:      'var(--text-secondary)',
            }}
          >
            <AlertTriangle
              size={16}
              className="flex-shrink-0 mt-0.5"
              style={{ color: 'var(--accent)' }}
            />
            <span>
              Your saves are stored in this browser only and will be lost if you
              clear your browser data.{' '}
              <Link
                to="/register"
                className="font-semibold hover:underline"
                style={{ color: 'var(--accent)' }}
              >
                Create a free account
              </Link>{' '}
              to save articles permanently across all your devices.
            </span>
          </div>
        )}

        {/* Guest — no saves yet */}
        {isGuest && articles.length === 0 && !loading && (
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-xl mb-6 text-sm"
            style={{
              background: 'var(--bg-subtle)',
              border:     '1px solid var(--border)',
              color:      'var(--text-secondary)',
            }}
          >
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5"
              style={{ color: 'var(--text-muted)' }} />
            <span>
              You're not signed in. Saves will be stored locally in this browser.{' '}
              <Link to="/register" className="font-semibold hover:underline"
                style={{ color: 'var(--accent)' }}>
                Sign up free
              </Link>{' '}
              to sync across devices.
            </span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(n => (
              <div key={n} className="flex gap-4 p-4 rounded-2xl animate-pulse"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div className="skeleton rounded-xl flex-shrink-0"
                  style={{ width: '88px', height: '66px' }} />
                <div className="flex-1 space-y-2 py-1">
                  <div className="skeleton h-3 w-20 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-3 w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm py-4" style={{ color: 'var(--breaking)' }}>{error}</p>
        )}

        {/* Articles */}
        {!loading && articles.length > 0 && (
          <div className="space-y-3">
            {articles.map(article => (
              <SavedCard
                key={article.id}
                article={article}
                onRemove={() => handleRemove(article.id)}
              />
            ))}
          </div>
        )}

        {/* Empty state (logged in, no saves) */}
        {!loading && !isGuest && articles.length === 0 && !error && (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center
                            mx-auto mb-5"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <Bookmark size={24} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h2 className="text-lg font-bold mb-2"
              style={{ color: 'var(--text-primary)' }}>
              Nothing saved yet
            </h2>
            <p className="text-sm max-w-xs mx-auto mb-6"
              style={{ color: 'var(--text-muted)' }}>
              Tap the bookmark icon on any article to save it here.
            </p>
            <Link to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                         text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ background: 'var(--accent)', color: '#ffffff' }}>
              Browse articles
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}

// ── Saved article card ────────────────────────────────────────

function SavedCard({
  article, onRemove,
}: {
  article:  Article
  onRemove: () => void
}) {
  const [removing, setRemoving] = useState(false)

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    setRemoving(true)
    onRemove()
  }

  return (
    <div
      className="group flex items-start gap-4 p-4 rounded-2xl transition-all duration-200"
      style={{
        background: 'var(--bg-surface)',
        border:     '1px solid var(--border)',
        opacity:    removing ? 0.4 : 1,
      }}
    >
      <Link to={`/article/${article.slug}`} className="flex-shrink-0">
        <div className="rounded-xl overflow-hidden"
          style={{ width: '88px', height: '66px' }}>
          {article.cover_image ? (
            <img src={article.cover_image} alt=""
              className="w-full h-full object-cover transition-transform
                         duration-300 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: 'var(--bg-subtle)' }}>
              <span className="text-xl opacity-20">📰</span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={`/article/${article.slug}`}>
          {article.category_name && (
            <span className="text-[10px] font-bold uppercase tracking-wider block mb-1"
              style={{ color: article.category_color ?? 'var(--accent)' }}>
              {article.category_name}
            </span>
          )}
          <h2 className="text-sm font-semibold leading-snug line-clamp-2 mb-2
                         transition-colors hover:text-[var(--accent)]"
            style={{ color: 'var(--text-primary)' }}>
            {article.title}
          </h2>
        </Link>
        <div className="flex items-center flex-wrap gap-3 text-[11px]"
          style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1">
            <Clock size={10} />{timeAgo(article.published_at)}
          </span>
          {article.reading_time && (
            <span>{article.reading_time} min read</span>
          )}
          {(article.view_count ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <Eye size={10} />{formatCount(article.view_count!)}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={handleRemove}
        disabled={removing}
        className="flex-shrink-0 p-2 rounded-lg opacity-0 group-hover:opacity-100
                   transition-all hover:bg-[var(--bg-subtle)]"
        style={{ color: 'var(--text-muted)' }}
        title="Remove"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}