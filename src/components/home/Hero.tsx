import { Link } from 'react-router-dom'
import { Clock, Eye, ArrowRight, BookOpen, Sparkles } from 'lucide-react'
import { useArticles } from '../../hooks/useArticles'
import { timeAgo, formatCount, truncate } from '../../lib/utils'
import type { Article } from '../../types'

// ── Cloudinary URL optimizer ───────────────────────────────────────
// Injects w, h, f_auto, q_auto transforms into Cloudinary URLs.
// Safe to call on any URL — returns original if not Cloudinary.
function cloudinaryUrl(url: string, width: number, height: number): string {
  if (!url || !url.includes('res.cloudinary.com')) return url
  return url.replace(
    '/image/upload/',
    `/image/upload/w_${width},h_${height},c_fill,f_auto,q_auto/`
  )
}

// ── Skeleton ──────────────────────────────────────────────────────
function HeroSkeleton() {
  return (
    <div>
      {/* Mobile skeleton */}
      <div className="md:hidden">
        <div className="px-4 pt-4 space-y-3">
          <div className="skeleton h-3 w-24 rounded" />
          <div className="skeleton h-7 w-full rounded" />
          <div className="skeleton h-7 w-4/5 rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-3/4 rounded" />
        </div>
        <div className="skeleton h-56 w-full mt-4" />
        <div className="px-4 pt-4 space-y-3">
          {[1,2,3,4,5].map(n => (
            <div key={n} className="flex gap-3 py-2">
              <div className="skeleton w-[72px] h-16 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-2.5 w-16 rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-4/5 rounded" />
                <div className="skeleton h-2.5 w-24 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop skeleton */}
      <div className="hidden md:block page-container py-6">
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 space-y-4">
            <div className="skeleton h-5 w-24 rounded" />
            <div className="skeleton h-10 w-full rounded" />
            <div className="skeleton h-10 w-3/4 rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-5/6 rounded" />
            <div className="skeleton h-[340px] w-full rounded-2xl" />
          </div>
          <div className="space-y-0">
            <div className="skeleton h-10 w-full rounded-t-2xl" />
            {[1,2,3,4,5].map(n => (
              <div key={n} className="flex gap-3 py-3 px-4 border-b"
                style={{ borderColor: 'var(--border-muted)' }}
              >
                <div className="skeleton w-[72px] h-16 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="skeleton h-2.5 w-16 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-4 w-4/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── AI Summary row — integrated style ──────────────────────────
function AISummaryRow({ article }: { article: Article }) {
  // Only show if article has AI summary and is from today or yesterday
  const publishedDate = new Date(article.published_at)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const todayStart = new Date(today)
  todayStart.setHours(0, 0, 0, 0)
  const yesterdayStart = new Date(yesterday)
  yesterdayStart.setHours(0, 0, 0, 0)

  const isRecent = publishedDate >= yesterdayStart

  if (!article.ai_summary || !isRecent) return null

  return (
    <Link
      to={`/article/${article.slug}`}
      className="flex gap-3 group py-2"
    >
      {/* AI indicator */}
      <div className="flex-shrink-0 mt-0.5">
        <div
          className="w-3 h-3 rounded-full flex items-center justify-center"
          style={{ background: 'var(--accent)' }}
        >
          <Sparkles size={8} style={{ color: '#fff' }} />
        </div>
      </div>

      {/* Text — compact layout */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-bold leading-snug line-clamp-2
                     transition-colors duration-150
                     group-hover:text-[var(--accent)]"
          style={{ color: 'var(--text-primary)' }}
        >
          {article.title}
        </p>
        <p
          className="text-xs leading-relaxed mt-1 line-clamp-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          {truncate(article.ai_summary, 30)}
        </p>
      </div>
    </Link>
  )
}

// ── Main ──────────────────────────────────────────────────────────
export default function Hero() {
  const { articles, loading } = useArticles({ limit: 15 }) // Get more articles for AI summaries

  if (loading) return <HeroSkeleton />
  if (articles.length === 0) return null

  const main = articles[0]
  const list = articles.slice(1, 7)

  // Filter AI summary articles from recent articles
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const todayStart = new Date(today)
  todayStart.setHours(0, 0, 0, 0)
  const yesterdayStart = new Date(yesterday)
  yesterdayStart.setHours(0, 0, 0, 0)

  const aiSummaryArticles = articles.filter(article => {
    if (!article.ai_summary) return false
    const publishedDate = new Date(article.published_at)
    return publishedDate >= yesterdayStart
  }).slice(0, 3) // Limit to 3 AI summaries

  // Combine regular articles and AI summaries for highlights
  const highlights = [...list.slice(0, 4), ...aiSummaryArticles].slice(0, 6)

  return (
    <section>

      {/* ════════════════════════════════════════════
          MOBILE
      ════════════════════════════════════════════ */}
      <div className="md:hidden">

        {/* Text block — above image */}
        <div
          className="px-4 pt-5 pb-4 space-y-3"
          style={{ background: 'var(--bg-surface)' }}
        >
          {/* Badges */}
          <div className="flex items-center gap-2">
            {main.is_breaking && (
              <span className="breaking-strip">● Breaking</span>
            )}
            <span
              className="cat-label"
              style={{ color: main.category_color }}
            >
              {main.category_name}
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-display font-black leading-tight tracking-tight"
            style={{
              fontSize: 'clamp(24px, 7vw, 32px)',
              color:    'var(--text-primary)',
            }}
          >
            {main.title}
          </h1>

          {/* Subtitle or excerpt */}
          {(main.subtitle || main.excerpt) && (
            <p
              className="text-sm leading-relaxed line-clamp-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              {main.subtitle || truncate(main.excerpt, 28)}
            </p>
          )}

          {/* Meta */}
          <div
            className="flex items-center gap-3 text-xs pt-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            <span
              className="font-semibold"
              style={{ color: 'var(--text-secondary)' }}
            >
              {main.author_name}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {timeAgo(main.published_at)}
            </span>
            <span>{main.reading_time} min read</span>
            {main.view_count > 0 && (
              <span className="flex items-center gap-1">
                <Eye size={10} />
                {formatCount(main.view_count)}
              </span>
            )}
          </div>
        </div>

        {/* Cover image — full bleed, button inside */}
        {/* LCP image: eager + high priority, no lazy */}
        <Link
          to={`/article/${main.slug}`}
          className="block w-full relative overflow-hidden group"
          style={{ height: '220px' }}
        >
          {main.cover_image
            ? <img
                src={cloudinaryUrl(main.cover_image, 800, 440)}
                alt={main.title}
                className="w-full h-full object-cover transition-transform
                           duration-700 group-hover:scale-105"
                loading="eager"
                fetchPriority="high"
                width={800}
                height={440}
              />
            : <div
                className="w-full h-full"
                style={{ background: 'var(--bg-muted)' }}
              />
          }

          {/* Watermark */}
          <div
            className="absolute inset-0 flex items-center justify-center
                       pointer-events-none overflow-hidden"
          >
            <span
              className="font-display font-bold uppercase
                         select-none whitespace-nowrap"
              style={{
                fontSize:      '100px',
                letterSpacing: '-0.04em',
                color:         'rgba(255,255,255,0.06)',
                lineHeight:    '1',
              }}
            >
              {main.category_name}
            </span>
          </div>

          {/* Gradient + button inside image */}
          <div
            className="absolute bottom-0 left-0 right-0 p-4"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)',
            }}
          >
            <span
              className="inline-flex items-center gap-2 text-xs font-bold
                         tracking-wide uppercase px-4 py-2 rounded-lg
                         transition-all duration-200 group-hover:gap-3"
              style={{
                background: 'var(--accent)',
                color:      '#fff',
              }}
            >
              <BookOpen size={12} />
              Read Full Article
              <ArrowRight
                size={12}
                className="transition-transform duration-200
                           group-hover:translate-x-1"
              />
            </span>
          </div>
        </Link>

        {/* Today's highlights list */}
        <div
          className="px-4"
          style={{ background: 'var(--bg)' }}
        >
          <div className="flex items-center justify-between pt-4 pb-1">
            <span className="section-label">Today's Highlights</span>
            <Link
              to="/articles"
              className="flex items-center gap-1 text-[10px] font-bold
                         tracking-wide uppercase hover:opacity-70
                         transition-opacity"
              style={{ color: 'var(--accent)' }}
            >
              All News <ArrowRight size={11} />
            </Link>
          </div>

          <div>
            {highlights.map((article, i) => (
              <div
                key={article.id}
                style={{
                  borderBottom: i < highlights.length - 1
                    ? '1px solid var(--border-muted)' : 'none',
                }}
              >
                {article.ai_summary ? (
                  <AISummaryRow article={article} />
                ) : (
                  <ArticleRow article={article} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          DESKTOP
      ════════════════════════════════════════════ */}
      <div className="hidden md:block page-container py-6">
        <div className="grid grid-cols-3 gap-6 items-stretch">

          {/* Left — editorial hero, stretch to match sidebar height */}
          <div className="col-span-2 flex flex-col gap-4 h-full">

            {/* Text above image */}
            <div className="space-y-3">
              {/* Badges */}
              <div className="flex items-center gap-2">
                {main.is_breaking && (
                  <span className="breaking-strip">● Breaking</span>
                )}
                <span
                  className="cat-label"
                  style={{ color: main.category_color }}
                >
                  {main.category_name}
                </span>
              </div>

              {/* Headline */}
              <h1
                className="font-display font-black leading-tight tracking-tight"
                style={{
                  fontSize: 'clamp(28px, 3vw, 44px)',
                  color:    'var(--text-primary)',
                }}
              >
                {main.title}
              </h1>

              {/* Subtitle */}
              {(main.subtitle || main.excerpt) && (
                <p
                  className="text-base leading-relaxed max-w-2xl line-clamp-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {main.subtitle || truncate(main.excerpt, 30)}
                </p>
              )}

              {/* Extra excerpt on desktop */}
              {main.subtitle && main.excerpt && (
                <p
                  className="text-sm leading-relaxed max-w-xl line-clamp-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {truncate(main.excerpt, 28)}
                </p>
              )}

              {/* Meta */}
              <div
                className="flex items-center gap-4 text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                <span
                  className="font-semibold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {main.author_name}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={12} />
                  {timeAgo(main.published_at)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye size={12} />
                  {formatCount(main.view_count)}
                </span>
                <span>{main.reading_time} min read</span>
              </div>
            </div>

            {/* Cover image — LCP image: eager + high priority, no lazy */}
            <Link
              to={`/article/${main.slug}`}
              className="block relative rounded-2xl overflow-hidden group flex-1"
              style={{ minHeight: '240px' }}
            >
              {main.cover_image
                ? <img
                    src={cloudinaryUrl(main.cover_image, 1330, 680)}
                    alt={main.title}
                    className="w-full h-full object-cover transition-transform
                               duration-700 group-hover:scale-105"
                    loading="eager"
                    fetchPriority="high"
                    width={1330}
                    height={680}
                  />
                : <div
                    className="w-full h-full"
                    style={{ background: 'var(--bg-muted)' }}
                  />
              }

              {/* Watermark */}
              <div
                className="absolute inset-0 flex items-center justify-center
                           pointer-events-none overflow-hidden"
              >
                <span
                  className="font-display font-bold uppercase
                             select-none whitespace-nowrap"
                  style={{
                    fontSize:      'clamp(80px, 12vw, 140px)',
                    letterSpacing: '-0.04em',
                    color:         'rgba(255,255,255,0.05)',
                    lineHeight:    '1',
                  }}
                >
                  {main.category_name}
                </span>
              </div>

              {/* Gradient + button inside image */}
              <div
                className="absolute bottom-0 left-0 right-0 p-5"
                style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)',
                }}
              >
                <span
                  className="inline-flex items-center gap-2 text-sm font-bold
                             tracking-wide uppercase px-5 py-2.5 rounded-xl
                             transition-all duration-200 group-hover:gap-3"
                  style={{
                    background: 'var(--accent)',
                    color:      '#fff',
                  }}
                >
                  <BookOpen size={14} />
                  Read Full Article
                  <ArrowRight
                    size={13}
                    className="transition-transform duration-200
                               group-hover:translate-x-1"
                  />
                </span>
              </div>
            </Link>
          </div>

          {/* Right — today's highlights sidebar */}
          <div
            className="flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: 'var(--bg-surface)',
              border:     '1px solid var(--border)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <span className="section-label">Today's Highlights</span>
              <Link
                to="/articles"
                className="flex items-center gap-1 text-[10px] font-bold
                           tracking-wide uppercase hover:opacity-70
                           transition-opacity"
                style={{ color: 'var(--accent)' }}
              >
                All <ArrowRight size={10} />
              </Link>
            </div>

            {/* Articles */}
            <div className="flex-1 overflow-y-auto px-4">
              {highlights.map((article, i) => (
                <div
                  key={article.id}
                  style={{
                    borderBottom: i < highlights.length - 1
                      ? '1px solid var(--border-muted)' : 'none',
                  }}
                >
                  {article.ai_summary ? (
                    <AISummaryRow article={article} />
                  ) : (
                    <ArticleRow article={article} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}