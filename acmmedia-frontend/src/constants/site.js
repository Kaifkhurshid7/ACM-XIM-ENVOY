/**
 * Site Configuration
 *
 * Single source of truth for organisation identity, canonical URLs, and
 * default social-sharing metadata. Anything that appears in <head>, in
 * structured data, or in the footer should read from here so the site never
 * drifts out of sync with itself.
 *
 * Only verified information belongs in this file. Do not add sponsors,
 * member counts, awards, or partnerships that are not genuinely true.
 *
 * @module constants/site
 */

/**
 * Canonical origin of the deployed site (no trailing slash).
 *
 * Resolution order:
 * 1. VITE_SITE_URL — set this per environment (preview vs production)
 * 2. The known production deployment
 */
const rawSiteUrl =
  import.meta.env.VITE_SITE_URL || "https://acmmedia-frontend.vercel.app";

export const SITE_URL = rawSiteUrl.replace(/\/+$/, "");

export const SITE = {
  /** Short name used in <title> suffixes and the navbar */
  name: "ACM XIM",

  /** Full legal/organisational name used in structured data */
  legalName: "ACM Student Chapter, XIM University",

  /** Default browser tab title for the home page */
  title: "ACM XIM | Events, Workshops & Student Community",

  /** Suffix appended to inner-page titles */
  titleSuffix: "ACM XIM",

  /** Default meta description (~155 chars) */
  description:
    "The official platform of the ACM Student Chapter at XIM University. Browse upcoming events and workshops, read chapter announcements, and join member discussions.",

  url: SITE_URL,

  /**
   * Open Graph image, served from /public so it resolves to a stable absolute
   * URL. Currently the chapter logo. Replace public/og-image.png with a
   * 1200x630 artwork for best results on LinkedIn, X, and WhatsApp previews.
   */
  ogImage: `${SITE_URL}/og-image.png`,
  ogImageAlt: "ACM Student Chapter, XIM University",

  locale: "en_IN",
};

/**
 * Verified chapter links. These are the same URLs already used by the navbar.
 */
export const SOCIAL_LINKS = [
  { name: "Instagram", url: "https://www.instagram.com/xim_acm/" },
  { name: "LinkedIn", url: "https://www.linkedin.com/company/xim-acm/" },
  { name: "GitHub", url: "https://github.com/ACM-XIM" },
  { name: "Chapter Website", url: "https://www.acmxim.space/" },
];

/**
 * Routes that should be indexed by search engines. Kept in sync with the
 * sitemap generator so the two can never disagree.
 */
export const INDEXABLE_ROUTES = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/events", changefreq: "daily", priority: "0.9" },
  { path: "/news", changefreq: "hourly", priority: "0.7" },
  { path: "/forum", changefreq: "daily", priority: "0.7" },
  { path: "/register", changefreq: "monthly", priority: "0.6" },
  { path: "/login", changefreq: "yearly", priority: "0.3" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/conduct", changefreq: "yearly", priority: "0.3" },
];

/**
 * Builds an absolute URL from a site-relative path.
 *
 * @param {string} path - Site-relative path, e.g. "/events"
 * @returns {string} Absolute URL
 */
export const absoluteUrl = (path = "/") => {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

/**
 * Structured data describing the chapter as an organisation.
 * Used on the home page.
 */
export const organizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.legalName,
  alternateName: SITE.name,
  url: SITE.url,
  logo: SITE.ogImage,
  description: SITE.description,
  parentOrganization: {
    "@type": "Organization",
    name: "Association for Computing Machinery",
    url: "https://www.acm.org/",
  },
  sameAs: SOCIAL_LINKS.map((link) => link.url),
});

/**
 * Structured data describing the site itself.
 */
export const webSiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  inLanguage: "en",
  publisher: {
    "@type": "Organization",
    name: SITE.legalName,
    url: SITE.url,
  },
});

/**
 * Builds BreadcrumbList structured data.
 *
 * @param {Array<{name: string, path: string}>} trail - Ordered crumbs
 */
export const breadcrumbSchema = (trail = []) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.name,
    item: absoluteUrl(crumb.path),
  })),
});
