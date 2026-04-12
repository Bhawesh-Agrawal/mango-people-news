import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'

const BASE_URL = (import.meta.env.VITE_API_URL ?? '') + '/api/v1'

// ── Create instance ───────────────────────────────────────────
export const client: AxiosInstance = axios.create({
  baseURL:         BASE_URL,
  withCredentials: true,   // sends httpOnly refresh-token cookie cross-site
  timeout:         15_000, // 15s — Railway cold starts can take ~8s
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request interceptor — attach access token ─────────────────
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('mpn_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ── Refresh lock ──────────────────────────────────────────────
// Prevents multiple simultaneous 401 responses from each triggering
// their own refresh call. Only one refresh fires; others wait for it.
let isRefreshing = false
let refreshQueue: Array<{
  resolve: (token: string) => void
  reject:  (err: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
  refreshQueue.forEach(p => error ? p.reject(error) : p.resolve(token!))
  refreshQueue = []
}

// ── Response interceptor — handle 401 and 429 ────────────────
client.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?:        boolean
      _retryCount?:   number
    }

    // ── 429 Too Many Requests ─────────────────────────────────
    // Respect Retry-After header. Wait the specified time, then retry once.
    if (error.response?.status === 429 && !originalRequest._retry) {
      originalRequest._retry = true
      const retryAfter = parseInt(
        (error.response.headers['retry-after'] as string) ?? '60',
        10,
      )
      // Cap the wait at 30 seconds on the frontend — don't block the user
      // for longer than that; instead surface a friendly message.
      const waitMs = Math.min(retryAfter * 1000, 30_000)

      if (waitMs <= 5_000) {
        // Short wait (≤5s) — silently retry without disturbing the user
        await new Promise(r => setTimeout(r, waitMs))
        return client(originalRequest)
      }

      // Long wait — don't retry, let the error propagate so the UI
      // can show the retry_after_seconds in a friendly message
      return Promise.reject(error)
    }

    const isNetworkError = !error.response
    const is5xx = (error.response?.status ?? 0) >= 500

    if ((isNetworkError || is5xx) && !originalRequest._retry) {
      originalRequest._retryCount = (originalRequest._retryCount ?? 0) + 1

      if (originalRequest._retryCount <= 2) {
        originalRequest._retry = true
        // Exponential backoff: 800ms, then 1600ms
        const delay = 800 * Math.pow(2, originalRequest._retryCount - 1)
        await new Promise(r => setTimeout(r, delay))
        originalRequest._retry = false  // allow further retries
        return client(originalRequest)
      }
    }

    // ── 401 Unauthorized — attempt token refresh ──────────────
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        // Another refresh is in flight — queue this request
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`
              }
              resolve(client(originalRequest))
            },
            reject,
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },  
        )

        const newToken = data?.data?.accessToken
        if (!newToken) throw new Error('No access token in refresh response')

        localStorage.setItem('mpn_token', newToken)
        processQueue(null, newToken)

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
        }

        return client(originalRequest)

      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('mpn_token')
        window.dispatchEvent(new CustomEvent('auth:session-expired'))
        return Promise.reject(refreshError)

      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default client