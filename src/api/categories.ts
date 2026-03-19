import { client } from './client'
import type { Category, ApiResponse } from '../types'

export const getCategories = async (): Promise<ApiResponse<Category[]>> => {
  const { data } = await client.get('/categories')
  return data
}