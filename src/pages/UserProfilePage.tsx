import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Clock, Eye, Instagram, Twitter, Linkedin } from 'lucide-react'
import { client } from '../api/client'
import { cloudinaryUrl, timeAgo, formatCount } from '../lib/utils'
import SEO from '../seo/Seo'
import type { Article } from '../types'

interface UserProfile {
  id: string
  full_name: string
  display_name: string
  avatar_url: string
  bio: string
  email: string
  instagram_profile: string
  twitter_profile: string
  linkedin_profile: string
  created_at: string
  role: string
}

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')
        
        // Fetch user profile
        const profileRes = await client.get(`/home/profiles/${userId}`)
        setProfile(profileRes.data.data)

        // Fetch user's articles
        const articlesRes = await client.get(`/home/profiles/${userId}/articles`)
        setArticles(articlesRes.data.data ?? [])
      } catch (err: any) {
        setError(err?.response?.data?.message ?? 'Could not load profile')
        setProfile(null)
        setArticles([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  if (loading) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <div className="page-container py-8">
          <div className="space-y-4">
            <div className="skeleton h-32 w-32 rounded-2xl" />
            <div className="skeleton h-8 w-48 rounded" />
            <div className="skeleton h-20 w-full rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <div className="page-container py-12">
          <div className="text-center">
            <p className="text-5xl mb-4">👤</p>
            <h1 className="font-display text-display-sm mb-2" style={{ color: 'var(--text-primary)' }}>
              Profile not found
            </h1>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              {error || 'This user profile is not available'}
            </p>
            <Link to="/" className="btn-accent inline-block">Back to homepage</Link>
          </div>
        </div>
      </div>
    )
  }

  const joinedDate = new Date(profile.created_at).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <>
      <SEO
        title={`${profile.full_name} - Mango People News`}
        description={profile.bio || `Read articles by ${profile.full_name} on Mango People News`}
        path={`/user/${userId}`}
      />

      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <div className="page-container py-8">
          {/* Profile Header */}
          <div className="rounded-2xl p-6 sm:p-8 mb-8"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>

            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden
                             flex items-center justify-center text-3xl sm:text-4xl font-bold"
                  style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                >
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    profile.full_name?.charAt(0)?.toUpperCase() ?? '?'
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <h1 className="font-display font-black leading-tight tracking-tight mb-1"
                  style={{
                    fontSize: 'clamp(24px, 5vw, 32px)',
                    color: 'var(--text-primary)',
                  }}>
                  {profile.full_name}
                </h1>

                {profile.display_name && (
                  <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                    @{profile.display_name}
                  </p>
                )}

                {profile.bio && (
                  <p className="text-sm leading-relaxed mb-4 max-w-2xl"
                    style={{ color: 'var(--text-secondary)' }}>
                    {profile.bio}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 items-center">
                  <span className="text-xs px-2.5 py-1.5 rounded-lg font-semibold"
                    style={{ background: 'var(--accent-light)', color: 'var(--accent-text)' }}>
                    Joined {joinedDate}
                  </span>
                  {articles.length > 0 && (
                    <span className="text-xs px-2.5 py-1.5 rounded-lg"
                      style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                      {articles.length} article{articles.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Social Links */}
            {(profile.instagram_profile || profile.twitter_profile || profile.linkedin_profile) && (
              <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: 'var(--text-muted)' }}>
                  Follow
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.instagram_profile && (
                    <a
                      href={profile.instagram_profile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                 transition-all hover:opacity-80"
                      style={{ background: 'rgba(224,57,151,0.08)', color: '#E03993' }}
                      title="Instagram"
                    >
                      <Instagram size={12} /> Instagram
                    </a>
                  )}
                  {profile.twitter_profile && (
                    <a
                      href={profile.twitter_profile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                 transition-all hover:opacity-80"
                      style={{ background: 'rgba(0,0,0,0.08)', color: 'var(--text-primary)' }}
                      title="Twitter"
                    >
                      <Twitter size={12} /> Twitter
                    </a>
                  )}
                  {profile.linkedin_profile && (
                    <a
                      href={profile.linkedin_profile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                 transition-all hover:opacity-80"
                      style={{ background: 'rgba(0,119,181,0.08)', color: '#0077B5' }}
                      title="LinkedIn"
                    >
                      <Linkedin size={12} /> LinkedIn
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Articles Section */}
          {articles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">📰</p>
              <h2 className="font-display text-display-sm mb-2"
                style={{ color: 'var(--text-primary)' }}>
                No articles yet
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                This author hasn't published any articles yet.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-label mb-0">Articles by {profile.full_name}</h2>
              </div>

              <div className="space-y-0 divide-y divide-[var(--border-muted)]">
                {articles.map((article) => (
                  <Link
                    key={article.id}
                    to={`/article/${article.slug}`}
                    className="flex flex-col sm:flex-row gap-4 py-5 group
                               transition-colors duration-150 hover:bg-[var(--bg-surface)]"
                  >
                    <div className="flex-1 min-w-0">
                      {article.is_breaking && (
                        <span className="breaking-strip mb-2 inline-block">● Breaking</span>
                      )}
                      <h3
                        className="font-display font-semibold leading-tight tracking-tight text-lg
                                   transition-colors duration-150
                                   group-hover:text-[var(--accent)]"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {article.title}
                      </h3>
                      {article.subtitle && (
                        <p
                          className="text-sm leading-relaxed mt-2 line-clamp-2"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {article.subtitle}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-3 text-xs"
                        style={{ color: 'var(--text-muted)' }}>
                        <span>{article.category_name}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {timeAgo(article.published_at)}
                        </span>
                        <span>·</span>
                        <span>{article.reading_time} min read</span>
                        {article.view_count > 500 && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Eye size={10} />
                              {formatCount(article.view_count)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {article.cover_image && (
                      <div className="hidden sm:block flex-shrink-0 rounded-lg overflow-hidden"
                        style={{ width: '140px', height: '100px' }}>
                        <img
                          src={cloudinaryUrl(article.cover_image, 280, 200)}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                          width={280}
                          height={200}
                        />
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
