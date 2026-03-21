import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, ArrowRight } from 'lucide-react'
import { useCategories } from '../../hooks/useCategories'
import { useArticles } from '../../hooks/useArticles'
import { timeAgo } from '../../lib/utils'
import type { Article, Category } from '../../types'

// ── Article card for grid ─────────────────────────────────────────
function CategoryArticleCard({ article }: { article: Article }) {
  return (
    <Link
      to={`/article/${article.slug}`}
      className="group flex flex-col"
      style={{
        background:   'var(--bg-surface)',
        border:       '1px solid var(--border-muted)',
        borderRadius: '12px',
        overflow:     'hidden',
        transition:   'all 0.2s ease',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform   = 'translateY(-2px)'
        el.style.boxShadow   = '0 8px 24px rgba(0,0,0,0.08)'
        el.style.borderColor = 'var(--border)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform   = 'translateY(0)'
        el.style.boxShadow   = 'none'
        el.style.borderColor = 'var(--border-muted)'
      }}
    >
      {/* Image */}
      {article.cover_image && (
        <div
          className="w-full overflow-hidden flex-shrink-0"
          style={{ height: '160px' }}
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

      {/* Content */}
      <div className="flex flex-col flex-1 p-3.5">
        {/* Category label */}
        <span
          className="cat-label text-[10px] block mb-2"
          style={{ color: article.category_color }}
        >
          {article.category_name}
        </span>

        {/* Headline */}
        <h3
          className="font-display font-bold text-base leading-tight
                     tracking-tight line-clamp-2 flex-1
                     transition-colors duration-150
                     group-hover:text-[var(--accent)]"
          style={{ color: 'var(--text-primary)' }}
        >
          {article.title}
        </h3>

        {/* Excerpt */}
        {article.excerpt && (
          <p
            className="text-xs leading-relaxed mt-2 line-clamp-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            {article.excerpt}
          </p>
        )}

        {/* Meta */}
        <div
          className="flex items-center gap-2 mt-3 text-[11px]"
          style={{ color: 'var(--text-muted)' }}
        >
          <span
            className="font-semibold truncate flex-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            {article.author_name}
          </span>
          <span className="flex items-center gap-1 flex-shrink-0">
            <Clock size={10} />
            {timeAgo(article.published_at)}
          </span>
          <span className="flex-shrink-0">
            · {article.reading_time}m
          </span>
        </div>
      </div>
    </Link>
  )
}

// ── Article card skeleton ─────────────────────────────────────────
function CardSkeleton() {
  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        background:   'var(--bg-surface)',
        border:       '1px solid var(--border-muted)',
        borderRadius: '12px',
      }}
    >
      <div className="skeleton w-full" style={{ height: '160px' }} />
      <div className="p-3.5 space-y-2">
        <div className="skeleton h-2.5 w-16 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
        <div className="skeleton h-3 w-full rounded mt-2" />
        <div className="skeleton h-3 w-3/4 rounded" />
        <div className="flex gap-2 mt-3">
          <div className="skeleton h-2.5 w-20 rounded" />
          <div className="skeleton h-2.5 w-12 rounded ml-auto" />
        </div>
      </div>
    </div>
  )
}

// ── Tab content — fetches articles per active category ────────────
function TabContent({
  category,
}: {
  category: Category
}) {
  const { articles, loading } = useArticles({
    category: category.slug,
    limit:    6,
  })

  return (
    <div>
      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {loading
          ? Array(6).fill(null).map((_, i) => <CardSkeleton key={i} />)
          : articles.map(article => (
              <CategoryArticleCard key={article.id} article={article} />
            ))
        }
      </div>

      {/* View all link */}
      {!loading && articles.length > 0 && (
        <div className="flex justify-center mt-6">
          <Link
            to={`/category/${category.slug}`}
            className="inline-flex items-center gap-2 px-6 py-2.5
                       rounded-xl text-sm font-bold tracking-wide
                       uppercase transition-all duration-200
                       active:scale-95 btn-ghost"
            style={{ borderColor: category.color, color: category.color }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.background = category.color
              el.style.color      = '#fff'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.background = 'transparent'
              el.style.color      = category.color
            }}
          >
            More {category.name} News
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────
export default function CategoryTabs() {
  const { categories, loading } = useCategories()
  const [activeSlug, setActiveSlug] = useState<string>('')

  // Set first category as default once loaded
  useEffect(() => {
    if (categories.length > 0 && !activeSlug) {
      setActiveSlug(categories[0].slug)
    }
  }, [categories])

  const activeCategory = categories.find(c => c.slug === activeSlug)

  return (
    <section className="page-container py-6 md:py-8">

      {/* Section heading */}
      <div
        className="flex items-center justify-between mb-5 pb-3"
        style={{ borderBottom: '2px solid var(--border)' }}
      >
        <span
          className="font-display font-black tracking-tight uppercase"
          style={{
            fontSize: 'clamp(28px, 5vw, 42px)',
            color:    'var(--text-primary)',
          }}
        >
          Browse by Topic
        </span>
        <Link
          to="/articles"
          className="text-xs font-bold tracking-widest uppercase
                     hover:opacity-70 transition-opacity hidden sm:block"
          style={{ color: 'var(--accent)' }}
        >
          All Articles →
        </Link>
      </div>

      {/* Tabs — horizontal scroll on mobile */}
      {loading ? (
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 mb-5">
          {Array(6).fill(null).map((_, i) => (
            <div
              key={i}
              className="skeleton flex-shrink-0 rounded-full"
              style={{ width: `${70 + i * 15}px`, height: '36px' }}
            />
          ))}
        </div>
      ) : (
        <div
          className="flex gap-2 overflow-x-auto scrollbar-none pb-1 mb-5"
        >
          {categories.map(cat => {
            const isActive = cat.slug === activeSlug
            return (
              <button
                key={cat.id}
                onClick={() => setActiveSlug(cat.slug)}
                className="flex-shrink-0 px-4 py-2 rounded-full text-xs
                           font-bold tracking-wide uppercase
                           transition-all duration-200 active:scale-95"
                style={{
                  background:  isActive ? cat.color        : 'var(--bg-subtle)',
                  color:       isActive ? '#fff'           : 'var(--text-secondary)',
                  border:      `1.5px solid ${isActive ? cat.color : 'var(--border)'}`,
                }}
              >
                {cat.name}
                {cat.article_count > 0 && (
                  <span
                    className="ml-1.5 opacity-70 font-normal"
                  >
                    {cat.article_count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Active tab content */}
      {activeCategory && (
        <TabContent
          key={activeCategory.slug}
          category={activeCategory}
        />
      )}
    </section>
  )
}