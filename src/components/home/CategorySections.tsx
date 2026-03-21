import { Link } from 'react-router-dom'
import { ArrowRight, Clock, Eye, TrendingUp, TrendingDown } from 'lucide-react'
import { useState } from 'react'
import { useCategories } from '../../hooks/useCategories'
import { useArticles } from '../../hooks/useArticles'
import { timeAgo, formatCount } from '../../lib/utils'
import type { Article, Category } from '../../types'

// ══════════════════════════════════════════════════════════════════
// MARKET TICKER
// ══════════════════════════════════════════════════════════════════
interface MarketItem { symbol: string; value: string; pct: string; up: boolean }
const INDIA: MarketItem[] = [
  { symbol: 'SENSEX',     value: '82,450',  pct: '+0.94%', up: true  },
  { symbol: 'NIFTY 50',   value: '24,820',  pct: '+0.87%', up: true  },
  { symbol: 'BANK NIFTY', value: '51,240',  pct: '+1.12%', up: true  },
  { symbol: 'MIDCAP',     value: '44,125',  pct: '-0.29%', up: false },
  { symbol: 'USD/INR',    value: '83.42',   pct: '-0.14%', up: false },
  { symbol: 'GOLD MCX',   value: '₹72,450', pct: '+0.31%', up: true  },
  { symbol: 'CRUDE OIL',  value: '$84.20',  pct: '-0.45%', up: false },
]
const GLOBAL: MarketItem[] = [
  { symbol: 'S&P 500',   value: '5,234',   pct: '+0.55%', up: true  },
  { symbol: 'DOW JONES', value: '39,120',  pct: '+0.37%', up: true  },
  { symbol: 'NASDAQ',    value: '16,340',  pct: '+0.60%', up: true  },
  { symbol: 'FTSE 100',  value: '8,042',   pct: '-0.30%', up: false },
  { symbol: 'NIKKEI',    value: '40,168',  pct: '+0.78%', up: true  },
  { symbol: 'GOLD USD',  value: '$2,580',  pct: '+0.47%', up: true  },
  { symbol: 'BITCOIN',   value: '$68,420', pct: '+2.15%', up: true  },
]

