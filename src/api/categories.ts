import { client } from './client'
import type { Category, ApiResponse } from '../types'

export const getCategories = async (): Promise<ApiResponse<Category[]>> => {
  const { data } = await client.get('/categories')
  return data
}

export const createCategory = async (category: { name: string; color?: string; sort_order?: number }): Promise<ApiResponse<Category>> => {
  const { data } = await client.post('/categories', category)
  return data
}

export const updateCategory = async (id: string, updates: { name?: string; color?: string; sort_order?: number; is_active?: boolean }): Promise<ApiResponse<Category>> => {
  const { data } = await client.put(`/categories/${id}`, updates)
  return data
}

export const deleteCategory = async (id: string): Promise<ApiResponse<{ message: string }>> => {
  const { data } = await client.delete(`/categories/${id}`)
  return data
}