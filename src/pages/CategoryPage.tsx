import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Clock, Eye, ChevronRight, ArrowRight } from 'lucide-react'
import { useCategories }  from '../hooks/useCategories'
import { getArticles }    from '../api/articles'
import type { Article, Category } from '../types'
import { timeAgo, formatCount } from '../lib/utils'
import { SEED_ARTICLES, SEED_CATEGORIES } from '../lib/seed'
import MarketTicker from '../components/ui/MarketTicker'
import SEO          from '../seo/Seo'

// ── Skeleton ──────────────────────────────────────────────────
function HeroSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-0 lg:gap-8 mb-8">
      <div className="space-y-4">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-9 w-full rounded" />
        <div className="skeleton h-9 w-3/4 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-5/6 rounded" />
        <div className="skeleton h-[280px] w-full rounded-xl mt-2" />
        <div className="skeleton h-3 w-48 rounded" />
      </div>
      <div className="hidden lg:block space-y-0 pt-1">
        {[1,2,3,4,5].map(n => (
          <div key={n} className="flex gap-3 py-4"
            style={{ borderBottom: '1px solid var(--border-muted)' }}>
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3 w-16 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-4/5 rounded" />
              <div className="skeleton h-3 w-24 rounded" />
            </div>
            <div className="skeleton rounded-lg flex-shrink-0"
              style={{ width: '72px', height: '60px' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="space-y-0">
      {[1,2,3,4,5,6].map(n => (
        <div key={n} className="flex gap-4 py-5"
          style={{ borderBottom: '1px solid var(--border-muted)' }}>
          <div className="flex-1 space-y-2.5">
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-5 w-full rounded" />
            <div className="skeleton h-5 w-3/4 rounded" />
            <div className="skeleton h-3 w-40 rounded" />
          </div>
          <div className="skeleton rounded-xl flex-shrink-0"
            style={{ width: '112px', height: '88px' }} />
        </div>
      ))}
    </div>
  )
}

// ── Hero lead article ─────────────────────────────────────────
function HeroArticle({ article }: { article: Article }) {
  return (
    <Link to={`/article/${article.slug}`} className="group block">
      <div className="flex items-center gap-2 mb-3">
        {article.is_breaking && (
          <span className="breaking-strip">● Breaking</span>
        )}
        {article.is_featured && !article.is_breaking && (
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-sm uppercase
                       tracking-wide"
            style={{
              background: 'var(--accent-light)',
              color:      'var(--accent-text)',
            }}
          >
            Featured
          </span>
        )}
      </div>

      <h1
        className="font-display text-display-xl leading-tight mb-3
                   transition-colors duration-150
                   group-hover:text-[var(--accent)]"
        style={{ color: 'var(--text-primary)' }}
      >
        {article.title}
      </h1>

      {article.subtitle && (
        <p
          className="serif-text text-lg leading-relaxed mb-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          {article.subtitle}
        </p>
      )}

      {article.excerpt && (
        <p
          className="text-sm leading-relaxed mb-4 line-clamp-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          {article.excerpt}
        </p>
      )}

      <div
        className="flex items-center gap-2 text-xs mb-5"
        style={{ color: 'var(--text-muted)' }}
      >
        <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
          {article.author_name}
        </span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <Clock size={10} />
          {timeAgo(article.published_at)}
        </span>
        <span>·</span>
        <span>{article.reading_time} min read</span>
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

      {article.cover_image && (
        <div
          className="w-full rounded-xl overflow-hidden img-zoom"
          style={{ aspectRatio: '16/9' }}
        >
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
      )}
    </Link>
  )
}

// ── Secondary stacked list ─────────────────────────────────────
function SecondaryList({ articles }: { articles: Article[] }) {
  return (
    <div>
      {articles.map((article, i) => (
        <Link
          key={article.id}
          to={`/article/${article.slug}`}
          className="flex gap-3 py-4 group"
          style={{
            borderBottom: i < articles.length - 1
              ? '1px solid var(--border-muted)'
              : 'none',
          }}
        >
          <div className="flex-1 min-w-0">
            {article.is_breaking && (
              <span className="breaking-strip mb-1.5 inline-block">● Breaking</span>
            )}
            <h3
              className="text-sm font-semibold leading-snug line-clamp-3
                         transition-colors duration-150
                         group-hover:text-[var(--accent)]"
              style={{ color: 'var(--text-primary)' }}
            >
              {article.title}
            </h3>
            <div
              className="flex items-center gap-1.5 mt-2 text-[11px]"
              style={{ color: 'var(--text-muted)' }}
            >
              <Clock size={10} />
              <span>{timeAgo(article.published_at)}</span>
              <span>·</span>
              <span>{article.reading_time} min</span>
            </div>
          </div>

          {article.cover_image && (
            <div
              className="flex-shrink-0 rounded-lg overflow-hidden img-zoom"
              style={{ width: '72px', height: '60px' }}
            >
              <img
                src={article.cover_image}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
        </Link>
      ))}
    </div>
  )
}

// ── Article row ───────────────────────────────────────────────
function ArticleRow({
  article,
  isLast,
  size = 'normal',
}: {
  article: Article
  isLast:  boolean
  size?:   'large' | 'normal' | 'small'
}) {
  const imgW = size === 'large' ? '160px' : size === 'small' ? '80px' : '112px'
  const imgH = size === 'large' ? '120px' : size === 'small' ? '68px' : '88px'

  return (
    <Link
      to={`/article/${article.slug}`}
      className="flex gap-4 py-5 group"
      style={{
        borderBottom: isLast ? 'none' : '1px solid var(--border-muted)',
      }}
    >
      <div className="flex-1 min-w-0">
        {(article.is_breaking || article.is_featured) && (
          <div className="flex items-center gap-2 mb-1.5">
            {article.is_breaking && (
              <span className="breaking-strip">● Breaking</span>
            )}
            {article.is_featured && !article.is_breaking && (
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-sm"
                style={{
                  background: 'var(--accent-light)',
                  color:      'var(--accent-text)',
                }}
              >
                Featured
              </span>
            )}
          </div>
        )}

        <h2
          className={`font-display leading-tight transition-colors duration-150
                      group-hover:text-[var(--accent)]
                      ${size === 'large'
                        ? 'text-display-md line-clamp-2'
                        : 'text-display-sm line-clamp-2'
                      }`}
          style={{ color: 'var(--text-primary)' }}
        >
          {article.title}
        </h2>

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
          <span className="font-medium"
            style={{ color: 'var(--text-secondary)' }}>
            {article.author_name}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {timeAgo(article.published_at)}
          </span>
          <span>·</span>
          <span>{article.reading_time} min read</span>
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

      {article.cover_image && (
        <div
          className="flex-shrink-0 rounded-xl overflow-hidden img-zoom self-start"
          style={{ width: imgW, height: imgH }}
        >
          <img
            src={article.cover_image}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
    </Link>
  )
}

// ── Divider with label ────────────────────────────────────────
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      <span className="section-label px-2">{label}</span>
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function CategoryPage() {
  const { slug }                            = useParams<{ slug: string }>()
  const { categories, loading: catLoading } = useCategories()

  const [allArticles, setAllArticles] = useState<Article[]>([])
  const [loading,     setLoading]     = useState(true)
  const [page,        setPage]        = useState(1)
  const [hasMore,     setHasMore]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const LIMIT    = 20
  const isMarkets = slug === 'markets'

  const category: Category | undefined =
    categories.find(c => c.slug === slug) ??
    SEED_CATEGORIES.find(c => c.slug === slug)

  useEffect(() => {
    if (!slug) return
    setAllArticles([])
    setPage(1)
    setHasMore(true)
    setLoading(true)

    getArticles({ category: slug, limit: LIMIT, page: 1 })
      .then(res => {
        const data = res.data ?? []
        setAllArticles(data)
        setHasMore(res.pagination?.hasNextPage ?? false)
      })
      .catch(() => {
        const seed = SEED_ARTICLES.filter(a => a.category_slug === slug)
        setAllArticles(seed)
        setHasMore(false)
      })
      .finally(() => setLoading(false))
  }, [slug])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !slug) return
    setLoadingMore(true)
    const nextPage = page + 1

    try {
      const res = await getArticles({ category: slug, limit: LIMIT, page: nextPage })
      setAllArticles(prev => [...prev, ...(res.data ?? [])])
      setPage(nextPage)
      setHasMore(res.pagination?.hasNextPage ?? false)
    } catch {
      setHasMore(false)
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore, slug, page])

  const heroArticle     = allArticles[0]
  const secondaryList   = allArticles.slice(1, 6)
  const firstBatch      = allArticles.slice(6, 10)
  const remainingBatch  = allArticles.slice(10)

  if (!catLoading && !category) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center
                   gap-4 p-8 text-center"
        style={{ background: 'var(--bg)' }}
      >
        <p className="text-5xl">📂</p>
        <h1 className="font-display text-display-xl"
          style={{ color: 'var(--text-primary)' }}>
          Section not found
        </h1>
        <Link to="/" className="btn-accent mt-2">Back to homepage</Link>
      </div>
    )
  }

  return (
    <>
      {/*
        SEO — uses real category name and description from DB.
        category?.description comes from the categories table.
        Falls back gracefully if category is still loading.
      */}
      {category && (
        <SEO
          title={`${category.name} News`}
          description={
            category.slug
              ? category.slug
              : `Latest ${category.name} news and analysis — Mango People News`
          }
          path={`/category/${slug}`}
        />
      )}

      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <div className="page-container">

          <div className="pt-6 pb-0">
            <nav
              className="flex items-center gap-1.5 mb-4 text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              <Link to="/"
                className="transition-colors hover:text-[var(--accent)]">
                Home
              </Link>
              <ChevronRight size={11} />
              <span style={{ color: 'var(--text-primary)' }}>
                {category?.name ?? slug}
              </span>
            </nav>

            <div
              className="flex items-end justify-between pb-4"
              style={{ borderBottom: `3px solid ${category?.color ?? 'var(--accent)'}` }}
            >
              <div className="flex items-center gap-3">
                <h1
                  className="font-display text-display-2xl leading-none"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {category?.name ?? slug}
                </h1>
                {allArticles.length > 0 && (
                  <span
                    className="text-sm hidden sm:block"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {allArticles.length} stories
                  </span>
                )}
              </div>

              {isMarkets && (
                <div className="flex items-center gap-1.5 pb-1">
                  <div
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: '#15803D' }}
                  />
                  <span className="text-xs font-medium"
                    style={{ color: '#15803D' }}>
                    Live data
                  </span>
                </div>
              )}
            </div>
          </div>

          {isMarkets && (
            <div
              className="py-1"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <MarketTicker />
            </div>
          )}

          <div className="py-8">
            {loading ? (
              <>
                <HeroSkeleton />
                <GridSkeleton />
              </>
            ) : allArticles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-5xl mb-4">📰</p>
                <p className="font-display text-display-sm mb-2"
                  style={{ color: 'var(--text-primary)' }}>
                  No stories yet in {category?.name}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Check back soon — we publish daily.
                </p>
              </div>
            ) : (
              <>
                {heroArticle && (
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 pb-8"
                    style={{ borderBottom: '1px solid var(--border)' }}>

                    <HeroArticle article={heroArticle} />

                    {secondaryList.length > 0 && (
                      <div className="lg:pl-8"
                        style={{ borderLeft: '1px solid var(--border)' }}>
                        <p className="section-label mb-0 pb-3"
                          style={{ borderBottom: '1px solid var(--border-muted)' }}>
                          Latest in {category?.name}
                        </p>
                        <SecondaryList articles={secondaryList} />
                      </div>
                    )}
                  </div>
                )}

                {firstBatch.length > 0 && (
                  <div className="mt-8">
                    <SectionDivider label="More stories" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10">
                      {firstBatch.map((article, i) => (
                        <ArticleRow
                          key={article.id}
                          article={article}
                          isLast={i === firstBatch.length - 1}
                          size="large"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {remainingBatch.length > 0 && (
                  <div className="mt-2">
                    <SectionDivider label="Continue reading" />
                    {remainingBatch.map((article, i) => (
                      <ArticleRow
                        key={article.id}
                        article={article}
                        isLast={i === remainingBatch.length - 1}
                        size="normal"
                      />
                    ))}
                  </div>
                )}

                {hasMore && (
                  <div className="flex justify-center pt-10 pb-4">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="btn-ghost px-10 py-3 text-sm flex items-center
                                 gap-2 disabled:opacity-50"
                    >
                      {loadingMore ? (
                        <>
                          <span
                            className="w-4 h-4 rounded-full border-2 animate-spin"
                            style={{
                              borderColor: 'var(--accent) transparent var(--accent) var(--accent)',
                            }}
                          />
                          Loading…
                        </>
                      ) : (
                        <>Load more stories <ArrowRight size={14} /></>
                      )}
                    </button>
                  </div>
                )}

                {!hasMore && allArticles.length > 0 && (
                  <p className="text-center text-xs pt-8 pb-4"
                    style={{ color: 'var(--text-faint)' }}>
                    You've read it all · {allArticles.length} stories
                  </p>
                )}
              </>
            )}
          </div>

          {categories.length > 1 && (
            <div
              className="pb-10 pt-2"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <p className="section-label mt-5 mb-3">Other sections</p>
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2">
                {categories
                  .filter(c => c.slug !== slug)
                  .map(cat => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.slug}`}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2
                                 rounded-lg text-sm font-medium whitespace-nowrap
                                 transition-all duration-150"
                      style={{
                        background: 'var(--bg-surface)',
                        border:     '1px solid var(--border)',
                        color:      'var(--text-secondary)',
                      }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: cat.color }}
                      />
                      {cat.name}
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