/**
 * Sitemap Generator for Mango People News
 * Generates a dynamic XML sitemap that includes:
 * - Static pages (home, newsletter, etc.)
 * - Dynamic blog articles
 * - Category pages
 *
 * Run with: node generate-sitemap.ts
 */

import axios from 'axios'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000'
const SITE_URL = 'https://mangopeoplenews.com'
const PUBLIC_DIR = path.join(__dirname, 'public')

// Ensure public directory exists
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true })
}

interface SitemapEntry {
  loc: string
  lastmod: string
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
}

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return new Date().toISOString().split('T')[0]
  const date = new Date(value)
  return isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : date.toISOString().split('T')[0]
}

const staticPages: SitemapEntry[] = [
  {
    loc: `${SITE_URL}/`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: 1.0,
  },
  {
    loc: `${SITE_URL}/articles`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: 0.9,
  },
  {
    loc: `${SITE_URL}/trending`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: 0.9,
  },
  {
    loc: `${SITE_URL}/newsletter`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: 0.8,
  },
  {
    loc: `${SITE_URL}/privacy-policy`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: 0.5,
  },
  {
    loc: `${SITE_URL}/terms-and-conditions`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: 0.5,
  },
  {
    loc: `${SITE_URL}/disclaimer`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: 0.5,
  },
]

async function fetchArticles(): Promise<SitemapEntry[]> {
  try {
    console.log('📰 Fetching articles from API...')
    const response = await axios.get(`${API_BASE_URL}/api/v1/articles`, {
      params: {
        limit: 1000, // Fetch large batch
        sort: '-published_at',
      },
      timeout: 10000,
    })

    const articles = response.data.data || response.data

    if (!Array.isArray(articles)) {
      console.warn('⚠️  No articles found or invalid response format')
      return []
    }

    console.log(`✅ Fetched ${articles.length} articles`)

    return articles.map((article: any) => ({
      loc: `${SITE_URL}/article/${article.slug}`,
      lastmod: formatDate(article.updated_at || article.published_at),
      changefreq: 'weekly' as const,
      priority: 0.8,
    }))
  } catch (error) {
    console.error('❌ Error fetching articles:', error instanceof Error ? error.message : error)
    return []
  }
}

async function fetchCategories(): Promise<SitemapEntry[]> {
  try {
    console.log('📂 Fetching categories from API...')
    const response = await axios.get(`${API_BASE_URL}/api/v1/categories`, {
      timeout: 10000,
    })

    const categories = response.data.data || response.data

    if (!Array.isArray(categories)) {
      console.warn('⚠️  No categories found or invalid response format')
      return []
    }

    console.log(`✅ Fetched ${categories.length} categories`)

    return categories.map((category: any) => ({
      loc: `${SITE_URL}/category/${category.slug}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'daily' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error('❌ Error fetching categories:', error instanceof Error ? error.message : error)
    return []
  }
}

function generateSitemapXml(entries: SitemapEntry[]): string {
  const xmlEntries = entries
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>
`
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

async function generateSitemap(): Promise<void> {
  try {
    console.log('🚀 Starting sitemap generation...\n')

    // Fetch dynamic content
    const articles = await fetchArticles()
    const categories = await fetchCategories()

    // Combine all entries
    const allEntries = [...staticPages, ...categories, ...articles]

    // Sort by priority (highest first), then by URL
    allEntries.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority
      }
      return a.loc.localeCompare(b.loc)
    })

    // Generate XML
    const sitemapXml = generateSitemapXml(allEntries)

    // Write to file
    const sitemapPath = path.join(PUBLIC_DIR, 'sitemap.xml')
    fs.writeFileSync(sitemapPath, sitemapXml, 'utf-8')

    console.log(`\n✅ Sitemap generated successfully!`)
    console.log(`📊 Total URLs: ${allEntries.length}`)
    console.log(`   - Static pages: ${staticPages.length}`)
    console.log(`   - Categories: ${categories.length}`)
    console.log(`   - Articles: ${articles.length}`)
    console.log(`📁 Saved to: ${sitemapPath}`)

  } catch (error) {
    console.error('❌ Error generating sitemap:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

// Run the generator
generateSitemap()