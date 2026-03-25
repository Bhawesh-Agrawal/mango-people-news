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

export const getArticle = async (
  slug: string
): Promise<ApiResponse<Article>> => {
  const { data } = await client.get(`/articles/${slug}`)
  return data
}

export const getTrending = async (
  limit = 6
): Promise<PaginatedResponse<Article>> => {
  const { data } = await client.get('/articles/trending', { params: { limit } })
  return data
}

// ── Engagement ────────────────────────────────────────────────
export const toggleLike = async (
  articleId: string
): Promise<ApiResponse<{ liked: boolean; like_count: number }>> => {
  const { data } = await client.post(`/articles/${articleId}/like`)
  return data
}

export const getLikeStatus = async (
  articleId: string
): Promise<ApiResponse<{ liked: boolean; like_count: number }>> => {
  const { data } = await client.get(`/articles/${articleId}/like`)
  return data
}

export const trackView = async (articleId: string): Promise<void> => {
  await client.post(`/articles/${articleId}/view`).catch(() => {})
  // Silent — never throw, never block the user
}

// ── Comments ──────────────────────────────────────────────────
export interface Comment {
  id:           string
  body:         string
  author_name:  string
  author_avatar?: string
  created_at:   string
  is_pinned:    boolean
  parent_id?:   string
}

export const getComments = async (
  articleId: string
): Promise<ApiResponse<Comment[]>> => {
  const { data } = await client.get(`/comments/article/${articleId}`)
  return data
}

export const postComment = async (
  articleId: string,
  body:      string
): Promise<ApiResponse<Comment>> => {
  const { data } = await client.post('/comments', {
    article_id: articleId,
    body,
  })
  return data
}

export const deleteComment = async (commentId: string): Promise<void> => {
  await client.delete(`/comments/${commentId}`)
}