import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Zap, ChevronLeft, ChevronRight } from 'lucide-react'
import { useArticles } from '../../hooks/useArticles'

export default function BreakingBar() {
  const { articles, loading } = useArticles({ limit: 12 })
  const [current,   setCurrent]   = useState(0)
  const [paused,    setPaused]    = useState(false)
  const [animating, setAnimating] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const breaking = articles.filter(a => a.is_breaking)
  const featured  = articles.filter(a => a.is_featured && !a.is_breaking)
  const rest      = articles.filter(a => !a.is_breaking && !a.is_featured)

  const items = [...breaking, ...featured, ...rest]
    .sort((a, b) => {
      const aWeight = a.is_breaking ? 2 : a.is_featured ? 1 : 0
      const bWeight = b.is_breaking ? 2 : b.is_featured ? 1 : 0
      if (aWeight !== bWeight) return bWeight - aWeight
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    })
    .slice(0, 8)

  const goTo = (index: number) => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => {
      setCurrent(index)
      setAnimating(false)
    }, 200)
  }

  const prev = () => goTo((current - 1 + items.length) % items.length)
  const next = () => goTo((current + 1) % items.length)

  useEffect(() => {
    if (paused || items.length <= 1) return
    intervalRef.current = setInterval(() => {
      goTo((current + 1) % items.length)
    }, 3500)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [paused, items.length, current])

  if (loading || items.length === 0) return null

  const active = items[current]

  const labelText = breaking.length > 0
    ? 'Breaking'
    : featured.length > 0
    ? 'Featured'
    : 'Latest'

  return (
    <div
      className="w-full"
      style={{
        background:   '#0a0e14',
        borderBottom: '2px solid #E8A020',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="page-container">

        {/* ── MOBILE layout ─────────────────────────── */}
        <div className="flex md:hidden flex-col">

          {/* Row 1: label + title */}
          <Link
            to={`/article/${active.slug}`}
            className="flex items-start gap-2.5 pt-2.5 pb-1.5 group"
            style={{
              opacity:    animating ? 0 : 1,
              transition: 'opacity 0.2s ease',
            }}
          >
            {/* Label badge */}
            <div
              className="flex items-center gap-1 px-2 py-0.5
                         rounded-sm flex-shrink-0 mt-0.5"
              style={{ background: '#E8A020' }}
            >
              <Zap size={8} fill="#000" color="#000" />
              <span
                className="text-[9px] font-semibold tracking-wider uppercase"
                style={{ color: '#000' }}
              >
                {labelText}
              </span>
            </div>

            {/* Full title — wraps to 2 lines */}
            <span
              className="text-xs font-semibold leading-snug line-clamp-2
                         group-hover:text-[#E8A020] transition-colors"
              style={{ color: 'rgba(255,255,255,0.9)' }}
            >
              {active.title}
            </span>
          </Link>

          {/* Row 2: category + dots + counter */}
          <div className="flex items-center justify-between pb-2">
            <span
              className="text-[9px] font-bold tracking-wide uppercase"
              style={{ color: active.category_color }}
            >
              {active.category_name}
            </span>

            <div className="flex items-center gap-2">
              {/* Dots */}
              <div className="flex items-center gap-1">
                {items.slice(0, 8).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width:      i === current ? '14px' : '4px',
                      height:     '4px',
                      background: i === current
                        ? '#E8A020'
                        : 'rgba(255,255,255,0.2)',
                    }}
                    aria-label={`Story ${i + 1}`}
                  />
                ))}
              </div>

              {/* Prev / Next */}
              <button
                onClick={prev}
                className="w-5 h-5 flex items-center justify-center
                           rounded hover:bg-white/10 transition-colors"
                style={{ color: 'rgba(255,255,255,0.4)' }}
                aria-label="Previous"
              >
                <ChevronLeft size={11} />
              </button>
              <button
                onClick={next}
                className="w-5 h-5 flex items-center justify-center
                           rounded hover:bg-white/10 transition-colors"
                style={{ color: 'rgba(255,255,255,0.4)' }}
                aria-label="Next"
              >
                <ChevronRight size={11} />
              </button>
            </div>
          </div>
        </div>

        {/* ── DESKTOP layout ────────────────────────── */}
        <div className="hidden md:flex items-center h-10 gap-0">

          {/* Label */}
          <div
            className="flex items-center gap-1.5 px-3 h-full flex-shrink-0"
            style={{ background: '#E8A020' }}
          >
            <Zap size={10} fill="#000" color="#000" />
            <span
              className="text-[10px] font-semibold tracking-[0.06em] uppercase"
              style={{ color: '#000' }}
            >
              {labelText}
            </span>
          </div>

          {/* Divider */}
          <div
            className="w-px h-5 flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          />

          {/* Headline */}
          <Link
            to={`/article/${active.slug}`}
            className="flex-1 min-w-0 px-4 flex items-center gap-3 group"
            style={{
              opacity:    animating ? 0 : 1,
              transition: 'opacity 0.2s ease',
            }}
          >
            <span
              className="flex-shrink-0 text-[9px] font-semibold tracking-wide
                         uppercase px-2 py-0.5 rounded-sm"
              style={{
                background: `${active.category_color}20`,
                color:       active.category_color,
                border:      `1px solid ${active.category_color}40`,
              }}
            >
              {active.category_name}
            </span>

            <span
              className="text-xs font-semibold truncate
                         group-hover:text-[#E8A020] transition-colors duration-150"
              style={{ color: 'rgba(255,255,255,0.88)' }}
            >
              {active.title}
            </span>

            <ChevronRight
              size={12}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100
                         transition-all duration-150 -ml-1
                         group-hover:translate-x-0.5"
              style={{ color: '#E8A020' }}
            />
          </Link>

          {/* Counter + controls */}
          <div className="flex items-center gap-1.5 pr-2 flex-shrink-0">
            <span
              className="text-[10px] font-mono tabular-nums"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              {String(current + 1).padStart(2, '0')}/{String(items.length).padStart(2, '0')}
            </span>

            <div
              className="h-4 w-px"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            />

            <button
              onClick={prev}
              className="w-6 h-6 flex items-center justify-center
                         rounded transition-colors hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              aria-label="Previous story"
            >
              <ChevronLeft size={12} />
            </button>
            <button
              onClick={next}
              className="w-6 h-6 flex items-center justify-center
                         rounded transition-colors hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              aria-label="Next story"
            >
              <ChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {!paused && (
          <div
            className="h-px w-full"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <div
              key={current}
              className="h-full"
              style={{
                background:      '#E8A020',
                width:           '100%',
                transformOrigin: 'left',
                animation:       'tickerProgress 3.5s linear forwards',
              }}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes tickerProgress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>
    </div>
  )
}