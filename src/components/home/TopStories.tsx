import { Link } from 'react-router-dom'
import { Clock, Eye, TrendingUp } from 'lucide-react'
import { useArticles } from '../../hooks/useArticles'
import { useTrending } from '../../hooks/useTrending'
import { timeAgo, formatCount } from '../../lib/utils'
import type { Article } from '../../types'

function ArticleCard({ article, size = 'normal' }: {
  article: Article
  size?:   'large' | 'normal' | 'small'
}) {
  return (
    <Link
      to={`/article/${article.slug}`}
      className="group flex flex-col"
      style={{
        borderBottom:  '1px solid var(--border-muted)',
        paddingBottom: '16px',
        marginBottom:  '16px',
      }}
    >
      {size !== 'small' && article.cover_image && (
        <div
          className="w-full rounded-xl overflow-hidden mb-3 flex-shrink-0"
          style={{ height: size === 'large' ? '220px' : '160px' }}
        >
          <img
            src={article.cover_image}
            alt=""
            className="w-full h-full object-cover transition-transform
                       duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}

      <div className="flex gap-3">
        {size === 'small' && article.cover_image && (
          <div
            className="flex-shrink-0 rounded-lg overflow-hidden"
            style={{ width: '80px', height: '68px' }}
          >
            <img
              src={article.cover_image}
              alt=""
              className="w-full h-full object-cover transition-transform
                         duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <span
            className="cat-label text-[10px] block mb-1.5"
            style={{ color: article.category_color }}
          >
            {article.category_name}
          </span>

          <h3
            className={`font-display font-bold leading-tight tracking-tight
                        transition-colors duration-150
                        group-hover:text-[var(--accent)]
                        ${size === 'large'
                          ? 'text-xl md:text-2xl'
                          : size === 'normal'
                          ? 'text-base md:text-lg'
                          : 'text-sm'
                        }`}
            style={{ color: 'var(--text-primary)' }}
          >
            {article.title}
          </h3>

          {size !== 'small' && article.excerpt && (
            <p
              className="text-sm leading-relaxed mt-1.5 line-clamp-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              {article.excerpt}
            </p>
          )}

          <div
            className="flex items-center gap-2 mt-2 text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            <span
              className="font-semibold"
              style={{ color: 'var(--text-secondary)' }}
            >
              {article.author_name}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {timeAgo(article.published_at)}
            </span>
            <span>·</span>
            <span>{article.reading_time} min</span>
            {article.view_count > 500 && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Eye size={10} />
                  {formatCount(article.view_count)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

function TrendingItem({ article, rank }: {
  article: Article
  rank:    number
}) {
  return (
    <Link
      to={`/article/${article.slug}`}
      className="flex gap-3 group py-3"
      style={{ borderBottom: '1px solid var(--border-muted)' }}
    >
      <span
        className="font-display text-3xl font-black leading-none
                   flex-shrink-0 w-7 pt-0.5 select-none"
        style={{ color: rank <= 3 ? 'var(--accent)' : 'var(--border)' }}
      >
        {rank}
      </span>

      <div className="flex-1 min-w-0">
        <span
          className="cat-label text-[10px] block mb-1"
          style={{ color: article.category_color }}
        >
          {article.category_name}
        </span>
        <p
          className="text-sm font-bold leading-snug line-clamp-2
                     transition-colors duration-150
                     group-hover:text-[var(--accent)]"
          style={{ color: 'var(--text-primary)' }}
        >
          {article.title}
        </p>
        <div
          className="flex items-center gap-2 mt-1.5 text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          <span className="flex items-center gap-1">
            <Eye size={10} />
            {formatCount(article.view_count)}
          </span>
          <span>·</span>
          <span>{timeAgo(article.published_at)}</span>
        </div>
      </div>
    </Link>
  )
}

function TopStoriesSkeleton() {
  return (
    <div className="page-container py-6">
      <div className="skeleton h-20 w-80 rounded mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          {[1,2,3,4].map(n => (
            <div
              key={n}
              className="space-y-2 pb-4"
              style={{ borderBottom: '1px solid var(--border-muted)' }}
            >
              <div className="skeleton h-40 w-full rounded-xl" />
              <div className="skeleton h-3 w-20 rounded" />
              <div className="skeleton h-5 w-full rounded" />
              <div className="skeleton h-5 w-4/5 rounded" />
              <div className="skeleton h-3 w-32 rounded" />
            </div>
          ))}
        </div>
        <div>
          <div className="skeleton h-10 w-full rounded-t-xl" />
          {[1,2,3,4,5,6].map(n => (
            <div
              key={n}
              className="flex gap-3 py-3"
              style={{ borderBottom: '1px solid var(--border-muted)' }}
            >
              <div className="skeleton w-7 h-8 rounded flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-16 rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-3/4 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function TopStories() {
  const { articles: latest,           loading: l1 } = useArticles({ limit: 8 })
  const { articles: trendingArticles, loading: l2 } = useTrending(6)

  if (l1 || l2) return <TopStoriesSkeleton />
  if (latest.length === 0) return null

  const stories  = latest.slice(1)
  const featured = stories[0]
  const rest     = stories.slice(1)

  return (
    <section className="page-container py-4 md:py-6">

      {/* ── Heading ── */}
      <div
        className="mb-6 pb-4"
        style={{ borderBottom: '3px solid var(--border)' }}
      >
        <h2
          className="font-display font-black uppercase leading-none"
          style={{
            fontSize:      'clamp(52px, 10vw, 96px)',
            letterSpacing: '0.08em',
            color:         'var(--text-primary)',
          }}
        >
          Top Stories
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-8">

        {/* ── Left: article grid ──────────────────── */}
        <div className="md:col-span-2">
          {featured && (
            <ArticleCard article={featured} size="large" />
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            {rest.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                size="normal"
              />
            ))}
          </div>
        </div>

        {/* ── Right: trending sidebar ─────────────── */}
        <div className="hidden md:block">
          <div
            className="sticky top-20 rounded-2xl overflow-hidden"
            style={{
              background: 'var(--bg-surface)',
              border:     '1px solid var(--border)',
            }}
          >
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <TrendingUp size={14} style={{ color: 'var(--accent)' }} />
              <span className="section-label">Trending Now</span>
            </div>

            <div className="px-4">
              {trendingArticles.map((article, i) => (
                <TrendingItem
                  key={article.id}
                  article={article}
                  rank={i + 1}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}