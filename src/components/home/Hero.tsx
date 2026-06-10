import { Link } from 'react-router-dom'
import { Clock, Eye, ArrowRight, BookOpen } from 'lucide-react'
import { cloudinaryUrl, cloudinarySrcSet, timeAgo, formatCount, truncate } from '../../lib/utils'
import type { Article } from '../../types'
import { applyCropStyle } from '../../pages/Coverimageeditor'

// ── Consistent cover renderer ─────────────────────────────────────
/**
 * Renders a cover image at a guaranteed 16:9 aspect ratio,
 * applying the author's crop settings uniformly.
 */
function CoverImage({
  article,
  cloudW,
  cloudH,
  className = '',
  eager = false,
}: {
  article:   Article
  cloudW:    number
  cloudH:    number
  className?: string
  eager?:    boolean
}) {
  const crop   = article.cover_crop ?? null
  const styles = applyCropStyle(crop)

  return (
    <div
      className={`w-full overflow-hidden ${className}`}
      style={{ ...styles.container, aspectRatio: '16 / 9' }}
    >
      {article.cover_image ? (
        <img
          src={cloudinaryUrl(article.cover_image, cloudW, cloudH)}
          srcSet={cloudinarySrcSet(article.cover_image, cloudW, cloudH)}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
          alt={article.title}
          className="transition-transform duration-700 group-hover:scale-105"
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : undefined}
          width={cloudW}
          height={cloudH}
          style={styles.img}
          draggable={false}
        />
      ) : (
        <div className="w-full h-full" style={{ background: 'var(--bg-muted)' }} />
      )}
    </div>
  )
}

// ── Article Row ───────────────────────────────────────────────────
function ArticleRow({ article }: { article: Article }) {
  const crop   = article.cover_crop ?? null
  const styles = applyCropStyle(crop)

  return (
    <Link to={`/article/${article.slug}`} className="flex gap-3 group py-2">
      {article.cover_image && (
        <div
          className="flex-shrink-0 rounded-lg overflow-hidden"
          style={{ ...styles.container, width: '72px', height: '54px' }}
        >
          <img
            src={cloudinaryUrl(article.cover_image, 144, 108)}
            srcSet={cloudinarySrcSet(article.cover_image, 144, 108)}
            sizes="72px"
            alt={article.title}
            className="transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            width={144}
            height={108}
            style={styles.img}
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {article.category_name && (
          <span className="cat-label block mb-0.5" style={{ color: article.category_color }}>
            {article.category_name}
          </span>
        )}
        <p
          className="text-sm font-bold leading-snug line-clamp-2
                     transition-colors duration-150
                     group-hover:text-[var(--accent)]"
          style={{ color: 'var(--text-primary)' }}
        >
          {article.title}
        </p>
        <span
          className="flex items-center gap-1 text-xs mt-1"
          style={{ color: 'var(--text-muted)' }}
        >
          <Clock size={10} />
          {timeAgo(article.published_at)}
        </span>
      </div>
    </Link>
  )
}

// ── Main ──────────────────────────────────────────────────────────
export default function Hero({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null

  const main       = articles[0]
  const highlights = articles.slice(1, 7)

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

          <Link to={`/article/${main.slug}`} className="block w-full group">
            <h1
              className="font-display font-black leading-tight tracking-tight
                         transition-colors duration-150
                         group-hover:text-[var(--accent)]"
              style={{
                fontSize: 'clamp(14px, 6vw, 20px)',
                color: 'var(--text-primary)',
              }}
            >
              {main.title}
            </h1>
          </Link>

          <div
            className="flex items-center gap-3 text-xs pt-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
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

        {/* Cover image — smaller mobile card, centered */}
        <div className="flex justify-center">
          <Link
            to={`/article/${main.slug}`}
            className="relative overflow-hidden group rounded-[1.25rem]"
            style={{ width: 'min(90vw, 320px)' }}
          >
            <CoverImage
              article={main}
              cloudW={560}
              cloudH={300}
              eager
              className="max-h-[120px]"
            />
          </Link>
        </div>

        {/* Top stories */}
        <div className="px-4" style={{ background: 'var(--bg)' }}>
          <div className="flex items-center justify-between pt-4 pb-1">
            <span className="section-label">Top Stories</span>
            <Link
              to="/articles"
              className="flex items-center gap-1 text-[10px] font-bold
                         tracking-wide uppercase hover:opacity-70 transition-opacity"
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
                <ArticleRow article={article} />
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

          {/* Left — editorial hero */}
          <div className="col-span-2 flex flex-col gap-4 h-full">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {main.is_breaking && (
                  <span className="breaking-strip">● Breaking</span>
                )}
                <span className="cat-label" style={{ color: main.category_color }}>
                  {main.category_name}
                </span>
              </div>

              <Link
                to={`/article/${main.slug}`}
                className="block w-full group"
                aria-hidden="true"
                tabIndex={-1}
              >
                <p
                  className="font-display font-black leading-tight tracking-tight
                             transition-colors duration-150
                             group-hover:text-[var(--accent)]"
                  style={{
                    fontSize: 'clamp(28px, 3vw, 44px)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {main.title}
                </p>
              </Link>

              {(main.subtitle || main.excerpt) && (
                <p
                  className="text-base leading-relaxed max-w-2xl line-clamp-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {main.subtitle || truncate(main.excerpt, 30)}
                </p>
              )}

              {main.subtitle && main.excerpt && (
                <p
                  className="text-sm leading-relaxed max-w-xl line-clamp-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {truncate(main.excerpt, 28)}
                </p>
              )}

              <div
                className="flex items-center gap-4 text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
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

            {/* Cover image — 16:9 enforced */}
            <Link
              to={`/article/${main.slug}`}
              className="block relative rounded-2xl overflow-hidden group flex-1"
            >
              <CoverImage
                article={main}
                cloudW={1330}
                cloudH={748}
                className="rounded-2xl"
                eager
              />

              <div
                className="absolute inset-0 flex items-center justify-center
                           pointer-events-none overflow-hidden"
                aria-hidden="true"
              >
                <span
                  className="font-display font-bold uppercase select-none whitespace-nowrap"
                  style={{
                    fontSize: 'clamp(80px, 12vw, 140px)',
                    letterSpacing: '-0.04em',
                    color: 'rgba(255,255,255,0.05)',
                    lineHeight: '1',
                  }}
                >
                  {main.category_name}
                </span>
              </div>

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
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  <BookOpen size={14} />
                  Read Full Article
                  <ArrowRight
                    size={13}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </span>
              </div>
            </Link>
          </div>

          {/* Right — highlights sidebar */}
          <div
            className="flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <span className="section-label">Top Stories</span>
              <Link
                to="/articles"
                className="flex items-center gap-1 text-[10px] font-bold
                           tracking-wide uppercase hover:opacity-70 transition-opacity"
                style={{ color: 'var(--accent)' }}
              >
                All <ArrowRight size={10} />
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto px-4">
              {highlights.map((article, i) => (
                <div
                  key={article.id}
                  style={{
                    borderBottom: i < highlights.length - 1
                      ? '1px solid var(--border-muted)' : 'none',
                  }}
                >
                  <ArticleRow article={article} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}