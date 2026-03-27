import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Clock, Eye, TrendingUp, ArrowRight,
  LayoutGrid, List, SlidersHorizontal,
} from 'lucide-react'
import { useCategories }  from '../hooks/useCategories'
import { getArticles }    from '../api/articles'
import type { Article, Category } from '../types'
import { timeAgo, formatCount } from '../lib/utils'
import { SEED_ARTICLES, SEED_CATEGORIES } from '../lib/seed'

// ── Types ─────────────────────────────────────────────────────
type SortOption = 'latest' | 'trending' | 'featured'
type ViewMode   = 'grid' | 'list'

// ── Skeleton ──────────────────────────────────────────────────
function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map(n => (
        <div key={n} className="space-y-3">
          <div className="skeleton h-48 w-full rounded-xl" />
          <div className="skeleton h-3 w-20 rounded" />
          <div className="skeleton h-5 w-full rounded" />
          <div className="skeleton h-5 w-4/5 rounded" />
          <div className="skeleton h-3 w-32 rounded" />
        </div>
      ))}
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-0">
      {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
        <div
          key={n}
          className="flex gap-4 py-5"
          style={{ borderBottom: '1px solid var(--border-muted)' }}
        >
          <div className="flex-1 space-y-2.5">
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-5 w-full rounded" />
            <div className="skeleton h-5 w-3/4 rounded" />
            <div className="skeleton h-3 w-40 rounded" />
          </div>
          <div className="skeleton rounded-xl flex-shrink-0"
            style={{ width: '120px', height: '96px' }} />
        </div>
      ))}
    </div>
  )
}

