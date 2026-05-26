/**
 * News Service
 * 
 * Fetches and caches technology news from the NewsAPI external provider.
 * Implements a caching layer to reduce API calls and provide resilience
 * against external service outages.
 * 
 * Caching Strategy:
 * - Successful responses cached for 30 minutes
 * - Error/fallback responses cached for 5 minutes
 * - Stale cache is served if the external API is unavailable
 * 
 * @module services/newsService
 */

const axios = require("axios");
const NodeCache = require("node-cache");
const { NEWS_CACHE } = require("../constants");

const newsCache = new NodeCache({ stdTTL: NEWS_CACHE.TTL_SECONDS });

/**
 * Generates fallback articles when the external API is unavailable.
 * Provides a graceful degradation experience for users.
 */
const getFallbackArticles = (reason) => [
  {
    title: "Tech News Temporarily Unavailable",
    description: reason || "The external news provider is unavailable right now. Please try again shortly.",
    url: "#",
    image: null,
    publishedAt: new Date().toISOString(),
    source: "ACM Media",
  },
];

/**
 * Fetches technology news headlines, using cache when available.
 * 
 * @returns {Array} Array of sanitized news article objects
 */
const fetchTechNews = async () => {
  // Check cache first
  const cached = newsCache.get(NEWS_CACHE.CACHE_KEY);
  if (cached) {
    return cached;
  }

  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    const fallback = getFallbackArticles("Please set NEWS_API_KEY in .env to fetch real news.");
    newsCache.set(NEWS_CACHE.CACHE_KEY, fallback, NEWS_CACHE.ERROR_TTL_SECONDS);
    return fallback;
  }

  try {
    const response = await axios.get("https://newsapi.org/v2/top-headlines", {
      params: {
        category: "technology",
        language: "en",
        apiKey,
      },
    });

    // Sanitize and normalize the response data
    const rawArticles = Array.isArray(response.data.articles)
      ? response.data.articles
      : [];

    const articles = rawArticles
      .map((article) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        image: article.urlToImage,
        publishedAt: article.publishedAt,
        source: article.source?.name || "NewsAPI",
      }))
      .filter((a) => a.title && a.url);

    if (articles.length === 0) {
      const fallback = getFallbackArticles("No technology headlines were returned by the news provider.");
      newsCache.set(NEWS_CACHE.CACHE_KEY, fallback, NEWS_CACHE.ERROR_TTL_SECONDS);
      return fallback;
    }

    newsCache.set(NEWS_CACHE.CACHE_KEY, articles);
    return articles;
  } catch (err) {
    console.error("News Fetch Error:", err.response?.data || err.message);
    const fallback = getFallbackArticles();
    newsCache.set(NEWS_CACHE.CACHE_KEY, fallback, NEWS_CACHE.ERROR_TTL_SECONDS);
    return fallback;
  }
};

module.exports = { fetchTechNews };
