export interface Article {
  id:             string
  title:          string
  slug:           string
  subtitle?:      string
  excerpt:        string
  cover_image?:   string
  cover_crop?: CoverCrop | null
  reading_time:   number
  view_count:     number
  like_count:     number
  comment_count:  number
  author_name:    string
  author_avatar?: string
  category_name:  string
  category_color: string
  category_slug:  string
  published_at:   string
  updated_at?:    string
  meta_title?:    string
  meta_description?: string
  is_breaking:    boolean
  is_featured:    boolean
  body?:          string
  ai_summary?:    string
  tags?:          Tag[]

}

export interface Tag {
  id:   string
  name: string
  slug: string
}

export interface CoverCrop {
  x:    number 
  y:    number   
  zoom: number   
}

export interface Category {
  id:            string
  name:          string
  slug:          string
  description?:  string
  color:         string
  article_count: number
  sort_order?:   number
  is_active?:    boolean
}

export interface Quote {
  symbol:    string
  name:      string
  price:     number
  change:    number
  changePct: number
  isUp:      boolean
  currency:  string
}

export interface HomeData {
  categories:       Category[]
  breaking:         Article[]
  hero:             Article[]
  aiSummaries:      Article[]
  categoryArticles: Record<string, Article[]>
  marketQuotes:     Quote[]
}

export interface PaginatedResponse<T> {
  success: boolean
  data:    T[]
  pagination: {
    page:         number
    limit:        number
    total:        number
    totalPages:   number
    hasNextPage:  boolean
  }
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data:    T
}

export interface User {
  id:         string
  email:      string
  full_name:  string
  role:       'reader' | 'author' | 'editor' | 'super_admin'
  avatar_url?: string
  status:     string
  email_verified?: boolean
  created_at:  string
  auth_provider: string
  bio?:        string
}

export interface ReviewArticle {
  id:             string
  slug:           string
  title:          string
  subtitle:       string | null
  excerpt:        string | null
  body:           string
  cover_image:    string | null
  reading_time:   number
  author_name:    string
  author_avatar:  string | null
  author_bio:     string | null
  category_name:  string
  category_color: string
  tags:           { id: string; name: string; slug: string }[]
  is_breaking:    boolean
  is_featured:    boolean
  created_at:     string
}