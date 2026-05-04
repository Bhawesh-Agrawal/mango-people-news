import {
  createContext, useContext, useState,
  useCallback, type ReactNode,
} from 'react'
import { client }   from '../api/client'
import { apiCache, TTL } from '../lib/apiCache'

// ── Types ─────────────────────────────────────────────────────

export interface DashboardStats {
  articles: {
    total: number
    published: number
    drafts: number
    total_views: number
    total_likes: number
    total_comments: number
  }
  users: {
    total: number
    new_this_month: number
  }
  pendingComments: number
  viewsTrend: any[]
  topArticles: any[]
  categoryStats: any[]
  recentActivity: any[]
}

export interface AdminArticle {
  id:           string
  slug:         string
  title:        string
  status:       'draft' | 'published' | 'archived'
  author_name:  string
  category_name: string
  category_color: string
  view_count:   number
  like_count:   number
  comment_count: number
  published_at: string | null
  created_at:   string
  is_breaking:  boolean
  is_featured:  boolean
}

export interface ArticleAnalytics {
  article_id:    string
  title:         string
  view_count:    number
  like_count:    number
  comment_count: number
  views_today:   number
  views_week:    number
  views_month:   number
  top_referrers: { source: string; views: number }[]
  views_by_day:  { date: string; views: number }[]
}

export interface AdminUser {
  id:            string
  email:         string
  full_name:     string
  role:          'reader' | 'author' | 'editor' | 'super_admin'
  status:        'active' | 'suspended' | 'pending_verification'
  auth_provider: string
  email_verified: boolean
  created_at:    string
  last_login_at: string | null
  login_count:   number
  avatar_url:    string | null
}

export interface Subscriber {
  id:         string
  email:      string
  name:       string | null
  status:     'active' | 'unsubscribed'
  created_at: string
}

export interface Campaign {
  id:         string
  subject:    string
  sent_count: number
  status:     'sent' | 'draft' | 'sending'
  sent_at:    string | null
  created_at: string
}

export interface SiteSettings {
  site_name:           string
  site_tagline:        string
  site_email:          string
  allow_registration:  boolean
  allow_comments:      boolean
  require_moderation:  boolean
  maintenance_mode:    boolean
}

// Paginated wrapper
export interface Paginated<T> {
  data:        T[]
  total:       number
  page:        number
  total_pages: number
}

// ── Context shape ─────────────────────────────────────────────

interface AdminContextValue {
  // Stats
  stats:        DashboardStats | null
  statsLoading: boolean
  statsError:   string | null
  fetchStats:   () => Promise<void>

  // Articles
  articles:        AdminArticle[]
  articlesTotal:   number
  articlesLoading: boolean
  articlesError:   string | null
  fetchArticles: (params?: {
    page?:     number
    limit?:    number
    search?:   string
    status?:   string
    category?: string
  }) => Promise<void>

  // Analytics
  analyticsCache: Record<string, ArticleAnalytics>
  fetchAnalytics: (articleId: string) => Promise<ArticleAnalytics | null>

  // Users (super_admin)
  users:        AdminUser[]
  usersTotal:   number
  usersLoading: boolean
  usersError:   string | null
  fetchUsers:   (params?: { page?: number; search?: string; role?: string; limit?: number}) => Promise<void>
  updateUserRole:   (userId: string, role: string)   => Promise<void>
  updateUserStatus: (userId: string, status: string) => Promise<void>

  // Newsletter (super_admin)
  subscribers:        Subscriber[]
  subscribersTotal:   number
  subscribersLoading: boolean
  campaigns:          Campaign[]
  campaignsLoading:   boolean
  fetchSubscribers:   (params?: { page?: number }) => Promise<void>
  fetchCampaigns:     () => Promise<void>
  sendCampaign:       (payload: { subject: string; body: string; preview_text?: string }) => Promise<void>

  // Settings (super_admin)
  settings:        SiteSettings | null
  settingsLoading: boolean
  settingsError:   string | null
  fetchSettings:   () => Promise<void>
  updateSettings:  (patch: Partial<SiteSettings>) => Promise<void>
}

