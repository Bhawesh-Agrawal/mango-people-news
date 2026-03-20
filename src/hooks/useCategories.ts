import { useState, useEffect } from 'react'
import type { Category } from '../types'
import { getCategories } from '../api/categories'
import { SEED_CATEGORIES } from '../lib/seed'

interface UseCategoriesReturn {
  categories: Category[]
  loading:    boolean
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    getCategories()
      .then(res => {
        if (res.data?.length > 0) setCategories(res.data)
        else setCategories(SEED_CATEGORIES)
      })
      .catch(() => setCategories(SEED_CATEGORIES))
      .finally(() => setLoading(false))
  }, [])

  return { categories, loading }
}