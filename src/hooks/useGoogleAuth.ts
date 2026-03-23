import { useEffect, useRef } from 'react'

// Extend Window to include Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize:        (config: object) => void
          renderButton:      (el: HTMLElement, config: object) => void
          disableAutoSelect: () => void
        }
      }
    }
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string

let gsiLoaded   = false
let gsiLoading  = false
const callbacks: (() => void)[] = []

// Load GSI script once globally
function loadGSI(cb: () => void) {
  if (gsiLoaded) { cb(); return }
  callbacks.push(cb)
  if (gsiLoading) return
  gsiLoading = true

  const script    = document.createElement('script')
  script.src      = 'https://accounts.google.com/gsi/client'
  script.async    = true
  script.defer    = true
  script.onload   = () => {
    gsiLoaded = true
    callbacks.forEach(fn => fn())
    callbacks.length = 0
  }
  document.head.appendChild(script)
}

export function useGoogleButton(
  containerRef: React.RefObject<HTMLDivElement>,
  onSuccess:    (idToken: string) => Promise<void>,
  onError:      (msg: string)     => void,
) {
  const initialised = useRef(false)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'your_google_client_id.apps.googleusercontent.com') {
      console.warn('[Google Auth] VITE_GOOGLE_CLIENT_ID not configured')
      return
    }
    if (initialised.current) return

    loadGSI(() => {
      if (!window.google || !containerRef.current || initialised.current) return
      initialised.current = true

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
        type:  'standard',
        theme: 'outline',
        size:  'large',
        text:  'continue_with',
        shape: 'rectangular',
        width: containerRef.current.offsetWidth || 360,
        logo_alignment: 'left',
      })
    })
  }, [containerRef, onSuccess, onError])
}