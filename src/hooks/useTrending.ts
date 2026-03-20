import { useState, useEffect } from 'react'
import type { Article } from '../types'
import { getTrending } from '../api/articles'
import { SEED_ARTICLES } from '../lib/seed'

export const useTrending = (limit = 6) => {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    getTrending(limit)
      .then(res => {
        if (res.data?.length > 0) setArticles(res.data)
        else {
          setArticles(
            [...SEED_ARTICLES]
              .sort((a, b) => b.view_count - a.view_count)
              .slice(0, limit)
          )
        }
      })
      .catch(() => {
        setArticles(
          [...SEED_ARTICLES]
            .sort((a, b) => b.view_count - a.view_count)
            .slice(0, limit)
        )
      })
      .finally(() => setLoading(false))
  }, [limit])

  return { articles, loading }
}