import { client } from './client'
import type { Article, PaginatedResponse, ApiResponse } from '../types'

export const getArticles = async (params?: {
  page?:     number
  limit?:    number
  category?: string
  search?:   string
  featured?: boolean
}): Promise<PaginatedResponse<Article>> => {
  const { data } = await client.get('/articles', { params })
  return data
}

export const getArticle = async (slug: string): Promise<ApiResponse<Article>> => {
  const { data } = await client.get(`/articles/${slug}`)
  return data
}

export const getFeatured = async (): Promise<PaginatedResponse<Article>> => {
  const { data } = await client.get('/articles', {
    params: { featured: true, limit: 5 }
  })
  return data
}

export const getBreaking = async (): Promise<PaginatedResponse<Article>> => {
  const { data } = await client.get('/articles', {
    params: { limit: 10 }
  })
  return data
}