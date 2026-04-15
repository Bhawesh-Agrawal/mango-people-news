import { useState, useEffect, useRef } from 'react'
import type { Article }   from '../types'
import { getArticle }     from '../api/articles'
import { SEED_ARTICLES }  from '../lib/seed'
import { apiCache , TTL }  from '../lib/apiCache'


interface UseArticleReturn {
  article: Article | null
  loading: boolean
  error:   string | null
}

export const useArticle = (slug: string): UseArticleReturn => {
  // Initialise state from cache synchronously — eliminates the loading flash
  // for articles already fetched in this session (e.g. back-navigation).
  const cacheKey = `article:${slug}`

  const [article, setArticle] = useState<Article | null>(
    () => apiCache.get<Article>(cacheKey)
  )
  const [loading, setLoading] = useState(() => !apiCache.get<Article>(cacheKey))
  const [error,   setError]   = useState<string | null>(null)

  // Prevent double-fetch in React 18 strict-mode double-invoke
  const fetchedSlug = useRef<string | null>(null)

  useEffect(() => {
    if (!slug) return

    // Cache hit from a previous mount — no fetch needed
    const cached = apiCache.get<Article>(cacheKey)
    if (cached) {
      setArticle(cached)
      setLoading(false)
      return
    }

    // Prevent duplicate fetch if the effect fires twice for the same slug
    if (fetchedSlug.current === slug) return
    fetchedSlug.current = slug

    setLoading(true)
    setError(null)

    // apiCache.getOrFetch deduplicates concurrent calls with the same key
    apiCache.getOrFetch<Article>(
      cacheKey,
      () => getArticle(slug).then(res => {
        if (!res.data) throw new Error('not-found')
        return res.data
      }),
      TTL.DETAIL,
    )
      .then(data => {
        setArticle(data)
      })
      .catch(() => {
        const seed = SEED_ARTICLES.find(a => a.slug === slug) ?? null
        setArticle(seed)
        if (!seed) setError('Article not found')
      })
      .finally(() => setLoading(false))

  }, [slug, cacheKey])

  return { article, loading, error }
}