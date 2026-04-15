import { useState, useEffect, useCallback, useRef } from 'react'
import type { Article, PaginatedResponse } from '../types'
import { getArticles }   from '../api/articles'
import { SEED_ARTICLES } from '../lib/seed'
import { apiCache, TTL } from '../lib/apiCache'

export interface ArticleParams {
  page?:     number
  limit?:    number
  category?: string
  search?:   string
  featured?: boolean
  enabled?:  boolean
}

interface UseArticlesReturn {
  articles:   Article[]
  loading:    boolean
  error:      string | null
  pagination: PaginatedResponse<Article>['pagination'] | null
  refetch:    () => void
}

export const useArticles = (options: ArticleParams = {}): UseArticlesReturn => {
  const {
    page     = 1,
    limit    = 10,
    category,
    search,
    featured,
    enabled  = true,
  } = options

  // Stable cache key — encodes all params so different filter combos don't collide
  const cacheKey = `articles:${page}:${limit}:${category ?? ''}:${search ?? ''}:${featured ?? ''}`

  const [articles,   setArticles]   = useState<Article[]>(
    () => apiCache.get<Article[]>(cacheKey) ?? []
  )
  const [loading,    setLoading]    = useState(
    () => !apiCache.get<Article[]>(cacheKey)
  )
  const [error,      setError]      = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginatedResponse<Article>['pagination'] | null>(null)
  const [tick,       setTick]       = useState(0)

  // Track the key we last fetched so refetch() works correctly
  const lastKey = useRef<string | null>(null)

  const refetch = useCallback(() => {
    apiCache.invalidate(cacheKey)
    setTick(t => t + 1)
  }, [cacheKey])

  useEffect(() => {
    if (!enabled) return

    // Return stale data immediately while revalidating in background
    const stale = apiCache.getStaleOrFetch<Article[]>(
      cacheKey,
      () => getArticles({ page, limit, category, search, featured }).then(r => r.data ?? []),
      TTL.LIST,
      fresh => setArticles(fresh),  // background refresh callback
    )

    if (stale) {
      setArticles(stale)
      setLoading(false)
      return
    }

    // Full miss — need to block-load
    if (lastKey.current === cacheKey) return  // already in flight
    lastKey.current = cacheKey

    setLoading(true)
    setError(null)

    apiCache.getOrFetch<Article[]>(
      cacheKey,
      () => getArticles({ page, limit, category, search, featured }).then(r => {
        if (!r.data?.length) throw new Error('empty')
        setPagination(r.pagination)
        return r.data
      }),
      TTL.LIST,
    )
      .then(data => setArticles(data))
      .catch(() => {
        const seed = category
          ? SEED_ARTICLES.filter(a =>
              a.category_slug === category || a.category_name?.toLowerCase() === category
            )
          : SEED_ARTICLES
        setArticles(seed.slice(0, limit))
      })
      .finally(() => setLoading(false))

  }, [page, limit, category, search, featured, enabled, tick, cacheKey])

  return { articles, loading, error, pagination, refetch }
}