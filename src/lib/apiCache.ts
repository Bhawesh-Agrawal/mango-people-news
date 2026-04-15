export const TTL = {
    LIST : 60_000,
    DETAIL : 300_000,
    TRENDING : 120_000,
    CATEGORIES : 600_000,
} as const


interface CacheEntry<T> {
    data : T
    expiresAt : number
    stale?: boolean
}

const cache = new Map<string, CacheEntry<unknown>>()
const inflight = new Map<string, Promise<unknown>>()

function get<T>(key: string) : T | null {
    const entry = cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
        cache.delete(key)
        return null
    }

    return entry.data as T

}

function set<T>(key: string, data: T, ttl: number) :void {
    cache.set(key, { data, expiresAt: Date.now() + ttl })
}

function invalidate(keyPrefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(keyPrefix)) cache.delete(key)
  }
}

async function getOrFetch<T>(
  key:     string,
  fetcher: () => Promise<T>,
  ttl:     number,
): Promise<T> {
  const cached = get<T>(key)
  if (cached !== null) return cached

  // Already in flight — reuse the same promise
  if (inflight.has(key)) return inflight.get(key) as Promise<T>

  const promise = fetcher().then(data => {
    set(key, data, ttl)
    inflight.delete(key)
    return data
  }).catch(err => {
    inflight.delete(key)
    throw err
  })

  inflight.set(key, promise)
  return promise
}

function getStaleOrFetch<T>(
  key:     string,
  fetcher: () => Promise<T>,
  ttl:     number,
  onFresh?: (data: T) => void,
): T | null {
  const entry = cache.get(key)

  // Fresh hit
  if (entry && Date.now() <= entry.expiresAt) return entry.data as T

  // Stale hit — return stale data immediately, refresh in background
  if (entry && !entry.stale) {
    entry.stale = true
    fetcher().then(data => {
      set(key, data, ttl)
      onFresh?.(data)
    }).catch(() => {
      // On failure, keep stale entry alive — better than nothing
      if (entry) entry.stale = false
    })
    return entry.data as T
  }

  // Full miss
  return null
}


export const apiCache = { get, set, getOrFetch, getStaleOrFetch, invalidate }