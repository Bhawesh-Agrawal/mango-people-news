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

// ── XML helpers ───────────────────────────────────────────────────────────────

const escapeXml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const formatDate = (value) => {
  if (!value) return new Date().toISOString().split('T')[0]
  const d = new Date(value)
  return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0]
}

const buildUrl = ({ loc, lastmod, changefreq, priority }) => `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`

// ── Paginated article fetcher ─────────────────────────────────────────────────
// Your getArticles controller:
//   - filters by c.slug when ?category=<slug> is passed
//   - always forces status='published' for unauthenticated callers
//   - does NOT support ?sort= (ordering is always published_at DESC)
//   - paginates via ?page= and ?limit=, returns pagination.hasNextPage
//
// We loop pages until hasNextPage is false or we get an undersized batch.

const BATCH_SIZE = 100 // stay under any default server cap

async function fetchAllArticlesForCategory(slug) {
  const all = []
  let page = 1

  while (true) {
    const url = `${API_BASE_URL}/articles?category=${encodeURIComponent(slug)}&limit=${BATCH_SIZE}&page=${page}`
    console.log(`[sitemap-category:${slug}] fetching page ${page}: ${url}`)

    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error(`API responded ${res.status} for ${url}`)

    const body = await res.json()
    const batch = (body.data || body).filter((a) => a?.slug)
    all.push(...batch)

    // Stop when the API signals no more pages, or batch was smaller than requested
    const hasNextPage = body.pagination?.hasNextPage ?? false
    if (!hasNextPage || batch.length < BATCH_SIZE) break

    page++
  }

  console.log(`[sitemap-category:${slug}] total articles fetched: ${all.length}`)
  return all
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // Resolve category slug — from query param (set by Vercel rewrite) or URL path
  let slug = req.query?.slug

  if (!slug) {
    const match = (req.url || '').match(/sitemap-([^.]+)\.xml/)
    slug = match?.[1]
  }

  if (!slug) {
    res.status(400).send('Missing category slug')
    return
  }

  try {
    // Run article fetch and category lookup in parallel
    const [articles, catBody] = await Promise.all([
      fetchAllArticlesForCategory(slug),
      fetch(`${API_BASE_URL}/categories`, { cache: 'no-store' }).then((r) => r.json()),
    ])

    const categories = catBody.data || catBody
    const category   = categories.find((c) => c.slug === slug)

    const entries = []

    // Category listing page sits at the top of this sitemap (highest priority)
    if (category) {
      entries.push({
        loc:        `${SITE_URL}/category/${slug}`,
        lastmod:    new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority:   0.8,
      })
    }

    // Individual article pages
    for (const article of articles) {
      entries.push({
        loc:        `${SITE_URL}/article/${article.slug}`,
        lastmod:    formatDate(article.updated_at || article.published_at),
        changefreq: 'weekly',
        priority:   0.7,
      })
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- category: ${escapeXml(slug)} | ${entries.length} URLs -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(buildUrl).join('\n')}
</urlset>`

    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    // Cache at the CDN layer for 1 hour; allow stale for 10 min while revalidating
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=600')
    res.status(200).send(xml)

  } catch (err) {
    console.error(`[sitemap-category:${slug}] error:`, err)
    res.status(500).send('Internal Server Error')
  }
}