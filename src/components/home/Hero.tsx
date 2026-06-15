import { Link } from 'react-router-dom'
import { Clock, Eye, ArrowRight, BookOpen } from 'lucide-react'
import { cloudinaryUrl, cloudinarySrcSet, timeAgo, formatCount, truncate } from '../../lib/utils'
import type { Article } from '../../types'
import { applyCropStyle } from '../../pages/Coverimageeditor'

// ── Cover image — always 16:9, crop applied only for hero sizes ───
function CoverImage({
  article,
  cloudW,
  cloudH,
  className = '',
  eager = false,
  applyCrop = true,
}: {
  article:    Article
  cloudW:     number
  cloudH:     number
  className?: string
  eager?:     boolean
  applyCrop?: boolean
}) {
  const styles = applyCrop ? applyCropStyle(article.cover_crop ?? null) : { container: {}, img: {} }

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
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : undefined}
          width={cloudW}
          height={cloudH}
          style={applyCrop ? styles.img : undefined}
          draggable={false}
        />
      ) : (
        <div className="w-full h-full" style={{ background: 'var(--bg-muted)' }} />
      )}
    </div>
  )
}

// ── Thumbnail — small fixed-size, NO crop applied ─────────────────
/* function Thumbnail({ article, width = 80 }: { article: Article; width?: number }) {
  const h = Math.round(width * (9 / 16))
  if (!article.cover_image) return null
  return (
    <div
      className="flex-shrink-0 rounded-lg overflow-hidden"
      style={{ width: `${width}px`, aspectRatio: '16 / 9' }}
    >
      <img
        src={cloudinaryUrl(article.cover_image, width * 2, h * 2)}
        alt={article.title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        draggable={false}
      />
    </div>
  )
} */

// ── Article row for sidebar lists ─────────────────────────────────
function ArticleRow({ article }: { article: Article }) {
  return (
    <Link to={`/article/${article.slug}`} className="flex items-start gap-3 group py-2.5">
      {article.cover_image && (
        <div
          className="flex-shrink-0 rounded-lg overflow-hidden"
          style={{ width: '120px', aspectRatio: '16 / 9' }}
        >
          <img
            src={cloudinaryUrl(article.cover_image, 240, 135)}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            draggable={false}
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {article.category_name && (
          <span className="cat-label block mb-0.5 text-[10px]" style={{ color: article.category_color }}>
            {article.category_name}
          </span>
        )}
        <p
          className="text-sm font-bold leading-snug line-clamp-2
                     transition-colors duration-150
                     group-hover:text-[var(--accent)]"
          style={{ color: 'var(--text-primary)', fontSize: '13px' }}
        >
          {article.title}
        </p>
        <span className="flex items-center gap-1 text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          <Clock size={10} />
          {timeAgo(article.published_at)}
          <span>·</span>
          {article.reading_time} min
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

      {/* ══════════════════════════════════════════
          MOBILE
      ══════════════════════════════════════════ */}
      <div className="md:hidden">

        {/* Text block — above image */}
        <div className="px-4 pt-5 pb-4 space-y-2" style={{ background: 'var(--bg-surface)' }}>
          {main.category_name && (
            <span className="cat-label text-[10px]" style={{ color: main.category_color }}>
              {main.category_name}
            </span>
          )}
          <Link to={`/article/${main.slug}`} className="block group">
            <h1
              className="font-display font-black leading-tight tracking-tight
                         transition-colors duration-150 group-hover:text-[var(--accent)]"
              style={{ fontSize: 'clamp(18px, 5.5vw, 24px)', color: 'var(--text-primary)' }}
            >
              {main.title}
            </h1>
          </Link>

          <div
            className="flex items-center flex-wrap gap-x-3 gap-y-0.5 text-xs pt-0.5"
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

        {/* Hero image — below text, full width */}
        <Link to={`/article/${main.slug}`} className="block group px-4 pb-4" style={{ background: 'var(--bg-surface)' }}>
          <CoverImage
            article={main}
            cloudW={720}
            cloudH={405}
            eager
            applyCrop
            className="rounded-xl"
          />
        </Link>

        {/* Top stories list */}
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

      {/* ══════════════════════════════════════════
          DESKTOP
      ══════════════════════════════════════════ */}
      <div className="hidden md:block page-container py-6">
        <div className="grid grid-cols-3 gap-6 items-stretch">

          {/* Left — editorial hero */}
          <div className="col-span-2 flex flex-col gap-4 h-full">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {main.is_breaking && (
                  <span className="breaking-strip">● Breaking</span>
                )}
                {main.category_name && (
                  <span className="cat-label" style={{ color: main.category_color }}>
                    {main.category_name}
                  </span>
                )}
              </div>

              <Link to={`/article/${main.slug}`} className="block w-full group">
                <h1
                  className="font-display font-black leading-tight tracking-tight
                             transition-colors duration-150
                             group-hover:text-[var(--accent)]"
                  style={{
                    fontSize: 'clamp(28px, 3vw, 44px)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {main.title}
                </h1>
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

            {/* Hero cover — crop applied, 16:9 */}
            <Link
              to={`/article/${main.slug}`}
              className="block relative rounded-2xl overflow-hidden group flex-1"
            >
              <CoverImage
                article={main}
                cloudW={1280}
                cloudH={720}
                className="rounded-2xl"
                eager
                applyCrop
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