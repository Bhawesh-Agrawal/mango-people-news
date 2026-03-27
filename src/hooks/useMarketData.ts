import { useState, useEffect, useRef } from 'react'
import { client } from '../api/client'

export interface Quote {
  symbol:    string
  name:      string
  price:     number
  change:    number
  changePct: number
  isUp:      boolean
  currency:  string
}

const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes

export function useMarketData() {
  const [quotes,  setQuotes]  = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetch = async () => {
    try {
      const { data } = await client.get('/market/quotes')
      if (data.data?.length > 0) {
        setQuotes(data.data)
        setLastUpdated(new Date())
      }
    } catch {
      // Silent — keep stale data
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch()
    intervalRef.current = setInterval(fetch, REFRESH_INTERVAL)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return { quotes, loading, lastUpdated }
}