import { Helmet } from "react-helmet-async"

// ─────────────────────────────────────────────────────────────
//  JSON-LD helpers
// ─────────────────────────────────────────────────────────────
function escapeJson(str: string): string {
  return String(str)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
}

function toIso(ts: string | undefined | null): string | null {
  if (!ts) return null
  const d = new Date(ts)
  return isNaN(d.getTime()) ? null : d.toISOString()
}

// ─────────────────────────────────────────────────────────────
//  Constants — update SITE_URL once production domain is live
// ─────────────────────────────────────────────────────────────
const SITE_URL = "https://www.mangopeoplenews.com"
const SITE_NAME = "Mango People News"
const DEFAULT_DESCRIPTION =
  "India's financial and business news platform. Markets, economy, policy and more. News for Every Indian."
const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`
const TWITTER_HANDLE = "@mangopeoplenews"
const PUBLISHER_NAME = "MangoPeople News"
const FACEBOOK_PAGE = "https://www.facebook.com/share/1ZrPGRV4Xu/"

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────
interface SEOProps {
  // Page title — do NOT include site name, this component appends it
  title?: string;

  description?: string;

  // Canonical path e.g. "/article/some-slug" — SITE_URL is prepended
  path?: string;

  // Full absolute URL to OG image (1200×630 recommended)
  ogImage?: string;

  // "website" for all pages except articles
  ogType?: "website" | "article";

  // Article-specific fields (only used when ogType === "article")
  article?: {
    publishedTime?: string; // ISO 8601
    modifiedTime?: string;  // ISO 8601
    authorName?: string;
    tags?: string[];
    section?: string;       // Category name
  };

  // Comma-separated keywords for <meta name="keywords"> and JSON-LD
  keywords?: string;

  // Set true for pages Google should NOT index (search results, account pages)
  noIndex?: boolean;

  // Breadcrumb items for structured data (BreadcrumbList)
  breadcrumbs?: { name: string; url: string }[];
}

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────
export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "",
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  article,
  keywords,
  noIndex = false,
  breadcrumbs,
}: SEOProps) {
  const fullTitle = title
    ? `${title} — ${SITE_NAME}`
    : `${SITE_NAME} — News for Every Indian`

  const canonicalUrl = `${SITE_URL}${path}`

  // Ensure OG image is absolute
  const resolvedOgImage = ogImage.startsWith("http")
    ? ogImage
    : `${SITE_URL}${ogImage}`

  // ── Build NewsArticle JSON-LD ──────────────────────────────────
  const articleJsonLd =
    ogType === "article" && article
      ? JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
          headline: title || SITE_NAME,
          description: description || DEFAULT_DESCRIPTION,
          image: resolvedOgImage || DEFAULT_OG_IMAGE,
          datePublished: toIso(article.publishedTime),
          dateModified: toIso(article.modifiedTime) || toIso(article.publishedTime),
          author: { "@type": "Person", name: article.authorName || SITE_NAME },
          publisher: {
            "@type": "NewsMediaOrganization",
            name: SITE_NAME,
            logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
          },
          inLanguage: "en-IN",
          isAccessibleForFree: true,
          ...(article.section  ? { articleSection: article.section } : {}),
          ...(keywords        ? { keywords }                        : {}),
        }, null, 2)
      : null

  // ── Build BreadcrumbList JSON-LD ───────────────────────────────
  const breadcrumbJsonLd =
    breadcrumbs && breadcrumbs.length > 0
      ? JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: breadcrumbs.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            item: `${SITE_URL}${item.url}`,
          })),
        }, null, 2)
      : null

  return (
    <Helmet>
      {/* ── Primary ── */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="publisher" content={PUBLISHER_NAME} />
      <link rel="canonical" href={canonicalUrl} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {keywords && <meta name="keywords" content={keywords} />}

      {/* ── Open Graph ── */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={resolvedOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:locale" content="en_IN" />

      {/* ── Twitter Card ── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={resolvedOgImage} />

      {/* ── Article-specific Open Graph ── */}
      {ogType === "article" && article && (
        <>
          <meta property="article:publisher" content={FACEBOOK_PAGE} />
          {article.publishedTime && (
            <meta
              property="article:published_time"
              content={article.publishedTime}
            />
          )}
          {article.modifiedTime && (
            <meta
              property="article:modified_time"
              content={article.modifiedTime}
            />
          )}
          {article.authorName && (
            <meta property="article:author" content={article.authorName} />
          )}
          {article.section && (
            <meta property="article:section" content={article.section} />
          )}
          {article.tags?.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* ── Structured data (JSON-LD) ── */}
      {articleJsonLd && (
        <script type="application/ld+json">
          {escapeJson(articleJsonLd)}
        </script>
      )}
      {breadcrumbJsonLd && (
        <script type="application/ld+json">
          {escapeJson(breadcrumbJsonLd)}
        </script>
      )}
    </Helmet>
  )
}
