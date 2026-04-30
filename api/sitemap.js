const SITE_URL = process.env.SITE_URL || 'https://mangopeoplenews.com'
const API_BASE_URL = process.env.API_BASE_URL || process.env.VITE_API_URL || 'http://localhost:3000/api'

const staticPages = [
  { loc: `${SITE_URL}/`, changefreq: 'daily', priority: 1.0 },
  { loc: `${SITE_URL}/articles`, changefreq: 'daily', priority: 0.9 },
  { loc: `${SITE_URL}/trending`, changefreq: 'daily', priority: 0.9 },
  { loc: `${SITE_URL}/newsletter`, changefreq: 'weekly', priority: 0.8 },
  { loc: `${SITE_URL}/privacy-policy`, changefreq: 'monthly', priority: 0.5 },
  { loc: `${SITE_URL}/terms-and-conditions`, changefreq: 'monthly', priority: 0.5 },
  { loc: `${SITE_URL}/disclaimer`, changefreq: 'monthly', priority: 0.5 },
]

const fetchJson = async (url) => {
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }
  return response.json()
}

const escapeXml = (unsafe) =>
  unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const buildUrl = (loc, lastmod, changefreq, priority) => `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`

const formatDate = (value) => {
  if (!value) return new Date().toISOString().split('T')[0]
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : date.toISOString().split('T')[0]
}

const fetchArticles = async () => {
  const url = `${API_BASE_URL}/articles?limit=1000&sort=-published_at`
  const body = await fetchJson(url)
  const articles = body.data || body
  if (!Array.isArray(articles)) return []
  return articles
    .filter((article) => article?.slug)
    .map((article) => ({
      loc: `${SITE_URL}/article/${article.slug}`,
      lastmod: formatDate(article.updated_at || article.published_at),
      changefreq: 'weekly',
      priority: 0.8,
    }))
}

const fetchCategories = async () => {
  const url = `${API_BASE_URL}/categories`
  const body = await fetchJson(url)
  const categories = body.data || body
  if (!Array.isArray(categories)) return []
  return categories
    .filter((category) => category?.slug)
    .map((category) => ({
      loc: `${SITE_URL}/category/${category.slug}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'daily',
      priority: 0.7,
    }))
}

const generateSitemapXml = (entries) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((entry) => buildUrl(entry.loc, entry.lastmod, entry.changefreq, entry.priority)).join('\n')}
</urlset>`

export default async function handler(req, res) {
  try {
    const [articles, categories] = await Promise.all([fetchArticles(), fetchCategories()])
    const allEntries = [...staticPages, ...categories, ...articles]
    const sitemapXml = generateSitemapXml(allEntries)

    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=600')
    res.status(200).send(sitemapXml)
  } catch (error) {
    console.error('Sitemap generation error:', error)
    res.status(500).send('Internal Server Error')
  }
}
