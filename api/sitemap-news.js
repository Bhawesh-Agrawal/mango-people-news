const SITE_URL = 'https://www.mangopeoplenews.com'

const rawApiBaseUrl =
  process.env.API_BASE_URL || process.env.VITE_API_URL || 'https://api.mangopeoplenews.com'

function normalizeApiBaseUrl(baseUrl) {
  let url = String(baseUrl).trim().replace(/\/+$|\s+/g, '')
  if (url.endsWith('/api/v1')) return url
  if (url.endsWith('/api')) url = url.slice(0, -4)
  return `${url}/api/v1`
}

const API_BASE_URL = normalizeApiBaseUrl(rawApiBaseUrl)

const NEWS_WINDOW_DAYS = 7
const MAX_URLS = 1000
const BATCH_SIZE = 100

const escapeXml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const formatDate = (value) => {
  if (!value) return new Date().toISOString()
  const d = new Date(value)
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
}

async function fetchRecentArticles() {
  const all = []
  let page = 1
  const cutoff = new Date(Date.now() - NEWS_WINDOW_DAYS * 24 * 60 * 60 * 1000)

  while (all.length < MAX_URLS) {
    const url = `${API_BASE_URL}/articles?limit=${BATCH_SIZE}&page=${page}`
    console.log(`[sitemap-news] fetching page ${page}: ${url}`)

    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error(`API responded ${res.status} for ${url}`)

    const body = await res.json()
    const batch = (body.data || body).filter((a) => a?.slug && a?.published_at)

    for (const article of batch) {
      const pubDate = new Date(article.published_at)
      if (pubDate < cutoff) return all
      all.push(article)
      if (all.length >= MAX_URLS) return all
    }

    const hasNextPage = body.pagination?.hasNextPage ?? false
    if (!hasNextPage || batch.length < BATCH_SIZE) break
    page++
  }

  return all
}

function buildKeywords(article) {
  if (article.meta_keywords) return article.meta_keywords
  const parts = []
  if (article.author_name) parts.push(article.author_name)
  if (article.category_name) parts.push(article.category_name)
  if (article.tags?.length) {
    for (const tag of article.tags) {
      if (tag?.name) parts.push(tag.name)
    }
  }
  return parts.slice(0, 10).join(', ')
}

function buildNewsUrl(article) {
  const title = article.meta_title || article.title
  const keywords = buildKeywords(article)

  return `  <url>
    <loc>${escapeXml(`${SITE_URL}/article/${article.slug}`)}</loc>
    <lastmod>${formatDate(article.updated_at || article.published_at)}</lastmod>
    <news:news>
      <news:publication>
        <news:name>MangoPeople News</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${formatDate(article.published_at)}</news:publication_date>
      <news:title>${escapeXml(title)}</news:title>
      <news:keywords>${escapeXml(keywords)}</news:keywords>
    </news:news>
  </url>`
}

export default async function handler(req, res) {
  try {
    const articles = await fetchRecentArticles()

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${articles.map(buildNewsUrl).join('\n')}
</urlset>`

    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=1800, stale-while-revalidate=300')
    res.status(200).send(xml)
  } catch (err) {
    console.error('[sitemap-news] error:', err)
    res.status(500).send('Internal Server Error')
  }
}
