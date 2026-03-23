import { useEffect, useRef, useId } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render:  (container: string | HTMLElement, options: object) => string
      reset:   (widgetId: string) => void
      remove:  (widgetId: string) => void
    }
    onTurnstileLoad?: () => void
  }
}

interface TurnstileProps {
  onVerify:   (token: string) => void
  onError?:   () => void
  onExpire?:  () => void
  theme?:     'light' | 'dark' | 'auto'
  className?: string
}

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string

let tsLoaded  = false
let tsLoading = false
const tsCallbacks: (() => void)[] = []

function loadTurnstile(cb: () => void) {
  if (tsLoaded)  { cb(); return }
  tsCallbacks.push(cb)
  if (tsLoading) return
  tsLoading = true

  window.onTurnstileLoad = () => {
    tsLoaded = true
    tsCallbacks.forEach(fn => fn())
    tsCallbacks.length = 0
  }

  const script  = document.createElement('script')
  script.src    = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad'
  script.async  = true
  script.defer  = true
  document.head.appendChild(script)
}

export default function Turnstile({
  onVerify,
  onError,
  onExpire,
  theme = 'auto',
  className,
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetId     = useRef<string | null>(null)
  const uid          = useId()

  useEffect(() => {
    if (!SITE_KEY || SITE_KEY === 'your_turnstile_site_key') return

    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current) return
      if (widgetId.current) return // already rendered

      widgetId.current = window.turnstile.render(containerRef.current, {
        sitekey:            SITE_KEY,
        theme,
        size:               'flexible',   // ← key fix: flexible fills container width
        callback:           (token: string) => onVerify(token),
        'error-callback':   () => onError?.(),
        'expired-callback': () => {
          onExpire?.()
          if (widgetId.current && window.turnstile) {
            window.turnstile.reset(widgetId.current)
          }
        },
      })
    }

    loadTurnstile(renderWidget)

    return () => {
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current)
        widgetId.current = null
      }
    }
  }, [])

  if (!SITE_KEY || SITE_KEY === 'your_turnstile_site_key') return null

  return (
    <div
      ref={containerRef}
      id={uid}
      className={className}
      // Explicit min-height prevents layout collapse on mobile
      // before the iframe loads
      style={{ minHeight: '65px', width: '100%' }}
    />
  )
}
