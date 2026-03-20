import { useState, useEffect } from 'react'
import type { Article } from '../types'
import { getArticle } from '../api/articles'
import { SEED_ARTICLES } from '../lib/seed'

interface UseArticleReturn {
  article: Article | null
  loading: boolean
  error:   string | null
}

export const useArticle = (slug: string): UseArticleReturn => {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return

    let cancelled = false
    setLoading(true)
    setError(null)

    getArticle(slug)
      .then(res => {
        if (cancelled) return
        if (res.data) setArticle(res.data)
        else {
          const seed = SEED_ARTICLES.find(a => a.slug === slug) || null
          setArticle(seed)
        }
      })
      .catch(() => {
        if (cancelled) return
        const seed = SEED_ARTICLES.find(a => a.slug === slug) || null
        setArticle(seed)
        if (!seed) setError('Article not found')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [slug])

  return { article, loading, error }
}