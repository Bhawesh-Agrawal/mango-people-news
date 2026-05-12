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

const escapeXml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

export default async function handler(req, res) {
  try {
    // Fetch categories so we can list one sitemap per category
    const body = await fetch(`${API_BASE_URL}/categories`, { cache: 'no-store' }).then((r) =>
      r.json()
    )
    const categories = (body.data || body).filter((c) => c?.slug)

    const now = new Date().toISOString()

    // Build <sitemap> entries
    const sitemapEntries = [
      // 1. Static pages sitemap
      `  <sitemap>\n    <loc>${escapeXml(`${SITE_URL}/sitemap-static.xml`)}</loc>\n    <lastmod>${now}</lastmod>\n  </sitemap>`,

      // 2. One sitemap per category
      ...categories.map(
        (cat) =>
          `  <sitemap>\n    <loc>${escapeXml(`${SITE_URL}/sitemap-${cat.slug}.xml`)}</loc>\n    <lastmod>${now}</lastmod>\n  </sitemap>`
      ),
    ]

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.join('\n')}
</sitemapindex>`

    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=600')
    res.status(200).send(xml)
  } catch (err) {
    console.error('[sitemap-index] error:', err)
    res.status(500).send('Internal Server Error')
  }
}