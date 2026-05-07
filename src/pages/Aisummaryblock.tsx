// AISummaryBlock — streaming-feel AI summary for article pages
// Drop inside the article column, just before the cover image.
// Future: replace simulateStream with real SSE when Q&A is added.

import { useState, useEffect, useRef } from 'react'

function clean(summary: string) {
  return summary
    .replace(/^here is (a |an )?(ai[- ])?summary[^:]*:\s*/i, '')
    .trim()
}

interface Props {
  summary: string
}

export default function AISummaryBlock({ summary }: Props) {
  const text            = clean(summary)
  const words           = text.split(' ')
  const [displayed, setDisplayed] = useState('')
  const [done,      setDone]      = useState(false)
  const indexRef    = useRef(0)
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Reset on new article
    setDisplayed('')
    setDone(false)
    indexRef.current = 0

    // Small initial delay — feels like the model is "thinking"
    const startDelay = setTimeout(() => {
      const tick = () => {
        if (indexRef.current >= words.length) {
          setDone(true)
          return
        }
        // Drip 1–2 words per tick, slightly variable speed for realism
        const chunk = words.slice(indexRef.current, indexRef.current + 2).join(' ')
        setDisplayed(prev => prev ? prev + ' ' + chunk : chunk)
        indexRef.current += 2
        const delay = 28 + Math.random() * 24
        timerRef.current = setTimeout(tick, delay)
      }
      tick()
    }, 420)

    return () => {
      clearTimeout(startDelay)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [summary]) // re-run if article changes

  return (
    <div className="mb-8">

      {/* Tiny label — sits above like a section descriptor */}
      <span
        className="text-[10px] font-bold uppercase tracking-widest block mb-2"
        style={{ color: 'var(--text-muted)' }}
      >
        Summary{!done && (
          <span
            className="inline-block w-1 h-1 rounded-full ml-1.5 align-middle animate-pulse"
            style={{ background: 'var(--text-muted)' }}
          />
        )}
      </span>

      {/* Summary — no box, just a left rule like a blockquote */}
      <p
        className="text-base leading-relaxed"
        style={{
          color:       'var(--text-secondary)',
          paddingLeft: '14px',
          borderLeft:  '2px solid var(--border)',
        }}
      >
        {displayed}
        {!done && (
          <span
            className="inline-block w-[2px] h-[14px] ml-0.5 align-middle rounded-sm"
            style={{
              background: 'var(--text-muted)',
              animation:  'blink 0.9s step-end infinite',
            }}
          />
        )}
      </p>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </div>
  )
}