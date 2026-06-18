import { client } from './client'

export interface HeroPin {
  id:             string
  position:       number
  pinned_at:      string
  article_id:     string
  title:          string
  slug:           string
  cover_image:    string | null
  excerpt:        string
  published_at:   string
  category_name:  string
  category_slug:  string
  category_color: string
}

export interface CategoryPin {
  id:              string
  position:        number
  pinned_at:       string
  category_id:     string
  category_name:   string
  category_slug:   string
  category_color:  string
  article_id:      string
  title:           string
  slug:            string
  cover_image:     string | null
  excerpt:         string
  published_at:    string
}

export interface SearchArticle {
  id:              string
  title:           string
  slug:            string
  cover_image:     string | null
  excerpt:         string
  published_at:    string | null
  category_name:   string
  category_slug:   string
  category_color:  string
}

// ── Hero pins ───────────────────────────────────────────────────

export function getHeroPins() {
  return client.get<{ success: boolean; data: HeroPin[] }>('/admin/home/hero-pins')
}

export function addHeroPin(articleId: string, position?: number) {
  return client.post('/admin/home/hero-pins', { article_id: articleId, position })
}

export function reorderHeroPins(pins: { id: string; position: number }[]) {
  return client.put('/admin/home/hero-pins', { pins })
}

export function removeHeroPin(pinId: string) {
  return client.delete(`/admin/home/hero-pins/${pinId}`)
}

// ── Category pins ───────────────────────────────────────────────

export function getCategoryPins() {
  return client.get<{ success: boolean; data: CategoryPin[] }>('/admin/home/category-pins')
}

export function addCategoryPin(articleId: string, categoryId: string) {
  return client.post('/admin/home/category-pins', { article_id: articleId, category_id: categoryId })
}

export function removeCategoryPin(pinId: string) {
  return client.delete(`/admin/home/category-pins/${pinId}`)
}

// ── Article search ──────────────────────────────────────────────

export function searchArticles(q: string) {
  return client.get<{ success: boolean; data: SearchArticle[] }>('/admin/articles/search', { params: { q } })
}
