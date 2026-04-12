import { useState, useEffect } from 'react'
import { getCategories }       from '../api/categories'
import type { Category }       from '../types'

let categoriesCache: Category[] | null = null
let cacheTimestamp   = 0
const CACHE_TTL_MS   = 5 * 60 * 1000  // 5 minutes

interface UseCategoriesResult {
  categories: Category[]
  loading:    boolean
  error:      string | null
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>(categoriesCache ?? [])
  const [loading,    setLoading]    = useState(!categoriesCache)
  const [error,      setError]      = useState<string | null>(null)

  useEffect(() => {
    // Return immediately if cache is fresh
    const now = Date.now()
    if (categoriesCache && now - cacheTimestamp < CACHE_TTL_MS) {
      setCategories(categoriesCache)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    getCategories()
      .then(res => {
        if (cancelled) return
        const data = res.data ?? []
        if (data.length > 0) {
          categoriesCache  = data
          cacheTimestamp   = Date.now()
          setCategories(data)
        }
        // If data is empty, keep whatever was cached — don't blank the nav
      })
      .catch(err => {
        if (cancelled) return
        console.warn('[useCategories] Failed to load:', err?.message)
        // Only set error if we have no cached data at all
        if (!categoriesCache) {
          setError('Could not load categories.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  return { categories, loading, error }
}

export function invalidateCategoriesCache() {
  categoriesCache = null
  cacheTimestamp  = 0
}