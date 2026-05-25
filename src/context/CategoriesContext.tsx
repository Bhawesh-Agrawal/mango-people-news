import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { getCategories } from '../api/categories'
import type { Category } from '../types'

const CategoriesContext = createContext<Category[]>([])

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    getCategories()
      .then(res => setCategories(res.data || []))
      .catch(() => setCategories([]))
  }, [])

  return (
    <CategoriesContext.Provider value={categories}>
      {children}
    </CategoriesContext.Provider>
  )
}

export const useCategories = () => useContext(CategoriesContext)