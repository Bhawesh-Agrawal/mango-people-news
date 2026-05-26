import { useState, useEffect } from 'react'
import { getHomeData } from '../api/home'
import { apiCache, TTL } from '../lib/apiCache'
import type { HomeData } from '../types'

export function useHomeData() {
  const [data, setData] = useState<HomeData | null>(
    () => apiCache.get<HomeData>('home:data')
  )
  const [loading, setLoading] = useState(
    () => !apiCache.get<HomeData>('home:data')
  )
  const [error, setError] = useState<string | null>(null)
  const [tick,  setTick]  = useState(0)

  const refetch = () => {
    apiCache.invalidate('home:data')
    setLoading(true)
    setTick(t => t + 1)
  }

  // Critical path: home data (categories come from CategoriesContext — no duplication)
  useEffect(() => {
    let cancelled = false

    // Cache already populated by useState initializer — no fetch needed
    if (apiCache.get<HomeData>('home:data')) return
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

  return { data, loading, error, refetch }
}