// ── Article Grid Card ─────────────────────────────────────────
function GridCard({ article }: { article: Article }) {
  return (
    <Link
      to={`/article/${article.slug}`}
      className="group flex flex-col"
    >
      {/* Image */}
      <div
        className="w-full rounded-xl overflow-hidden mb-3 flex-shrink-0 img-zoom"
        style={{
          height:     '192px',
          background: 'var(--bg-muted)',
        }}
      >
        {article.cover_image && (
          <img
            src={article.cover_image}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-2">
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

      {/* Headline */}
      <h2
        className="font-display text-display-sm leading-tight line-clamp-3
                   transition-colors duration-150
                   group-hover:text-[var(--accent)]"
        style={{ color: 'var(--text-primary)' }}
      >
        {article.title}
      </h2>

      {/* Excerpt */}
      {article.excerpt && (
        <p
          className="text-sm leading-relaxed mt-2 line-clamp-2 flex-1"
          style={{ color: 'var(--text-secondary)' }}
        >
          {article.excerpt}
        </p>
      )}

      {/* Meta */}
      <div
        className="flex items-center gap-2 mt-3 text-xs"
        style={{ color: 'var(--text-muted)' }}
      >
        <span
          className="font-medium"
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
    </Link>
  )
}

// ── Article List Row ──────────────────────────────────────────
function ListRow({
  article,
  isLast,
}: {
  article: Article
  isLast:  boolean
}) {
  return (
    <Link
      to={`/article/${article.slug}`}
      className="flex gap-4 py-5 group"
      style={{
        borderBottom: isLast ? 'none' : '1px solid var(--border-muted)',
      }}
    >
      {/* Text — left */}
      <div className="flex-1 min-w-0">
        {/* Badges */}
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

        <h2
          className="font-display text-display-sm leading-tight line-clamp-2
                     transition-colors duration-150
                     group-hover:text-[var(--accent)]"
          style={{ color: 'var(--text-primary)' }}
        >
          {article.title}
        </h2>

        {article.excerpt && (
          <p
            className="text-sm leading-relaxed mt-1.5 line-clamp-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            {article.excerpt}
          </p>
        )}

        <div
          className="flex items-center gap-2 mt-2.5 text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          <span
            className="font-medium"
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

      {/* Thumbnail — right */}
      {article.cover_image && (
        <div
          className="flex-shrink-0 rounded-xl overflow-hidden img-zoom"
          style={{ width: '120px', height: '96px' }}
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

// ── Other Categories sidebar ──────────────────────────────────
function OtherCategories({
  current,
  categories,
}: {
  current:    string
  categories: Category[]
}) {
  const others = categories.filter(c => c.slug !== current)

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'var(--bg-surface)',
        border:     '1px solid var(--border)',
      }}
    >
      <div
        className="px-4 py-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="section-label">Browse sections</span>
      </div>

      <div className="p-2">
        {others.map(cat => (
          <Link
            key={cat.id}
            to={`/category/${cat.slug}`}
            className="flex items-center justify-between px-3 py-2.5
                       rounded-lg transition-colors duration-150
                       hover:bg-[var(--bg-subtle)] group"
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: cat.color }}
              />
              <span
                className="text-sm font-medium transition-colors
                           group-hover:text-[var(--accent)]"
                style={{ color: 'var(--text-primary)' }}
              >
                {cat.name}
              </span>
            </div>
            <span
              className="text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              {cat.article_count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ── Main Category Page ────────────────────────────────────────
export default function CategoryPage() {
  const { slug }                  = useParams<{ slug: string }>()
  const { categories, loading: catLoading } = useCategories()

  const [articles,    setArticles]    = useState<Article[]>([])
  const [loading,     setLoading]     = useState(true)
  const [page,        setPage]        = useState(1)
  const [hasMore,     setHasMore]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [sort,        setSort]        = useState<SortOption>('latest')
  const [view,        setView]        = useState<ViewMode>('grid')
  const [total,       setTotal]       = useState(0)

  const LIMIT = 12

  // Find current category from the list
  const category = categories.find(c => c.slug === slug)
    ?? SEED_CATEGORIES.find(c => c.slug === slug)

  // ── Reset and reload when slug or sort changes ─────────────
  useEffect(() => {
    if (!slug) return
    setArticles([])
    setPage(1)
    setHasMore(true)
    setLoading(true)

    getArticles({
      category: slug,
      limit:    LIMIT,
      page:     1,
      // featured sort = featured:true first
      ...(sort === 'featured' && { featured: true }),
    })
      .then(res => {
        const data = res.data ?? []
        setArticles(
          sort === 'trending'
            ? [...data].sort((a, b) =>
                (b.view_count * 1 + b.like_count * 3 + b.comment_count * 2) -
                (a.view_count * 1 + a.like_count * 3 + a.comment_count * 2)
              )
            : data
        )
        setTotal(res.pagination?.total ?? data.length)
        setHasMore(res.pagination?.hasNextPage ?? false)
      })
      .catch(() => {
        const seed = SEED_ARTICLES.filter(a => a.category_slug === slug)
        setArticles(seed)
        setTotal(seed.length)
        setHasMore(false)
      })
      .finally(() => setLoading(false))
  }, [slug, sort])

  // ── Load more ──────────────────────────────────────────────
  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)

    const nextPage = page + 1
    try {
      const res = await getArticles({
        category: slug,
        limit:    LIMIT,
        page:     nextPage,
        ...(sort === 'featured' && { featured: true }),
      })
      const data = res.data ?? []
      setArticles(prev => [
        ...prev,
        ...(sort === 'trending'
          ? [...data].sort((a, b) =>
              (b.view_count * 1 + b.like_count * 3 + b.comment_count * 2) -
              (a.view_count * 1 + a.like_count * 3 + a.comment_count * 2)
            )
          : data
        )
      ])
      setPage(nextPage)
      setHasMore(res.pagination?.hasNextPage ?? false)
    } catch {
      setHasMore(false)
    } finally {
      setLoadingMore(false)
    }
  }

  // ── Sort button ────────────────────────────────────────────
  const SortBtn = ({
    value,
    label,
    icon: Icon,
  }: {
    value: SortOption
    label: string
    icon:  React.ElementType
  }) => (
    <button
      onClick={() => setSort(value)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                 text-sm font-medium transition-all duration-150"
      style={{
        background: sort === value ? 'var(--accent)'      : 'var(--bg-subtle)',
        color:      sort === value ? '#fff'               : 'var(--text-secondary)',
        border:     `1px solid ${sort === value ? 'var(--accent)' : 'var(--border)'}`,
      }}
    >
      <Icon size={13} />
      {label}
    </button>
  )

  // ── Not found ──────────────────────────────────────────────
  if (!catLoading && !category) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center
                   gap-4 p-8 text-center"
        style={{ background: 'var(--bg)' }}
      >
        <p className="text-5xl">📂</p>
        <h1
          className="font-display text-display-xl"
          style={{ color: 'var(--text-primary)' }}
        >
          Category not found
        </h1>
        <Link to="/" className="btn-accent mt-2">
          Back to homepage
        </Link>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="page-container">

        {/* ── Category header ── */}
        <div className="py-8">

          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-2 mb-5 text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            <Link
              to="/"
              className="transition-colors hover:text-[var(--accent)]"
            >
              Home
            </Link>
            <ArrowRight size={11} />
            <span style={{ color: 'var(--text-primary)' }}>
              {category?.name ?? slug}
            </span>
          </nav>

          {/* Category name + count */}
          <div className="flex items-end justify-between gap-4">
            <div>
              {/* Coloured accent line */}
              <div
                className="w-10 h-1 rounded-full mb-3"
                style={{ background: category?.color ?? 'var(--accent)' }}
              />
              <h1
                className="font-display text-display-2xl leading-none"
                style={{ color: 'var(--text-primary)' }}
              >
                {category?.name ?? slug}
              </h1>
              {total > 0 && (
                <p
                  className="text-sm mt-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {total} {total === 1 ? 'story' : 'stories'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Controls bar ── */}
        <div
          className="flex items-center justify-between gap-3 py-3 mb-6
                     flex-wrap"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          {/* Sort options */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-medium flex items-center gap-1.5 mr-1"
              style={{ color: 'var(--text-muted)' }}
            >
              <SlidersHorizontal size={12} />
              Sort
            </span>
            <SortBtn value="latest"   label="Latest"   icon={Clock}      />
            <SortBtn value="trending" label="Trending"  icon={TrendingUp} />
            <SortBtn value="featured" label="Featured"  icon={ArrowRight} />
          </div>

          {/* View toggle */}
          <div
            className="flex items-center rounded-lg overflow-hidden"
            style={{ border: '1px solid var(--border)' }}
          >
            <button
              onClick={() => setView('grid')}
              className="px-3 py-1.5 transition-colors duration-150"
              style={{
                background: view === 'grid' ? 'var(--bg-subtle)' : 'transparent',
                color:      view === 'grid' ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
              aria-label="Grid view"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setView('list')}
              className="px-3 py-1.5 transition-colors duration-150"
              style={{
                background:  view === 'list' ? 'var(--bg-subtle)' : 'transparent',
                color:       view === 'list' ? 'var(--text-primary)' : 'var(--text-muted)',
                borderLeft:  '1px solid var(--border)',
              }}
              aria-label="List view"
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* ── Main content + sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 pb-16">

          {/* Articles */}
          <div>
            {loading ? (
              view === 'grid' ? <GridSkeleton /> : <ListSkeleton />
            ) : articles.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center
                           py-20 text-center"
              >
                <p className="text-4xl mb-4">📰</p>
                <p
                  className="font-display text-display-sm mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  No stories yet
                </p>
                <p
                  className="text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Check back soon — we publish daily.
                </p>
              </div>
            ) : view === 'grid' ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                  {articles.map(article => (
                    <GridCard key={article.id} article={article} />
                  ))}
                </div>
              </>
            ) : (
              <div>
                {articles.map((article, i) => (
                  <ListRow
                    key={article.id}
                    article={article}
                    isLast={i === articles.length - 1}
                  />
                ))}
              </div>
            )}

            {/* Load more */}
            {!loading && hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="btn-ghost px-8 py-3 text-sm
                             flex items-center gap-2 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <span
                        className="w-4 h-4 rounded-full border-2
                                   border-t-transparent animate-spin"
                        style={{ borderColor: 'var(--accent) transparent var(--accent) var(--accent)' }}
                      />
                      Loading…
                    </>
                  ) : (
                    <>
                      Load more stories
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* End of results */}
            {!loading && !hasMore && articles.length > 0 && (
              <p
                className="text-center text-xs mt-10 pb-4"
                style={{ color: 'var(--text-faint)' }}
              >
                You've reached the end · {articles.length} stories
              </p>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">

              {/* Other categories */}
              {!catLoading && categories.length > 0 && (
                <OtherCategories
                  current={slug ?? ''}
                  categories={categories}
                />
              )}

              {/* Newsletter CTA */}
              <div
                className="p-5 rounded-xl"
                style={{
                  background: 'var(--accent-light)',
                  border:     '1px solid rgba(200,130,10,0.15)',
                }}
              >
                <p className="section-label mb-2">Newsletter</p>
                <p
                  className="font-semibold text-sm mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Stay informed
                </p>
                <p
                  className="text-xs leading-relaxed mb-4"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Get India's top business and market stories every morning, free.
                </p>
                <Link
                  to="/#newsletter"
                  className="btn-accent text-sm w-full justify-center"
                >
                  Subscribe free
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile: other categories strip */}
        <div
          className="lg:hidden pb-8"
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
                  className="flex-shrink-0 flex items-center gap-1.5
                             px-3 py-2 rounded-lg text-sm font-medium
                             transition-all duration-150 whitespace-nowrap"
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

      </div>
    </div>
  )
}