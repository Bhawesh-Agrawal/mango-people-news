import { client } from './client'
import type { Article, PaginatedResponse, ApiResponse } from '../types'

// ── Browser fingerprint ───────────────────────────────────────────────────────
// A lightweight, stable, anonymous identifier for tracking likes from
// non-authenticated users. Stored in localStorage so it persists across
// sessions on the same browser. Does NOT identify the user personally.
//
// We generate it once and cache it. It is a simple hash of stable browser
// signals — no external library needed.

const FP_KEY = 'mpn_fp';

function hashString(str: string): string {
  // djb2 hash — fast, small, good distribution for this use case
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0; // keep it unsigned 32-bit
  }
  return hash.toString(36);
}

function generateFingerprint(): string {
  const signals = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency ?? '',
  ].join('|');

  // Prefix with a random component so two identical machines still differ
  const random = Math.random().toString(36).slice(2, 10);
  return `${hashString(signals)}-${random}`;
}

export function getFingerprint(): string {
  try {
    const stored = localStorage.getItem(FP_KEY);
    if (stored) return stored;
    const fp = generateFingerprint();
    localStorage.setItem(FP_KEY, fp);
    return fp;
  } catch {
    // localStorage blocked (private mode, etc.) — generate ephemeral one
    return generateFingerprint();
  }
}

// ── Articles ──────────────────────────────────────────────────────────────────

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

// ── Engagement ────────────────────────────────────────────────────────────────

export const toggleLike = async (
  articleId: string
): Promise<ApiResponse<{ liked: boolean; like_count: number }>> => {
  // Always send a fingerprint so the backend can track anonymous likes.
  // For logged-in users, the backend will use user_id (from the JWT) and
  // ignore the fingerprint. For anonymous users, the fingerprint is the
  // only identifier — without it, the backend cannot record the like.
  const fingerprint = getFingerprint()
  const { data } = await client.post(`/articles/${articleId}/like`, { fingerprint })
  return data
}

export const getLikeStatus = async (
  articleId: string
): Promise<ApiResponse<{ liked: boolean; like_count: number }>> => {
  // Pass fingerprint as a query param for anonymous status checks
  const fingerprint = getFingerprint()
  const { data } = await client.get(`/articles/${articleId}/like`, {
    params: { fingerprint },
  })
  return data
}

export const trackView = async (articleId: string): Promise<void> => {
  // Optionally send the page referrer so analytics can track traffic sources
  const referrer = document.referrer || null
  await client.post(`/articles/${articleId}/view`, { referrer }).catch(() => {})
  // Silent — never throw, never block the user
}

// ── Comments ──────────────────────────────────────────────────────────────────

export interface Comment {
  id:             string
  body:           string
  author_name:    string
  author_avatar?: string
  created_at:     string
  is_pinned:      boolean
  parent_id?:     string
  replies?:       Comment[]
}

export const getComments = async (
  articleId: string
): Promise<ApiResponse<Comment[]>> => {
  const { data } = await client.get(`/comments/article/${articleId}`)
  return data
}

export const postComment = async (
  articleId: string,
  body:      string,
  parentId?: string,         // optional — omit for top-level, pass for replies
): Promise<ApiResponse<Comment>> => {
  const { data } = await client.post('/comments', {
    article_id: articleId,
    body,
    ...(parentId ? { parent_id: parentId } : {}),
  })
  return data
}

export const deleteComment = async (commentId: string): Promise<void> => {
  await client.delete(`/comments/${commentId}`)
}
