const router = require("express").Router();
const axios = require("axios");
const NodeCache = require("node-cache");

// Cache for 30 minutes (1800 seconds)
const newsCache = new NodeCache({ stdTTL: 1800 });
const CACHE_KEY = "tech-news-v2";

const getFallbackArticles = (reason) => ([
    {
        title: "Tech News Temporarily Unavailable",
        description: reason || "The external news provider is unavailable right now. Please try again shortly.",
        url: "#",
        image: null,
        publishedAt: new Date().toISOString(),
        source: "ACM Media"
    }
]);

router.get("/", async (req, res) => {
    try {
        // Check cache first
        const cachedNews = newsCache.get(CACHE_KEY);
        if (cachedNews) {
            console.log("Serving news from cache");
            return res.json(cachedNews);
        }

        console.log("Fetching fresh news...");

        const apiKey = process.env.NEWS_API_KEY;

        if (!apiKey) {
            const fallback = getFallbackArticles("Please set NEWS_API_KEY in .env to fetch real news.");
            newsCache.set(CACHE_KEY, fallback, 300);
            return res.json(fallback);
        }
        // NewsAPI: https://newsapi.org/docs/endpoints/top-headlines
        const response = await axios.get('https://newsapi.org/v2/top-headlines', {
            params: {
                category: 'technology',
                language: 'en',
                apiKey
            }
        });

        // Sanitize Data

        const rawArticles = Array.isArray(response.data.articles) ? response.data.articles : [];
        const articles = rawArticles.map(article => ({
            title: article.title,
            description: article.description,
            url: article.url,
            image: article.urlToImage,
            publishedAt: article.publishedAt,
            source: article.source?.name || 'NewsAPI'
        })).filter(a => a.title && a.url); // Basic filtering

        if (articles.length === 0) {
            const fallback = getFallbackArticles("No technology headlines were returned by the news provider.");
            newsCache.set(CACHE_KEY, fallback, 300);
            return res.json(fallback);
        }

        // Save to cache
        newsCache.set(CACHE_KEY, articles);

        res.json(articles);

    } catch (err) {
        console.error("News Fetch Error:", err.response?.data || err.message);
        const fallback = getFallbackArticles();
        newsCache.set(CACHE_KEY, fallback, 300);
        res.json(fallback);
    }
});

module.exports = router;
