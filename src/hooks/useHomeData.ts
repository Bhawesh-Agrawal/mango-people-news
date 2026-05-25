import { useState, useEffect, useRef, useCallback } from 'react'
import { getHomeData } from '../api/home'
import { client } from '../api/client'
import { apiCache, TTL } from '../lib/apiCache'
import type { HomeData, Quote } from '../types'

const MARKET_REFRESH_INTERVAL = 5 * 60 * 1000

export function useHomeData() {
  const [data, setData] = useState<HomeData | null>(
    () => apiCache.get<HomeData>('home:data')
  )
  const [loading, setLoading] = useState(
    () => !apiCache.get<HomeData>('home:data')
  )
  const [error, setError] = useState<string | null>(null)
  const [tick,  setTick]  = useState(0)

  const [quotes,       setQuotes]       = useState<Quote[]>([])
  const [marketLoading, setMarketLoading] = useState(true)
  const [lastUpdated,  setLastUpdated]  = useState<Date | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refetch = useCallback(() => {
    apiCache.invalidate('home:data')
    setTick(t => t + 1)
  }, [])

  const fetchMarketQuotes = useCallback(async () => {
    try {
      const { data: res } = await client.get('/market/quotes')
      if (res.data?.length > 0) {
        setQuotes(res.data)
        setLastUpdated(new Date())
      }
    } catch {
      // Silent — keep stale data
    } finally {
      setMarketLoading(false)
    }
  }, [])

  // Critical path: home data (categories come from CategoriesContext — no duplication)
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
      .getOrFetch<HomeData>(
        'home:data',
        () => getHomeData().then(r => r.data),
        TTL.LIST
      )
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

    return () => { cancelled = true }
  }, [tick])

  // Non-critical path: market quotes fire only after home data is ready
  useEffect(() => {
    if (!data) return

    fetchMarketQuotes()
    intervalRef.current = setInterval(fetchMarketQuotes, MARKET_REFRESH_INTERVAL)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [!!data, fetchMarketQuotes])

  return { data, loading, error, refetch, quotes, marketLoading, lastUpdated }
}