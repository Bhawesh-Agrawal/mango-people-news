import { useState, useEffect, useCallback } from 'react'
import { getHomeData } from '../api/home'
import { apiCache, TTL } from '../lib/apiCache'
import type { HomeData } from '../types'

export function useHomeData() {
  const [data, setData] = useState<HomeData | null>(() => apiCache.get<HomeData>('home:data'))
  const [loading, setLoading] = useState(() => !apiCache.get<HomeData>('home:data'))
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => {
    apiCache.invalidate('home:data')
    setTick(t => t + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    const cached = apiCache.get<HomeData>('home:data')
    if (cached) {
      setData(cached)
      setLoading(false)
      return
    }

    setLoading(true)
    apiCache
      .getOrFetch<HomeData>('home:data', () => getHomeData().then(response => response.data), TTL.LIST)
      .then(homeData => {
        if (cancelled) return
        setData(homeData)
        setError(null)
      })
      .catch(() => {
        if (cancelled) return
        setError('Unable to load homepage data. Please try again.')
        setData(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [tick])

  return { data, loading, error, refetch }
}
