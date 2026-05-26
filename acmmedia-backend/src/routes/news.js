/**
 * News Routes
 * 
 * Serves external technology news from NewsAPI.
 * Implements caching to minimize external API calls and
 * provides graceful fallback when the service is unavailable.
 * 
 * Endpoints:
 * - GET / - Fetch cached technology news headlines
 * 
 * Note: This route is mounted at both /api/v1/news and /api/v1/external-news
 * for backward compatibility with the frontend.
 * 
 * @module routes/news
 */

const router = require("express").Router();
const { fetchTechNews } = require("../services/newsService");

/** Fetch technology news (cached, with fallback) */
router.get("/", async (req, res) => {
  try {
    const articles = await fetchTechNews();
    res.json(articles);
  } catch (err) {
    console.error("News route error:", err.message);
    res.status(500).json({ msg: "Failed to fetch news" });
  }
});

module.exports = router;
