import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize:        (config: object) => void
          renderButton:      (el: HTMLElement, config: object) => void
          disableAutoSelect: () => void
          cancel:            () => void
        }
      }
    }
  }
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string

// Module-level state — persists across component mounts/unmounts
// This prevents the double-initialization error from StrictMode
let gsiReady    = false
let gsiLoading  = false
let gsiInitDone = false   // ← tracks if initialize() was called
const queue: (() => void)[] = []

function loadGSI(cb: () => void) {
  if (gsiReady)   { cb(); return }
  queue.push(cb)
  if (gsiLoading) return
  gsiLoading = true

  const script  = document.createElement('script')
  script.src    = 'https://accounts.google.com/gsi/client'
  script.async  = true
  script.defer  = true
  script.onload = () => {
    gsiReady = true
    queue.forEach(fn => fn())
    queue.length = 0
  }
  document.head.appendChild(script)
}

export function useGoogleButton(
  containerRef: React.RefObject<HTMLDivElement>,
  onSuccess:    (idToken: string) => Promise<void>,
  onError:      (msg: string)     => void,
) {
  const buttonRendered = useRef(false)

  useEffect(() => {
    if (!CLIENT_ID) {
      console.warn('[Google Auth] VITE_GOOGLE_CLIENT_ID not set')
      return
    }

    const tryRender = () => {
      if (!window.google)          return
      if (!containerRef.current)   return
      if (buttonRendered.current)  return

      const width = containerRef.current.offsetWidth
      if (width === 0) return

      // Only call initialize() once per page load
      // Multiple calls cause the GSI warning and unpredictable behavior
      if (!gsiInitDone) {
        gsiInitDone = true
        window.google.accounts.id.initialize({
          client_id:             CLIENT_ID,
          callback:              (res: { credential?: string }) => {
            if (res.credential) {
              onSuccess(res.credential).catch(() =>
                onError('Google sign-in failed. Please try again.')
              )
            } else {
              onError('Google sign-in failed. Please try again.')
            }
          },
          auto_select:           false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt:  false,
        })
      }

      buttonRendered.current = true

      window.google.accounts.id.renderButton(containerRef.current, {
        type:           'standard',
        theme:          'outline',
        size:           'large',
        text:           'continue_with',
        shape:          'rectangular',
        width:          width,
        logo_alignment: 'left',
      })
    }

    // Wait for container to have real width (mobile fix)
    let observer: ResizeObserver | null = null

    const el = containerRef.current
    if (el) {
      observer = new ResizeObserver(() => {
        if (!buttonRendered.current && (el.offsetWidth > 0)) {
          tryRender()
        }
      })
      observer.observe(el)
    }

    loadGSI(tryRender)

    return () => {
      observer?.disconnect()
    }
  }, [])   // ← empty deps, runs once per mount
}