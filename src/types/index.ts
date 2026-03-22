export interface Article {
  id:             string
  title:          string
  slug:           string
  subtitle?:      string
  excerpt:        string
  cover_image?:   string
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
  is_breaking:    boolean
  is_featured:    boolean
  body?:          string
  tags?:          Tag[]
}

export interface Tag {
  id:   string
  name: string
  slug: string
}

export interface Category {
  id:            string
  name:          string
  slug:          string
  color:         string
  article_count: number
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
}

export interface ArticleParams {
  page?:     number
  limit?:    number
  category?: string
  featured?: boolean
  breaking?: boolean
  search?:   string
  stagger?:  number   // ← add this
}