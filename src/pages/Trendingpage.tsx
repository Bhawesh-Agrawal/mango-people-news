/**
 * TrendingPage.tsx — /trending
 *
 * Editorial news trending — dense, information-rich, not card-grid YouTube style.
 * Layout: masthead → time filter → ranked article rows like a newspaper "Most Read" column.
 * Each row is a compact horizontal strip: rank number, category, headline, byline, stats.
 * Top story gets a feature treatment with image. Rest are pure text rows.
 *
 * Backend: GET /api/v1/articles/trending?limit=25&days=1|7|30
 */

import { useState, useEffect } from 'react'
import { TrendingUp }           from 'lucide-react'
import { client }               from '../api/client'
import type { Article }         from '../types'
import SEO                     from '../seo/Seo'

type Period = 'today' | 'week' | 'month' | 'all'

const PERIODS: { key: Period; label: string; days: number | null }[] = [
  { key: 'today', label: 'Today',      days: 1    },
  { key: 'week',  label: 'This Week',  days: 7    },
  { key: 'month', label: 'This Month', days: 30   },
  { key: 'all',   label: 'All Time',   days: 3650 },
]

export default function TrendingPage() {
  const [period,   setPeriod]   = useState<Period>('week')
  const [, setArticles] = useState<Article[]>([])
  const [, setLoading]   = useState(true)

  const { days } = PERIODS.find(p => p.key === period)!

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    client
      .get('/articles/trending', { params: { limit: 25, days } })
      .then(res => {
        if (cancelled) return
        const data: Article[] = res.data?.data ?? []
        setArticles(data)
      })
      .catch(() => {
        if (!cancelled) setArticles([])
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [days])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <SEO title="Trending News" path="/trending" />
      <div className="page-container py-8">

        {/* ── Masthead ───────────────────────────────────────── */}
        <div
          className="pb-5 mb-6"
          style={{ borderBottom: '3px solid var(--text-primary)' }}
        >
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: 'var(--accent)' }}
                >
                  Most Read
                </span>
              </div>
              <h1
                className="font-display font-bold leading-none"
                style={{
                  fontSize:      'clamp(28px, 5vw, 42px)',
                  color:         'var(--text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                Trending Stories
              </h1>
            </div>

            {/* Period filter — tab-style, inline */}
            <div className="flex items-center gap-0" style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
              {PERIODS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setPeriod(key)}
                  className="px-4 py-2 text-xs font-semibold transition-all duration-150"
                  style={{
                    background:  period === key ? 'var(--text-primary)' : 'transparent',
                    color:       period === key ? 'var(--bg)'           : 'var(--text-muted)',
                    borderRight: key !== 'all'  ? '1px solid var(--border)' : 'none',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

