import { useState, useEffect } from 'react'
import type { Article, PaginatedResponse } from '../types'
import { getArticles } from '../api/articles'
import { SEED_ARTICLES } from '../lib/seed'

interface UseArticlesOptions {
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

export const useArticles = (options: UseArticlesOptions = {}): UseArticlesReturn => {
  const {
    page     = 1,
    limit    = 10,
    category,
    search,
    featured,
    enabled  = true,
  } = options

  const [articles,   setArticles]   = useState<Article[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginatedResponse<Article>['pagination'] | null>(null)
  const [tick,       setTick]       = useState(0)

  const refetch = () => setTick(t => t + 1)

  useEffect(() => {
    if (!enabled) return

    let cancelled = false
    setLoading(true)
    setError(null)

    getArticles({ page, limit, category, search, featured })
      .then(res => {
        if (cancelled) return
        if (res.data && res.data.length > 0) {
          setArticles(res.data)
          setPagination(res.pagination)
        } else {
          // API returned empty — use seed filtered by category
          const seed = category
            ? SEED_ARTICLES.filter(a => a.category_slug === category)
            : SEED_ARTICLES
          setArticles(seed.slice(0, limit))
          setPagination(null)
        }
      })
      .catch(() => {
        if (cancelled) return
        // API failed — use seed
        const seed = category
          ? SEED_ARTICLES.filter(a => a.category_slug === category)
          : SEED_ARTICLES
        setArticles(seed.slice(0, limit))
        setError(null) // silent fallback, no error shown to user
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [page, limit, category, search, featured, enabled, tick])

  return { articles, loading, error, pagination, refetch }
}