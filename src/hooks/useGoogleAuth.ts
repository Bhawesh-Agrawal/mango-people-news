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

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string

let gsiLoaded  = false
let gsiLoading = false
const pendingCallbacks: (() => void)[] = []

function loadGSI(cb: () => void) {
  if (gsiLoaded)  { cb(); return }
  pendingCallbacks.push(cb)
  if (gsiLoading) return
  gsiLoading = true

  const script  = document.createElement('script')
  script.src    = 'https://accounts.google.com/gsi/client'
  script.async  = true
  script.defer  = true
  script.onload = () => {
    gsiLoaded = true
    pendingCallbacks.forEach(fn => fn())
    pendingCallbacks.length = 0
  }
  document.head.appendChild(script)
}

export function useGoogleButton(
  containerRef: React.RefObject<HTMLDivElement>,
  onSuccess:    (idToken: string) => Promise<void>,
  onError:      (msg: string)     => void,
) {
  const rendered = useRef(false)

  useEffect(() => {
    if (
      !GOOGLE_CLIENT_ID ||
      GOOGLE_CLIENT_ID === 'your_google_client_id.apps.googleusercontent.com'
    ) {
      console.warn('[Google Auth] VITE_GOOGLE_CLIENT_ID not configured')
      return
    }

    const render = () => {
      if (!window.google || !containerRef.current) return
      if (rendered.current) return

      const width = containerRef.current.offsetWidth
      // Don't render until container actually has width
      // (happens on mobile where layout hasn't settled yet)
      if (width === 0) return

      rendered.current = true

      window.google.accounts.id.initialize({
        client_id:             GOOGLE_CLIENT_ID,
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

    // ResizeObserver waits for the container to have real dimensions
    // This is the key fix for mobile — layout may not be settled on mount
    let observer: ResizeObserver | null = null

    if (containerRef.current) {
      observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width > 0 && !rendered.current) {
            render()
          }
        }
      })
      observer.observe(containerRef.current)
    }

    loadGSI(render)

    return () => {
      observer?.disconnect()
    }
  }, [])
}