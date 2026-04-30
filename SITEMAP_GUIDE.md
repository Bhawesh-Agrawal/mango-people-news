# Sitemap Generation Guide

## Overview

Mango People News includes a dynamic XML sitemap generator that automatically creates a Google Search Console-compliant sitemap including:

- ✅ All static pages (home, articles, newsletter, privacy policy, terms, disclaimer)
- ✅ All blog articles from the database
- ✅ All category pages
- ✅ Last modification dates
- ✅ Change frequency and priority tags
- ✅ Proper XML escaping and formatting

## How It Works

### Automatic Generation (Recommended)

The sitemap is automatically generated as part of your build process:

```bash
npm run build
```

This will:
1. Build your TypeScript and Vite project
2. Generate a dynamic `sitemap.xml` based on current articles and categories
3. Place it in the `public/` directory for serving

### Manual Generation

You can also generate the sitemap manually anytime:

```bash
npm run generate:sitemap
```

## File Structure

```
public/
├── robots.txt      # Updated to reference sitemap.xml
└── sitemap.xml     # Auto-generated during build
```

## Configuration

The sitemap generator uses the following configuration:

**File**: `generate-sitemap.js`

**Key variables** (at the top of the file):
- `API_BASE_URL`: Your backend API URL (defaults to `http://localhost:3000/api`)
- `SITE_URL`: Your production domain (`https://mangopeoplenews.com`)

**Update these if needed:**

```javascript
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const SITE_URL = 'https://mangopeoplenews.com'
```

## Sitemap Content

### Static Pages (Priority: 0.5 - 1.0)

- `/` (Home) - Priority 1.0, daily updates
- `/articles` (All articles) - Priority 0.9, daily updates
- `/trending` (Trending) - Priority 0.9, daily updates
- `/newsletter` (Newsletter signup) - Priority 0.8, weekly updates
- `/privacy-policy` - Priority 0.5, monthly updates
- `/terms-and-conditions` - Priority 0.5, monthly updates
- `/disclaimer` - Priority 0.5, monthly updates

### Dynamic Content

**Categories** (Priority: 0.7, daily updates)
- Automatically fetched from `/api/categories`
- URLs: `/category/{slug}`

**Articles** (Priority: 0.8, weekly updates)
- Automatically fetched from `/api/articles`
- URLs: `/article/{slug}`
- Uses article's `updated_at` for `lastmod` date

## Google Search Console Setup

### 1. Submit Sitemap

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property
3. Navigate to **Sitemaps** section (left sidebar)
4. Enter the sitemap URL: `https://mangopeoplenews.com/sitemap.xml`
5. Click **Submit**

### 2. Monitor Sitemap Status

In Google Search Console, you can:
- View how many URLs were found
- Check for errors or warnings
- See crawl statistics
- Monitor indexing progress

### 3. Verify robots.txt

Your `robots.txt` file now includes:

```
Sitemap: https://mangopeoplenews.com/sitemap.xml
```

Google will automatically discover this and check your sitemap.

## XML Sitemap Format

The generated `sitemap.xml` follows the standard XML Sitemap Protocol:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://mangopeoplenews.com/article/example-article</loc>
    <lastmod>2026-05-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  ...
</urlset>
```

## Sitemap Properties Explained

- **`loc`**: The URL of the page
- **`lastmod`**: When the page was last modified (in YYYY-MM-DD format)
- **`changefreq`**: How often the page typically changes (hint to crawlers)
- **`priority`**: Relative priority compared to other URLs (0.0 - 1.0)

## Priority Guidelines Used

| Page Type | Priority | Reason |
|-----------|----------|--------|
| Home | 1.0 | Most important entry point |
| Article listing | 0.9 | Main content hub |
| Trending | 0.9 | Popular content |
| Individual articles | 0.8 | Core content |
| Categories | 0.7 | Navigation/filtering |
| Newsletter | 0.8 | Call-to-action |
| Legal pages | 0.5 | Supporting pages |

## Change Frequency Guidelines Used

- **daily**: Home, articles list, trending
- **weekly**: Individual articles, newsletter
- **monthly**: Legal pages (privacy, terms, disclaimer)

## Troubleshooting

### Sitemap not generating?

1. **Check API connectivity**:
   ```bash
   curl http://localhost:3000/api/articles
   ```

2. **Check file permissions**: Ensure `public/` directory is writable

3. **Verify API_BASE_URL**: Update in `generate-sitemap.js` if using different API

### Too many URLs in sitemap?

Google supports up to 50,000 URLs per sitemap file. If you exceed this, you may need to split into multiple sitemaps. (This is not an issue for most sites)

### Articles not appearing?

1. Ensure articles have a `slug` field
2. Verify API response format matches expected structure
3. Check that articles endpoint returns articles under `data` property

## Environment Variables

You can set the API URL via environment variables:

```bash
# During build
VITE_API_BASE_URL=https://api.example.com npm run build

# Or in .env file
VITE_API_BASE_URL=https://api.example.com
```

## Automation Tips

### Pre-deployment

Before deploying to production:

1. Test sitemap generation locally:
   ```bash
   npm run generate:sitemap
   ```

2. Verify `public/sitemap.xml` is created

3. Check that it contains all expected articles and pages

### Scheduled Updates

For frequent article updates, consider:

1. **Webhook**: Trigger sitemap rebuild when articles are published
2. **Scheduled task**: Regenerate daily using cron/CI/CD
3. **On-demand**: Generate after bulk article imports

## SEO Best Practices

✅ **Do**:
- Keep sitemap updated regularly
- Submit to Google Search Console
- Include only canonical URLs
- Update lastmod date when content changes
- Include new articles within 24 hours of publication

❌ **Don't**:
- Include pages blocked by robots.txt
- Include URLs with duplicate content
- Mix trailing slashes inconsistently
- Change priority arbitrarily

## Further Reading

- [Google Sitemap Protocol](https://www.sitemaps.org/)
- [Google Search Console Help](https://support.google.com/webmasters)
- [Submit Your Sitemap](https://developers.google.com/search/docs/beginner/manage-urls)

## Support

For issues or questions:
- Email: mangopeoplenews2026@gmail.com
- Website: https://mangopeoplenews.com
