import { useState, useEffect, useRef, useCallback } from 'react'
import { getHomeData } from '../api/home'
import { client } from '../api/client'
import { apiCache, TTL } from '../lib/apiCache'
import type { HomeData, Quote } from '../types'

const MARKET_REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes

export function useHomeData() {
  const [data, setData] = useState<HomeData | null>(
    () => apiCache.get<HomeData>('home:data')
  )
  const [loading, setLoading] = useState(
    () => !apiCache.get<HomeData>('home:data')
  )
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  // Market quotes — integrated from useMarketData
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [marketLoading, setMarketLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refetch = useCallback(() => {
    apiCache.invalidate('home:data')
    setTick(t => t + 1)
  }, [])

  const fetchMarketQuotes = async () => {
    try {
      const { data } = await client.get('/market/quotes')
      if (data.data?.length > 0) {
        setQuotes(data.data)
        setLastUpdated(new Date())
      }
    } catch {
      // Silent — keep stale data
    } finally {
      setMarketLoading(false)
    }
  }

  // Critical path: home data
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
        () => getHomeData().then(response => response.data),
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

  // Non-critical path: market quotes, starts after home data is ready, refreshes every 5 min
  useEffect(() => {
    if (!data) return

    fetchMarketQuotes()
    intervalRef.current = setInterval(fetchMarketQuotes, MARKET_REFRESH_INTERVAL)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [!!data])

  return { data, loading, error, refetch, quotes, marketLoading, lastUpdated }
}