// ── Context ───────────────────────────────────────────────────

const AdminContext = createContext<AdminContextValue | null>(null)

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used inside <AdminProvider>')
  return ctx
}

// ── Provider ──────────────────────────────────────────────────

export function AdminProvider({ children }: { children: ReactNode }) {

  // ── Stats ───────────────────────────────────────────────
  const [stats,        setStats]        = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError,   setStatsError]   = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    const key = 'admin:stats'
    const cached = apiCache.get<DashboardStats>(key)
    if (cached) { setStats(cached); return }

    setStatsLoading(true)
    setStatsError(null)
    try {
      const res = await client.get('/admin/stats')
      const data: DashboardStats = res.data?.data
      setStats(data)
      apiCache.set(key, data, TTL.LIST)
    } catch (err: any) {
      setStatsError(err?.response?.data?.message ?? 'Failed to load stats.')
    } finally {
      setStatsLoading(false)
    }
  }, [])

  // ── Articles ─────────────────────────────────────────────
  const [articles,        setArticles]        = useState<AdminArticle[]>([])
  const [articlesTotal,   setArticlesTotal]   = useState(0)
  const [articlesLoading, setArticlesLoading] = useState(false)
  const [articlesError,   setArticlesError]   = useState<string | null>(null)

  const fetchArticles = useCallback(async (params: {
    page?: number; limit?: number; search?: string; status?: string; category?: string
  } = {}) => {
    const key = `admin:articles:${JSON.stringify(params)}`
    const cached = apiCache.get<Paginated<AdminArticle>>(key)
    if (cached) {
      setArticles(cached.data)
      setArticlesTotal(cached.total)
      return
    }

    setArticlesLoading(true)
    setArticlesError(null)
    try {
      const res  = await client.get('/admin/articles', { params })
      const data: Paginated<AdminArticle> = {
        data:        res.data?.data ?? [],
        total:       res.data?.total ?? 0,
        page:        res.data?.page  ?? 1,
        total_pages: res.data?.total_pages ?? 1,
      }
      setArticles(data.data)
      setArticlesTotal(data.total)
      apiCache.set(key, data, TTL.LIST)
    } catch (err: any) {
      setArticlesError(err?.response?.data?.message ?? 'Failed to load articles.')
    } finally {
      setArticlesLoading(false)
    }
  }, [])

  // ── Analytics ────────────────────────────────────────────
  const [analyticsCache, setAnalyticsCache] = useState<Record<string, ArticleAnalytics>>({})

  const fetchAnalytics = useCallback(async (articleId: string): Promise<ArticleAnalytics | null> => {
    const key = `admin:analytics:${articleId}`
    const cached = apiCache.get<ArticleAnalytics>(key)
    if (cached) {
      setAnalyticsCache(prev => ({ ...prev, [articleId]: cached }))
      return cached
    }
    try {
      const res  = await client.get(`/admin/analytics/${articleId}`)
      const data: ArticleAnalytics = res.data?.data
      apiCache.set(key, data, TTL.DETAIL)
      setAnalyticsCache(prev => ({ ...prev, [articleId]: data }))
      return data
    } catch {
      return null
    }
  }, [])

  // ── Users ────────────────────────────────────────────────
  const [users,        setUsers]        = useState<AdminUser[]>([])
  const [usersTotal,   setUsersTotal]   = useState(0)
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError,   setUsersError]   = useState<string | null>(null)

  const fetchUsers = useCallback(async (params: {
    page?: number; search?: string; role?: string
  } = {}) => {
    const key = `admin:users:${JSON.stringify(params)}`
    const cached = apiCache.get<Paginated<AdminUser>>(key)
    if (cached) { setUsers(cached.data); setUsersTotal(cached.total); return }

    setUsersLoading(true)
    setUsersError(null)
    try {
      const res  = await client.get('/admin/users', { params })
      const data: Paginated<AdminUser> = {
        data:        res.data?.data  ?? [],
        total:       res.data?.total ?? 0,
        page:        res.data?.page  ?? 1,
        total_pages: res.data?.total_pages ?? 1,
      }
      setUsers(data.data)
      setUsersTotal(data.total)
      apiCache.set(key, data, TTL.LIST)
    } catch (err: any) {
      setUsersError(err?.response?.data?.message ?? 'Failed to load users.')
    } finally {
      setUsersLoading(false)
    }
  }, [])

  const updateUserRole = useCallback(async (userId: string, role: string) => {
    await client.patch(`/admin/users/${userId}/role`, { role })
    apiCache.invalidate('admin:users')
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: role as any } : u))
  }, [])

  const updateUserStatus = useCallback(async (userId: string, status: string) => {
    await client.patch(`/admin/users/${userId}/status`, { status })
    apiCache.invalidate('admin:users')
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: status as any } : u))
  }, [])

  // ── Newsletter ───────────────────────────────────────────
  const [subscribers,        setSubscribers]        = useState<Subscriber[]>([])
  const [subscribersTotal,   setSubscribersTotal]   = useState(0)
  const [subscribersLoading, setSubscribersLoading] = useState(false)
  const [campaigns,          setCampaigns]          = useState<Campaign[]>([])
  const [campaignsLoading,   setCampaignsLoading]   = useState(false)

  const fetchSubscribers = useCallback(async (params: { page?: number } = {}) => {
    setSubscribersLoading(true)
    try {
      const res = await client.get('/newsletter/subscribers', { params })
      setSubscribers(res.data?.data  ?? [])
      setSubscribersTotal(res.data?.total ?? 0)
    } catch {} finally { setSubscribersLoading(false) }
  }, [])

  const fetchCampaigns = useCallback(async () => {
    setCampaignsLoading(true)
    try {
      const res = await client.get('/newsletter/campaigns')
      setCampaigns(res.data?.data ?? [])
    } catch {} finally { setCampaignsLoading(false) }
  }, [])

  const sendCampaign = useCallback(async (payload: {
    subject: string; body: string; preview_text?: string
  }) => {
    await client.post('/newsletter/send', payload)
    await fetchCampaigns()
  }, [fetchCampaigns])

  // ── Settings ─────────────────────────────────────────────
  const [settings,        setSettings]        = useState<SiteSettings | null>(null)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsError,   setSettingsError]   = useState<string | null>(null)

  const fetchSettings = useCallback(async () => {
    const key    = 'admin:settings'
    const cached = apiCache.get<SiteSettings>(key)
    if (cached) { setSettings(cached); return }

    setSettingsLoading(true)
    setSettingsError(null)
    try {
      const res  = await client.get('/admin/settings')
      const data = res.data?.data as SiteSettings
      setSettings(data)
      apiCache.set(key, data, TTL.DETAIL)
    } catch (err: any) {
      setSettingsError(err?.response?.data?.message ?? 'Failed to load settings.')
    } finally {
      setSettingsLoading(false)
    }
  }, [])

  const updateSettings = useCallback(async (patch: Partial<SiteSettings>) => {
    setSettingsLoading(true)
    try {
      const res  = await client.patch('/admin/settings', patch)
      const data = res.data?.data as SiteSettings
      setSettings(data)
      apiCache.invalidate('admin:settings')
    } catch (err: any) {
      throw new Error(err?.response?.data?.message ?? 'Failed to save settings.')
    } finally {
      setSettingsLoading(false)
    }
  }, [])

  return (
    <AdminContext.Provider value={{
      stats, statsLoading, statsError, fetchStats,
      articles, articlesTotal, articlesLoading, articlesError, fetchArticles,
      analyticsCache, fetchAnalytics,
      users, usersTotal, usersLoading, usersError, fetchUsers,
      updateUserRole, updateUserStatus,
      subscribers, subscribersTotal, subscribersLoading,
      campaigns, campaignsLoading,
      fetchSubscribers, fetchCampaigns, sendCampaign,
      settings, settingsLoading, settingsError, fetchSettings, updateSettings,
    }}>
      {children}
    </AdminContext.Provider>
  )
}