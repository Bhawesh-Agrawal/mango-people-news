const SITE_URL = 'https://www.mangopeoplenews.com'

const escapeXml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const today = new Date().toISOString().split('T')[0]

const staticPages = [
  { loc: `${SITE_URL}/`,                    lastmod: today, changefreq: 'daily',   priority: 1.0 },
  { loc: `${SITE_URL}/articles`,            lastmod: today, changefreq: 'daily',   priority: 0.9 },
  { loc: `${SITE_URL}/trending`,            lastmod: today, changefreq: 'daily',   priority: 0.9 },
  { loc: `${SITE_URL}/newsletter`,          lastmod: today, changefreq: 'weekly',  priority: 0.8 },
  { loc: `${SITE_URL}/privacy-policy`,      lastmod: today, changefreq: 'monthly', priority: 0.5 },
  { loc: `${SITE_URL}/terms-and-conditions`,lastmod: today, changefreq: 'monthly', priority: 0.5 },
  { loc: `${SITE_URL}/disclaimer`,          lastmod: today, changefreq: 'monthly', priority: 0.5 },
  { loc: `${SITE_URL}/about`,               lastmod: today, changefreq: 'monthly', priority: 0.5 },
  { loc: `${SITE_URL}/contact`,             lastmod: today, changefreq: 'monthly', priority: 0.5 },
  { loc: `${SITE_URL}/team`,                lastmod: today, changefreq: 'monthly', priority: 0.5 },
]

const buildUrl = ({ loc, lastmod, changefreq, priority }) => `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`

export default function handler(req, res) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(buildUrl).join('\n')}
</urlset>`

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=86400, stale-while-revalidate=3600')
  res.status(200).send(xml)
}