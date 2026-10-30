/**
 * Seo Component
 *
 * Per-page document head management for this single-page app. Renders nothing;
 * it synchronises <title>, meta description, canonical URL, Open Graph,
 * Twitter card, robots directives, and JSON-LD structured data with the
 * currently mounted page.
 *
 * Implemented directly against the DOM rather than pulling in a head-management
 * dependency, since the app only ever renders one <Seo> at a time (one per
 * route). Tags declared statically in index.html are updated in place instead
 * of being duplicated.
 *
 * Note on crawling: because this is a client-rendered SPA, crawlers that do not
 * execute JavaScript will only see index.html. The static defaults in
 * index.html are therefore kept meaningful, and this component upgrades them
 * per route for crawlers that do execute JS (Google, Bing) and for link
 * unfurling that follows redirects to the rendered page.
 *
 * Usage:
 *   <Seo
 *     title="Events & Workshops"
 *     description="Upcoming ACM XIM workshops, hackathons, and talks."
 *     jsonLd={eventSchema(event)}
 *   />
 *
 * @component
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SITE, absoluteUrl } from "../constants/site";

/** Marks tags this component created, so they can be cleaned up safely. */
const MANAGED = "data-seo-managed";

/**
 * Creates or updates a <meta> tag.
 *
 * @param {"name"|"property"} attr - Identifying attribute
 * @param {string} key - Attribute value, e.g. "description" or "og:title"
 * @param {string} content - Tag content
 */
const upsertMeta = (attr, key, content) => {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    el.setAttribute(MANAGED, "true");
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

/** Creates or updates <link rel="canonical">. */
const upsertCanonical = (href) => {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    el.setAttribute(MANAGED, "true");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

/** Replaces all structured-data blocks with the supplied schema objects. */
const applyJsonLd = (schemas) => {
  document.head
    .querySelectorAll(`script[type="application/ld+json"][${MANAGED}]`)
    .forEach((node) => node.remove());

  schemas
    .filter(Boolean)
    .forEach((schema) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute(MANAGED, "true");
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
};

const Seo = ({
  /** Page title without the site suffix. Omit on the home page. */
  title,
  /** Meta description for this page (~155 chars). Falls back to site default. */
  description = SITE.description,
  /** Canonical path. Defaults to the current route. */
  path,
  /** Absolute URL of the sharing image. */
  image = SITE.ogImage,
  /** Open Graph type: "website" or "article". */
  type = "website",
  /** Keep private/utility pages out of search results. */
  noindex = false,
  /** A schema.org object, or an array of them. */
  jsonLd,
}) => {
  const location = useLocation();
  const canonicalPath = path || location.pathname;

  // Normalise so the dependency array stays primitive and effects don't
  // re-run on every render because a fresh object was passed.
  const schemas = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];
  const serializedSchemas = JSON.stringify(schemas);

  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE.titleSuffix}` : SITE.title;
    const canonical = absoluteUrl(canonicalPath);

    document.title = fullTitle;

    upsertMeta("name", "description", description);
    upsertMeta(
      "name",
      "robots",
      noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large"
    );

    upsertCanonical(canonical);

    // Open Graph
    upsertMeta("property", "og:site_name", SITE.name);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:image", image);
    upsertMeta("property", "og:image:alt", SITE.ogImageAlt);
    upsertMeta("property", "og:locale", SITE.locale);

    // Twitter / X
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", image);
    upsertMeta("name", "twitter:image:alt", SITE.ogImageAlt);

    applyJsonLd(JSON.parse(serializedSchemas));

    // Structured data is page-specific, so it must not outlive this page.
    // Meta tags are intentionally left in place: the next route overwrites
    // them, which avoids a flash of missing metadata between transitions.
    return () => {
      document.head
        .querySelectorAll(`script[type="application/ld+json"][${MANAGED}]`)
        .forEach((node) => node.remove());
    };
  }, [
    title,
    description,
    canonicalPath,
    image,
    type,
    noindex,
    serializedSchemas,
  ]);

  return null;
};

export default Seo;
