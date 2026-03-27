import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { useMarketData } from '../../hooks/useMarketData'
import type { Quote } from '../../hooks/useMarketData'

function QuoteChip({ q }: { q: Quote }) {
  const color = q.isUp ? '#15803D' : '#B91C1C'
  const bg    = q.isUp ? '#F0FDF4' : '#FEF2F2'

  return (
    <div
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg flex-shrink-0"
      style={{ background: bg, border: `1px solid ${q.isUp ? '#BBF7D0' : '#FECACA'}` }}
    >
      <div>
        <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
          {q.name}
        </p>
        <p className="text-sm font-bold tabular-nums" style={{ color }}>
          {q.currency === 'INR'
            ? `₹${q.price.toLocaleString('en-IN')}`
            : q.symbol.includes('/')
              ? q.price.toLocaleString('en-US', { minimumFractionDigits: 2 })
              : q.price.toLocaleString('en-US')
          }
        </p>
      </div>
      <div
        className="flex items-center gap-0.5 text-xs font-semibold"
        style={{ color }}
      >
        {q.isUp
          ? <TrendingUp  size={12} />
          : <TrendingDown size={12} />
        }
        {q.changePct >= 0 ? '+' : ''}{q.changePct.toFixed(2)}%
      </div>
    </div>
  )
}

export default function MarketTicker() {
  const { quotes, loading, lastUpdated } = useMarketData()

  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto scrollbar-none py-3">
        {[1,2,3,4,5,6].map(n => (
          <div key={n}
            className="skeleton flex-shrink-0 rounded-lg"
            style={{ width: '140px', height: '56px' }}
          />
        ))}
      </div>
    )
  }

  if (quotes.length === 0) return null

  return (
    <div>
      <div className="flex gap-3 overflow-x-auto scrollbar-none py-3">
        {quotes.map(q => (
          <QuoteChip key={q.symbol} q={q} />
        ))}
      </div>
      {lastUpdated && (
        <p
          className="flex items-center gap-1 text-[11px] pb-1"
          style={{ color: 'var(--text-faint)' }}
        >
          <RefreshCw size={10} />
          Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          {' '}· Delayed 15 min
        </p>
      )}
    </div>
  )
}