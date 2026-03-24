import { useState } from 'react'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'

interface MarketItem {
  symbol: string
  name:   string
  value:  string
  change: string
  pct:    string
  up:     boolean
}

const INDIA_DATA: MarketItem[] = [
  { symbol: 'SENSEX',    name: 'BSE Sensex',    value: '82,450.30', change: '+764.20', pct: '+0.94%', up: true  },
  { symbol: 'NIFTY',     name: 'Nifty 50',      value: '24,820.15', change: '+212.80', pct: '+0.87%', up: true  },
  { symbol: 'BANKNIFTY', name: 'Bank Nifty',    value: '51,240.60', change: '+573.40', pct: '+1.12%', up: true  },
  { symbol: 'MIDCAP',    name: 'Nifty Midcap',  value: '44,125.70', change: '-128.30', pct: '-0.29%', up: false },
  { symbol: 'USD/INR',   name: 'USD / INR',     value: '83.42',     change: '-0.12',   pct: '-0.14%', up: false },
  { symbol: 'GOLD',      name: 'Gold (MCX)',     value: '₹72,450',   change: '+220',    pct: '+0.31%', up: true  },
  { symbol: 'CRUDE',     name: 'Crude Oil',      value: '$84.20',    change: '-0.38',   pct: '-0.45%', up: false },
]

const GLOBAL_DATA: MarketItem[] = [
  { symbol: 'SPX',    name: 'S&P 500',     value: '5,234.18', change: '+28.40', pct: '+0.55%', up: true  },
  { symbol: 'DJI',    name: 'Dow Jones',   value: '39,120.40', change: '+142.60', pct: '+0.37%', up: true  },
  { symbol: 'NASDAQ', name: 'Nasdaq',      value: '16,340.80', change: '+98.20',  pct: '+0.60%', up: true  },
  { symbol: 'FTSE',   name: 'FTSE 100',    value: '8,042.30',  change: '-24.10',  pct: '-0.30%', up: false },
  { symbol: 'NIKKEI', name: 'Nikkei 225',  value: '40,168.70', change: '+312.40', pct: '+0.78%', up: true  },
  { symbol: 'GOLD',   name: 'Gold (USD)',   value: '$2,580.40', change: '+12.20',  pct: '+0.47%', up: true  },
  { symbol: 'BTC',    name: 'Bitcoin',      value: '$68,420',   change: '+1,440',  pct: '+2.15%', up: true  },
]

export default function MarketWidget() {
  const [market, setMarket] = useState<'india' | 'global'>('india')

  const data = market === 'india' ? INDIA_DATA : GLOBAL_DATA

  return (
    <div
      className="w-full py-4"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div className="page-container">

        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="section-label">Markets</span>
            {/* Live dot */}
            <span className="flex items-center gap-1">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: '#22c55e',
                  boxShadow:  '0 0 4px #22c55e',
                  animation:  'pulse 2s infinite',
                }}
              />
              <span
                className="text-[9px] font-bold tracking-wide uppercase"
                style={{ color: '#22c55e' }}
              >
                Live
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Delayed note */}
            <span
              className="text-[9px] hidden sm:block"
              style={{ color: 'var(--text-faint, var(--text-muted))' }}
            >
              Data indicative
            </span>

            {/* India / Global toggle */}
            <div
              className="flex rounded-lg overflow-hidden text-[10px] font-bold
                         tracking-wide uppercase"
              style={{ border: '1px solid var(--border)' }}
            >
              <button
                onClick={() => setMarket('india')}
                className="px-3 py-1.5 transition-all duration-200"
                style={{
                  background: market === 'india' ? 'var(--accent)' : 'var(--bg-subtle)',
                  color:      market === 'india' ? '#fff'          : 'var(--text-secondary)',
                }}
              >
                🇮🇳 India
              </button>
              <button
                onClick={() => setMarket('global')}
                className="px-3 py-1.5 transition-all duration-200"
                style={{
                  background: market === 'global' ? 'var(--accent)' : 'var(--bg-subtle)',
                  color:      market === 'global' ? '#fff'          : 'var(--text-secondary)',
                }}
              >
                🌐 Global
              </button>
            </div>

            {/* Refresh icon */}
            <button
              className="p-1.5 rounded-lg transition-colors"
              style={{
                background: 'var(--bg-subtle)',
                color:      'var(--text-muted)',
              }}
              title="Refresh"
            >
              <RefreshCw size={12} />
            </button>
          </div>
        </div>

        {/* Scrollable ticker row */}
        <div className="overflow-x-auto scrollbar-none -mx-4 px-4">
          <div className="flex gap-3 min-w-max pb-1">
            {data.map(item => (
              <div
                key={item.symbol}
                className="flex-shrink-0 px-3 py-2 rounded-lg"
                style={{
                  background: 'var(--bg-surface)',
                  border:     '1px solid var(--border-muted)',
                  minWidth:   '120px',
                }}
              >
                {/* Symbol */}
                <div
                  className="text-[9px] font-semibold tracking-wide uppercase mb-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {item.symbol}
                </div>

                {/* Value */}
                <div
                  className="text-sm font-bold font-display leading-none"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {item.value}
                </div>

                {/* Change */}
                <div
                  className="flex items-center gap-1 mt-1"
                  style={{ color: item.up ? '#16a34a' : '#dc2626' }}
                >
                  {item.up
                    ? <TrendingUp size={10} strokeWidth={2.5} />
                    : <TrendingDown size={10} strokeWidth={2.5} />
                  }
                  <span className="text-[10px] font-bold">{item.pct}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}