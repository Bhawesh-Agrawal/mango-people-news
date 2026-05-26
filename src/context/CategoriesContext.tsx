import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { getCategories } from '../api/categories'
import { apiCache, TTL } from '../lib/apiCache'
import type { Category } from '../types'

const CACHE_KEY = 'categories:all'

const CategoriesContext = createContext<Category[]>([])

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(
    () => apiCache.get<Category[]>(CACHE_KEY) ?? []
  )

  useEffect(() => {
    if (apiCache.get<Category[]>(CACHE_KEY)) return

    getCategories()
      .then(res => {
        const data = res.data || []
        setCategories(data)
        apiCache.set(CACHE_KEY, data, TTL.CATEGORIES)
      })
      .catch(() => setCategories([]))
  }, [])

  return (
    <CategoriesContext.Provider value={categories}>
      {children}
    </CategoriesContext.Provider>
  )
}

export const useCategories = () => useContext(CategoriesContext)