import { useState, useEffect } from 'react'
import type { Article }  from '../types'
import { getTrending }   from '../api/articles'
import { SEED_ARTICLES } from '../lib/seed'
import { apiCache, TTL } from '../lib/apiCache'

export const useTrending = (limit = 6) => {
  const cacheKey = `trending:${limit}`

  const [articles, setArticles] = useState<Article[]>(
    () => apiCache.get<Article[]>(cacheKey) ?? []
  )
  const [loading, setLoading] = useState(
    () => !apiCache.get<Article[]>(cacheKey)
  )

  useEffect(() => {
    const cached = apiCache.get<Article[]>(cacheKey)
    if (cached) { setArticles(cached); setLoading(false); return }

    // getOrFetch deduplicates — BreakingBar and HomePage both call
    // useTrending(6) but only ONE network request is made.
    apiCache.getOrFetch<Article[]>(
      cacheKey,
      () => getTrending(limit).then(res => {
        if (!res.data?.length) throw new Error('empty')
        return res.data
      }),
      TTL.TRENDING,
    )
      .then(data => setArticles(data))
      .catch(() => {
        setArticles(
          [...SEED_ARTICLES]
            .sort((a, b) => b.view_count - a.view_count)
            .slice(0, limit)
        )
      })
      .finally(() => setLoading(false))
  }, [limit, cacheKey])

  return { articles, loading }
}