import { Helmet } from "react-helmet-async";

// ─────────────────────────────────────────────────────────────
//  Constants — update SITE_URL once production domain is live
// ─────────────────────────────────────────────────────────────
const SITE_URL = "https://dev.gallitify.tech";
const SITE_NAME = "Mango People News";
const DEFAULT_DESCRIPTION =
  "India's financial and business news platform. Markets, economy, policy and more. News for Every Indian.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`;
const TWITTER_HANDLE = "@mangopeoplenews";

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

  // Set true for pages Google should NOT index (search results, account pages)
  noIndex?: boolean;
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
  noIndex = false,
}: SEOProps) {
  const fullTitle = title
    ? `${title} — ${SITE_NAME}`
    : `${SITE_NAME} — News for Every Indian`;

  const canonicalUrl = `${SITE_URL}${path}`;

  // Ensure OG image is absolute
  const resolvedOgImage = ogImage.startsWith("http")
    ? ogImage
    : `${SITE_URL}${ogImage}`;

  return (
    <Helmet>
      {/* ── Primary ── */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

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
    </Helmet>
  );
}