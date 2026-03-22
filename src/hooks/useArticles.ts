import { useState, useEffect } from 'react'
import type { Article, PaginatedResponse } from '../types'
import { getArticles } from '../api/articles'
import { SEED_ARTICLES } from '../lib/seed'

export interface ArticleParams {
  page?:     number
  limit?:    number
  category?: string
  search?:   string
  featured?: boolean
  enabled?:  boolean
  stagger?:  number
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
    stagger  = 0,
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

    // Stagger to prevent hammering the API simultaneously
    const delay = stagger * 150

    const timer = setTimeout(() => {
      getArticles({ page, limit, category, search, featured })
        .then(res => {
          if (cancelled) return
          if (res.data && res.data.length > 0) {
            setArticles(res.data)
            setPagination(res.pagination)
          } else {
            const seed = category
              ? SEED_ARTICLES.filter(a =>
                  a.category_slug === category ||
                  a.category_name?.toLowerCase() === category
                )
              : SEED_ARTICLES
            setArticles(seed.slice(0, limit))
            setPagination(null)
          }
        })
        .catch(() => {
          if (cancelled) return
          const seed = category
            ? SEED_ARTICLES.filter(a =>
                a.category_slug === category ||
                a.category_name?.toLowerCase() === category
              )
            : SEED_ARTICLES
          setArticles(seed.slice(0, limit))
          setError(null)
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, delay)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [page, limit, category, search, featured, enabled, tick, stagger])

  return { articles, loading, error, pagination, refetch }
}