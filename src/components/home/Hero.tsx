import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Eye, ArrowRight } from 'lucide-react'
import { getHomeFeed } from '../../api/articles'
import type { Article } from '../../types'
import { SEED_ARTICLES } from '../../lib/seed'
import { timeAgo, formatCount } from '../../lib/utils'

// ── Sort logic ────────────────────────────────────────────────────
// Breaking first → featured → recent
const sortArticles = (articles: Article[]): Article[] => {
  return [...articles].sort((a, b) => {
    if (a.is_breaking && !b.is_breaking) return -1
    if (!a.is_breaking && b.is_breaking) return 1
    if (a.is_featured && !b.is_featured) return -1
    if (!a.is_featured && b.is_featured) return 1
    return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  })
}

// ── Skeleton ──────────────────────────────────────────────────────
function HeroSkeleton() {
  return (
    <div className="page-container py-2 md:py-6">
      <div className="md:hidden space-y-3">
        <div className="skeleton rounded-xl w-full" style={{ height: '260px' }} />
        <div className="flex gap-3">
          {[1,2,3].map(n => (
            <div key={n} className="skeleton rounded-xl flex-shrink-0"
                 style={{ width: '160px', height: '120px' }} />
          ))}
        </div>
      </div>
      <div className="hidden md:grid md:grid-cols-3 gap-4"
           style={{ height: '520px' }}>
        <div className="col-span-2 skeleton rounded-2xl h-full" />
        <div className="flex flex-col gap-4 h-full">
          {[1,2,3].map(n => (
            <div key={n} className="flex-1 skeleton rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Gradient overlay — strong enough for any image ────────────────
const GRADIENT = 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.15) 70%, transparent 100%)'
const GRADIENT_SMALL = 'linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)'

// ── Text shadow for guaranteed readability ────────────────────────
const TEXT_SHADOW = '0 1px 8px rgba(0,0,0,0.8), 0 2px 20px rgba(0,0,0,0.5)'

export default function Hero() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    getHomeFeed()
      .then(res => {
        const data = res.data?.length > 0 ? res.data : SEED_ARTICLES
        setArticles(sortArticles(data))
      })
      .catch(() => setArticles(sortArticles(SEED_ARTICLES)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <HeroSkeleton />
  if (articles.length === 0) return null

  const main      = articles[0]
  const secondary = articles.slice(1, 4)

  return (
    <section className="page-container py-2 md:py-6">

      {/* ════════════════════════════════════════
          DESKTOP LAYOUT
      ════════════════════════════════════════ */}
      <div className="hidden md:grid md:grid-cols-3 md:gap-4"
           style={{ height: '520px' }}>

        {/* Main hero — 2 cols */}
        <Link
          to={`/article/${main.slug}`}
          className="col-span-2 relative rounded-2xl overflow-hidden
                     group block h-full"
          style={{ background: 'var(--bg-muted)' }}
        >
          {main.cover_image && (
            <img
              src={`${main.cover_image}&w=900&q=75`}
              alt={main.title}
              loading="eager"
              fetchPriority="high"
              className="absolute inset-0 w-full h-full object-cover
                         transition-transform duration-700 group-hover:scale-105"
            />
          )}

          {/* Strong gradient — works on any image */}
          <div className="absolute inset-0" style={{ background: GRADIENT }} />

          {/* Watermark text */}
          <div className="absolute inset-0 flex items-center justify-center
                          pointer-events-none overflow-hidden">
            <span
              className="font-display font-black uppercase select-none
                         whitespace-nowrap"
              style={{
                fontSize:      'clamp(72px, 12vw, 140px)',
                letterSpacing: '-0.04em',
                color:         'rgba(255,255,255,0.045)',
                lineHeight:    '1',
              }}
            >
              {main.category_name}
            </span>
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2.5">
            <div className="flex items-center gap-2">
              {main.is_breaking && (
                <span className="breaking-strip">● Breaking</span>
              )}
              {/* Consistent white category label — no per-category colour */}
              <span
                className="cat-label"
                style={{ color: 'rgba(255,255,255,0.75)' }}
              >
                {main.category_name}
              </span>
            </div>

            <h1
              className="font-display font-black text-white leading-none
                         tracking-tight group-hover:text-[var(--accent)]
                         transition-colors duration-200"
              style={{
                fontSize:   'clamp(22px, 2.6vw, 36px)',
                textShadow: TEXT_SHADOW,
              }}
            >
              {main.title}
            </h1>

            {main.subtitle && (
              <p
                className="text-sm leading-relaxed line-clamp-2 max-w-xl"
                style={{
                  color:      'rgba(255,255,255,0.72)',
                  textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                }}
              >
                {main.subtitle}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs"
                 style={{ color: 'rgba(255,255,255,0.55)' }}>
              <span
                className="font-semibold"
                style={{ color: 'rgba(255,255,255,0.8)' }}
              >
                {main.author_name}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {timeAgo(main.published_at)}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={11} />
                {formatCount(main.view_count)}
              </span>
              <span>{main.reading_time} min read</span>
            </div>
          </div>
        </Link>

        {/* Secondary — 1 col stacked */}
        <div className="flex flex-col gap-4 h-full">
          {secondary.map((article) => (
            <Link
              key={article.id}
              to={`/article/${article.slug}`}
              className="flex-1 relative rounded-xl overflow-hidden group block"
              style={{ background: 'var(--bg-muted)' }}
            >
              {article.cover_image && (
                <img
                  src={`${article.cover_image}&w=400&q=70`}
                  alt={article.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover
                             transition-transform duration-500
                             group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0"
                   style={{ background: GRADIENT_SMALL }} />

              <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
                <span
                  className="cat-label"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  {article.category_name}
                </span>
                <h3
                  className="font-display font-bold text-white leading-tight
                             text-[15px] group-hover:text-[var(--accent)]
                             transition-colors line-clamp-2"
                  style={{ textShadow: TEXT_SHADOW }}
                >
                  {article.title}
                </h3>
                <p className="text-[11px]"
                   style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {timeAgo(article.published_at)} · {article.reading_time} min
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════
          MOBILE LAYOUT
      ════════════════════════════════════════ */}
      <div className="md:hidden space-y-3">

        {/* Main card — no top margin */}
        <Link
          to={`/article/${main.slug}`}
          className="block relative rounded-xl overflow-hidden group"
          style={{ height: '260px', background: 'var(--bg-muted)' }}
        >
          {main.cover_image && (
            <img
              src={`${main.cover_image}&w=800&q=75`}
              alt={main.title}
              loading="eager"
              fetchPriority="high"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Strong gradient */}
          <div className="absolute inset-0" style={{ background: GRADIENT }} />

          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center
                          pointer-events-none overflow-hidden">
            <span
              className="font-display font-black uppercase select-none
                         whitespace-nowrap"
              style={{
                fontSize:      '88px',
                letterSpacing: '-0.04em',
                color:         'rgba(255,255,255,0.045)',
                lineHeight:    '1',
              }}
            >
              {main.category_name}
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1.5">
            <div className="flex items-center gap-2">
              {main.is_breaking && (
                <span className="breaking-strip">● Breaking</span>
              )}
              <span
                className="cat-label"
                style={{ color: 'rgba(255,255,255,0.75)' }}
              >
                {main.category_name}
              </span>
            </div>
            <h1
              className="font-display text-[22px] font-black text-white
                         leading-tight tracking-tight line-clamp-3"
              style={{ textShadow: TEXT_SHADOW }}
            >
              {main.title}
            </h1>
            <div className="flex items-center gap-3 text-xs"
                 style={{ color: 'rgba(255,255,255,0.55)' }}>
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {timeAgo(main.published_at)}
              </span>
              <span>{main.reading_time} min read</span>
              <span className="flex items-center gap-1">
                <Eye size={10} />
                {formatCount(main.view_count)}
              </span>
            </div>
          </div>
        </Link>

        {/* Secondary — horizontal scroll */}
        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4">
          {secondary.map(article => (
            <Link
              key={article.id}
              to={`/article/${article.slug}`}
              className="flex-shrink-0 relative rounded-xl overflow-hidden group"
              style={{
                width:      '158px',
                height:     '118px',
                background: 'var(--bg-muted)',
              }}
            >
              {article.cover_image && (
                <img
                  src={`${article.cover_image}&w=320&q=65`}
                  alt={article.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0"
                   style={{ background: GRADIENT_SMALL }} />
              <div className="absolute bottom-0 left-0 right-0 p-2.5">
                <span
                  className="cat-label text-[9px] block mb-0.5"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  {article.category_name}
                </span>
                <p
                  className="text-white text-[11px] font-bold
                             leading-tight line-clamp-2"
                  style={{ textShadow: TEXT_SHADOW }}
                >
                  {article.title}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* View all */}
        <Link
          to="/articles"
          className="flex items-center justify-center gap-1.5 w-full
                     py-2.5 rounded-xl text-xs font-bold tracking-wide
                     uppercase btn-ghost"
        >
          View All Stories
          <ArrowRight size={13} />
        </Link>
      </div>
    </section>
  )
}