function MarketTicker() {
  const [tab, setTab] = useState<'india' | 'global'>('india')
  const data = tab === 'india' ? INDIA : GLOBAL
  return (
    <div className="rounded-lg overflow-hidden mb-6"
      style={{ border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between px-4 py-2.5"
        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black tracking-[0.2em] uppercase"
            style={{ color: 'var(--text-primary)' }}>Market Pulse</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot"
              style={{ background: '#22c55e' }} />
            <span className="text-[9px] font-bold uppercase tracking-widest"
              style={{ color: '#22c55e' }}>Live</span>
          </span>
        </div>
        <div className="flex text-[10px] font-bold tracking-wide uppercase overflow-hidden rounded-md"
          style={{ border: '1px solid var(--border)' }}>
          {(['india', 'global'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-3 py-1 transition-all duration-150"
              style={{
                background: tab === t ? 'var(--accent)' : 'var(--bg-subtle)',
                color:      tab === t ? '#fff'          : 'var(--text-secondary)',
              }}>
              {t === 'india' ? '🇮🇳 India' : '🌐 Global'}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-none px-3 py-3"
        style={{ background: 'var(--bg-subtle)' }}>
        <div className="flex gap-2 min-w-max">
          {data.map(item => (
            <div key={item.symbol} className="flex-shrink-0 px-3 py-2 rounded-md"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-muted)', minWidth: '100px' }}>
              <div className="text-[9px] font-black tracking-widest uppercase"
                style={{ color: 'var(--text-muted)' }}>{item.symbol}</div>
              <div className="text-sm font-bold font-display mt-0.5"
                style={{ color: 'var(--text-primary)' }}>{item.value}</div>
              <div className="flex items-center gap-0.5 mt-0.5"
                style={{ color: item.up ? '#16a34a' : '#dc2626' }}>
                {item.up ? <TrendingUp size={9} strokeWidth={2.5} /> : <TrendingDown size={9} strokeWidth={2.5} />}
                <span className="text-[10px] font-bold">{item.pct}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 py-1.5 text-right"
        style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
          Data indicative · Not investment advice
        </span>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// META ROW
// ══════════════════════════════════════════════════════════════════
function Meta({ article }: { article: Article }) {
  return (
    <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-xs mt-2.5"
      style={{ color: 'var(--text-muted)' }}>
      <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
        {article.author_name}
      </span>
      <span>·</span>
      <span className="flex items-center gap-1">
        <Clock size={10} />{timeAgo(article.published_at)}
      </span>
      <span>·</span>
      <span>{article.reading_time} min</span>
      {article.view_count > 500 && (
        <><span>·</span>
        <span className="flex items-center gap-1">
          <Eye size={10} />{formatCount(article.view_count)}
        </span></>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// ARTICLE CONTENT BLOCK
// Handles both image and no-image cases cleanly
// No special backgrounds — just text like a newspaper column
// ══════════════════════════════════════════════════════════════════

// Full article cell — heading + desc + image (or content)
// size controls how much vertical space it takes
function ArticleCell({
  article,
  size = 'md',
}: {
  article: Article
  size?:   'lg' | 'md' | 'sm'
}) {
  const headingSize =
    size === 'lg' ? 'clamp(22px, 3vw, 30px)' :
    size === 'md' ? 'clamp(17px, 2.2vw, 22px)' :
                   'clamp(14px, 1.8vw, 17px)'

  const excerptLines = size === 'lg' ? 4 : size === 'md' ? 3 : 2
  const imgHeight    = size === 'lg' ? 240 : size === 'md' ? 180 : 140

  return (
    <Link
      to={`/article/${article.slug}`}
      className="group flex flex-col h-full"
    >
      {/* Breaking */}
      {article.is_breaking && (
        <span className="breaking-strip mb-2.5 self-start">● Breaking</span>
      )}

      {/* Headline — always first */}
      <h3
        className="font-display font-bold leading-tight tracking-tight
                   transition-colors duration-150
                   group-hover:text-[var(--accent)]"
        style={{ fontSize: headingSize, color: 'var(--text-primary)' }}
      >
        {article.title}
      </h3>

      {/* Subtitle */}
      {article.subtitle && (
        <p className="text-sm font-medium leading-relaxed mt-2"
          style={{ color: 'var(--text-secondary)' }}>
          {article.subtitle}
        </p>
      )}

      {/* Excerpt */}
      {article.excerpt && (
        <p
          className="text-sm leading-relaxed mt-2"
          style={{
            color:              'var(--text-secondary)',
            display:            '-webkit-box',
            WebkitLineClamp:    excerptLines,
            WebkitBoxOrient:    'vertical',
            overflow:           'hidden',
          }}
        >
          {article.excerpt}
        </p>
      )}

      {/* Meta */}
      <Meta article={article} />

      {/* Image OR more content — no special background */}
      <div className="mt-4 flex-1">
        {article.cover_image ? (
          <div className="w-full rounded-lg overflow-hidden"
            style={{ height: `${imgHeight}px` }}>
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-full object-cover transition-transform
                         duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        ) : (
          // No image — extend the body content naturally
          // like a newspaper column, no box, no background
          <div>
            {article.body && (
              <p
                className="text-sm leading-relaxed"
                style={{
                  color:           'var(--text-secondary)',
                  display:         '-webkit-box',
                  WebkitLineClamp: size === 'lg' ? 8 : 5,
                  WebkitBoxOrient: 'vertical',
                  overflow:        'hidden',
                }}
                dangerouslySetInnerHTML={{
                  __html: article.body.replace(/<[^>]*>/g, ' ').slice(0, 600)
                }}
              />
            )}
            {!article.body && article.excerpt && (
              <p
                className="text-sm leading-relaxed"
                style={{
                  color:           'var(--text-secondary)',
                  display:         '-webkit-box',
                  WebkitLineClamp: size === 'lg' ? 6 : 4,
                  WebkitBoxOrient: 'vertical',
                  overflow:        'hidden',
                }}
              >
                {article.excerpt}
              </p>
            )}
            {/* Read more — inline, no button, newspaper style */}
            <span
              className="inline-block mt-3 text-xs font-bold
                         tracking-widest uppercase transition-colors
                         group-hover:opacity-70"
              style={{ color: 'var(--accent)' }}
            >
              Read more →
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}

// Small stacked card — for the bottom-right slot in 4+ layout
function SmallStackCard({ article }: { article: Article }) {
  return (
    <Link
      to={`/article/${article.slug}`}
      className="group py-3 flex flex-col"
      style={{ borderBottom: '1px solid var(--border-muted)' }}
    >
      <h4
        className="font-display font-bold leading-tight tracking-tight
                   line-clamp-2 transition-colors duration-150
                   group-hover:text-[var(--accent)]"
        style={{ fontSize: '15px', color: 'var(--text-primary)' }}
      >
        {article.title}
      </h4>
      {article.excerpt && (
        <p className="text-xs leading-relaxed mt-1 line-clamp-2"
          style={{ color: 'var(--text-secondary)' }}>
          {article.excerpt}
        </p>
      )}
      <div className="flex items-center gap-1.5 text-[11px] mt-1.5"
        style={{ color: 'var(--text-muted)' }}>
        <Clock size={10} />{timeAgo(article.published_at)}
        <span>·</span>{article.reading_time} min
      </div>
    </Link>
  )
}

// ══════════════════════════════════════════════════════════════════
// VERTICAL DIVIDER — the line between left and right columns
// ══════════════════════════════════════════════════════════════════
const ColDivider = () => (
  <div
    className="hidden md:block w-px self-stretch flex-shrink-0"
    style={{ background: 'var(--border-muted)' }}
  />
)

// ══════════════════════════════════════════════════════════════════
// HORIZONTAL DIVIDER
// ══════════════════════════════════════════════════════════════════
const RowDivider = () => (
  <div
    className="w-full h-px my-8"
    style={{ background: 'var(--border-muted)' }}
  />
)

// ══════════════════════════════════════════════════════════════════
// NEWSPAPER GRID LAYOUTS
// ══════════════════════════════════════════════════════════════════
function Layout1({ articles }: { articles: Article[] }) {
  // 1 article — 100% full width
  return (
    <div className="w-full">
      <ArticleCell article={articles[0]} size="lg" />
    </div>
  )
}

function Layout2({ articles }: { articles: Article[] }) {
  // 2 articles — 50% | 50%, images at same level
  return (
    <div className="flex flex-col md:flex-row gap-0 md:gap-8 items-stretch">
      <div className="flex-1">
        <ArticleCell article={articles[0]} size="md" />
      </div>
      <ColDivider />
      <div className="flex-1">
        <ArticleCell article={articles[1]} size="md" />
      </div>
    </div>
  )
}

function Layout3({ articles }: { articles: Article[] }) {
  // 3 articles:
  // Top 50% → article 1 full width
  // Bottom 50% → article 2 left | article 3 right
  return (
    <div>
      {/* Top row — full width */}
      <ArticleCell article={articles[0]} size="lg" />

      <RowDivider />

      {/* Bottom row — two halves */}
      <div className="flex flex-col md:flex-row gap-0 md:gap-8 items-stretch">
        <div className="flex-1">
          <ArticleCell article={articles[1]} size="md" />
        </div>
        <ColDivider />
        <div className="flex-1">
          <ArticleCell article={articles[2]} size="md" />
        </div>
      </div>
    </div>
  )
}

function Layout4Plus({
  articles,
  flip,
}: {
  articles: Article[]
  flip:     boolean
}) {
  // 4+ articles:
  // Top 50% → article 1 full width
  // Bottom left 50% → article 2
  // Bottom right 50% → article 3 + stacked small cards for rest
  // flip alternates which side is the single article
  const bottomLeft  = flip ? articles[2] : articles[1]
  const bottomRight = flip ? articles[1] : articles[2]
  const stacked     = articles.slice(3)

  return (
    <div>
      {/* Top — full width */}
      <ArticleCell article={articles[0]} size="lg" />

      <RowDivider />

      {/* Bottom — two halves */}
      <div className="flex flex-col md:flex-row gap-0 md:gap-8 items-start">

        {/* Left half */}
        <div className="flex-1">
          <ArticleCell article={bottomLeft} size="md" />
        </div>

        <ColDivider />

        {/* Right half — article + stacked smalls */}
        <div className="flex-1 flex flex-col">
          <ArticleCell article={bottomRight} size="md" />

          {stacked.length > 0 && (
            <div
              className="mt-5 pt-5"
              style={{ borderTop: '1px solid var(--border-muted)' }}
            >
              {stacked.slice(0, 3).map(a => (
                <SmallStackCard key={a.id} article={a} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// SKELETON
// ══════════════════════════════════════════════════════════════════
function BlockSkeleton() {
  return (
    <div className="py-8" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="skeleton w-1.5 h-7 rounded-full" />
          <div className="skeleton h-7 w-32 rounded" />
        </div>
        <div className="skeleton h-4 w-24 rounded" />
      </div>
      <div className="space-y-3 mb-6">
        <div className="skeleton h-7 w-full rounded" />
        <div className="skeleton h-7 w-4/5 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-32 rounded" />
        <div className="skeleton rounded-lg w-full" style={{ height: '220px' }} />
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// CATEGORY BLOCK
// ══════════════════════════════════════════════════════════════════
function CategoryBlock({
  category,
  index,
}: {
  category: Category
  index:    number
}) {
  const { articles, loading } = useArticles({
    category: category.slug,
    limit:    6,
  })

  const flip      = index % 2 !== 0
  const isMarkets = category.slug === 'markets'
  const count     = articles.length

  if (loading) return <BlockSkeleton />
  if (count === 0) return null

  return (
    <div
      id={category.slug}
      className="py-8 scroll-mt-28"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      {/* Category header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div
            className="w-1.5 h-7 rounded-full flex-shrink-0"
            style={{ background: category.color }}
          />
          <h2
            className="font-display font-bold tracking-tight uppercase"
            style={{
              fontSize: 'clamp(20px, 3.5vw, 28px)',
              color:    'var(--text-primary)',
            }}
          >
            {category.name}
          </h2>
          {category.article_count > 0 && (
            <span
              className="hidden sm:inline-block text-[10px] font-bold
                         px-2 py-0.5 rounded-sm tracking-wide uppercase"
              style={{
                background: category.color + '15',
                color:      category.color,
              }}
            >
              {category.article_count} stories
            </span>
          )}
        </div>

        <Link
          to={`/category/${category.slug}`}
          className="flex items-center gap-1.5 text-xs font-bold
                     tracking-widest uppercase flex-shrink-0
                     transition-all duration-200 hover:gap-2.5"
          style={{ color: category.color }}
        >
          All {category.name}
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* Markets: ticker first */}
      {isMarkets && <MarketTicker />}

      {/* Layout based on article count */}
      {count === 1 && <Layout1 articles={articles} />}
      {count === 2 && <Layout2 articles={articles} />}
      {count === 3 && <Layout3 articles={articles} />}
      {count >= 4  && <Layout4Plus articles={articles} flip={flip} />}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════
export default function CategorySections() {
  const { categories, loading } = useCategories()

  return (
    <section className="page-container py-2 md:py-4">
      <div
        className="flex items-center justify-between pb-3"
        style={{ borderBottom: '2px solid var(--border)' }}
      >
        <span
          className="font-display font-black tracking-tight uppercase"
          style={{
            fontSize: 'clamp(28px, 5vw, 42px)',
            color:    'var(--text-primary)',
          }}
        >
          Latest News
        </span>
        <Link
          to="/articles"
          className="text-xs font-bold tracking-widest uppercase
                     hover:opacity-70 transition-opacity"
          style={{ color: 'var(--accent)' }}
        >
          All News →
        </Link>
      </div>

      {loading
        ? Array(3).fill(null).map((_, i) => <BlockSkeleton key={i} />)
        : categories.map((cat, i) => (
            <CategoryBlock key={cat.id} category={cat} index={i} />
          ))
      }
    </section>
  )
}