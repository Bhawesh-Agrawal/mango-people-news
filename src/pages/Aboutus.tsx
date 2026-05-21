import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Users, Zap, CheckCircle } from 'lucide-react'
import { useArticles } from '../hooks/useArticles'
import { cloudinaryUrl } from '../lib/utils'

// ── Internal article link card ────────────────────────────────────
function ArticleCard({ article }: { article: any }) {
  return (
    <Link
      to={`/article/${article.slug}`}
      className="group flex gap-4 p-4 rounded-2xl transition-all duration-200
                 hover:bg-[var(--bg-subtle)]"
      style={{ border: '1px solid var(--border)' }}
    >
      {article.cover_image && (
        <div className="flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden">
          <img
            src={cloudinaryUrl(article.cover_image, 80, 64)}
            alt={article.title}
            className="w-full h-full object-cover transition-transform
                       duration-500 group-hover:scale-105"
            loading="lazy"
            width={80}
            height={64}
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {article.category_name && (
          <span
            className="cat-label block mb-1"
            style={{ color: article.category_color }}
          >
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
      </div>
      <ArrowRight
        size={16}
        className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100
                   transition-all duration-200 -translate-x-1
                   group-hover:translate-x-0"
        style={{ color: 'var(--accent)' }}
      />
    </Link>
  )
}

// ── Main ──────────────────────────────────────────────────────────
export default function AboutPage() {
  const { articles, loading } = useArticles({ limit: 6 })

  const pillars = [
    {
      icon: Shield,
      title: 'Cross-Verified',
      desc: 'Every story is checked against multiple sources before it reaches you. We don\'t publish rumours.',
    },
    {
      icon: CheckCircle,
      title: 'Trustworthy',
      desc: 'No clickbait, no hidden agenda. Just straightforward reporting that respects your intelligence.',
    },
    {
      icon: Zap,
      title: 'Actually Useful',
      desc: 'We ask: does this help someone understand the world better? If not, we don\'t publish it.',
    },
    {
      icon: Users,
      title: 'Built by Students',
      desc: 'We\'re young, curious, and frustrated by complicated news. So we\'re building something better.',
    },
  ]

  return (
    <main className="page-container py-10 md:py-16 max-w-3xl mx-auto">

      {/* ── Hero ───────────────────────────────────── */}
      <div className="mb-14">
        <span className="cat-label block mb-4">About Us</span>

        <h1
          className="font-display font-black leading-tight tracking-tight mb-5"
          style={{
            fontSize: 'clamp(32px, 6vw, 52px)',
            color: 'var(--text-primary)',
          }}
        >
          News for the{' '}
          <span style={{ color: 'var(--accent)' }}>Aam Aadmi.</span>
        </h1>

        <p
          className="text-lg leading-relaxed mb-4"
          style={{ color: 'var(--text-secondary)' }}
        >
          Mango People is a news platform built for everyday Indians — the kind of
          people who want to understand what's happening in business, markets, and
          the economy, without needing a finance degree to do it.
        </p>

        <p
          className="text-base leading-relaxed"
          style={{ color: 'var(--text-muted)' }}
        >
          "Aam aadmi" means the common person. That's exactly who we write for —
          not investors, not analysts, not insiders. Just regular people who deserve
          clear, honest, useful news.
        </p>
      </div>

      {/* ── Divider ────────────────────────────────── */}
      <div
        className="h-px w-full mb-14"
        style={{ background: 'var(--border)' }}
      />

      {/* ── Our story ──────────────────────────────── */}
      <div className="mb-14 space-y-4">
        <span className="section-label">Our Story</span>
        <h2
          className="font-display font-black text-2xl md:text-3xl
                     leading-tight tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Started by students. Driven by curiosity.
        </h2>
        <p
          className="text-base leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          We're a team of students who got tired of business news that felt either
          too complex or too dumbed-down. The good publications talked over our
          heads. The simpler ones left out everything important.
        </p>
        <p
          className="text-base leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          So we decided to build what we actually wanted to read — news that
          treats the reader as an intelligent adult, explains context without
          condescension, and doesn't waste your time.
        </p>
        <p
          className="text-base leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          We're still learning. But we're learning in public, and we're committed
          to getting better every day.
        </p>
      </div>

      {/* ── Pillars ────────────────────────────────── */}
      <div className="mb-14">
        <span className="section-label block mb-6">What We Stand For</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pillars.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-5 rounded-2xl space-y-3"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--accent-light)' }}
              >
                <Icon size={18} style={{ color: 'var(--accent)' }} />
              </div>
              <h3
                className="font-bold text-base"
                style={{ color: 'var(--text-primary)' }}
              >
                {title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Divider ────────────────────────────────── */}
      <div
        className="h-px w-full mb-14"
        style={{ background: 'var(--border)' }}
      />

      {/* ── Promise ────────────────────────────────── */}
      <div
        className="mb-14 p-7 rounded-2xl"
        style={{
          background: 'var(--accent-light)',
          border: '1px solid var(--border)',
        }}
      >
        <h2
          className="font-display font-black text-xl md:text-2xl
                     leading-tight tracking-tight mb-3"
          style={{ color: 'var(--accent)' }}
        >
          Our promise to you
        </h2>
        <ul className="space-y-2">
          {[
            'We will never publish something we haven\'t verified.',
            'We will tell you when we\'re uncertain about something.',
            'We will correct mistakes quickly and transparently.',
            'We will never let advertisers influence our editorial decisions.',
            'We will keep writing for the aam aadmi — not for the boardroom.',
          ].map(line => (
            <li
              key={line}
              className="flex items-start gap-2.5 text-sm leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              <CheckCircle
                size={15}
                className="flex-shrink-0 mt-0.5"
                style={{ color: 'var(--accent)' }}
              />
              {line}
            </li>
          ))}
        </ul>
      </div>

      {/* ── CTA ────────────────────────────────────── */}
      <div className="mb-14 flex flex-wrap gap-3">
        <Link to="/articles" className="btn-accent text-sm h-10 px-5 inline-flex items-center gap-2">
          Read our articles <ArrowRight size={14} />
        </Link>
        <Link to="/contact" className="btn-ghost text-sm h-10 px-5 inline-flex items-center gap-2">
          Get in touch
        </Link>
      </div>

      {/* ── Latest articles ────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <span className="section-label">Latest from us</span>
          <Link
            to="/articles"
            className="flex items-center gap-1 text-[11px] font-bold
                       tracking-wide uppercase hover:opacity-70 transition-opacity"
            style={{ color: 'var(--accent)' }}
          >
            All News <ArrowRight size={11} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(n => (
              <div
                key={n}
                className="flex gap-4 p-4 rounded-2xl"
                style={{ border: '1px solid var(--border)' }}
              >
                <div className="skeleton w-20 h-16 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="skeleton h-2.5 w-20 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-4 w-3/4 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}