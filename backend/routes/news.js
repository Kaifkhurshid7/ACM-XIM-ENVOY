const router = require("express").Router();
const axios = require("axios");
const NodeCache = require("node-cache");

// Cache for 30 minutes (1800 seconds)
const newsCache = new NodeCache({ stdTTL: 1800 });

router.get("/", async (req, res) => {
    try {
        // Check cache first
        const CACHE_KEY = "tech-news-v2"; // Changed key to force flush
        const cachedNews = newsCache.get(CACHE_KEY);
        if (cachedNews) {
            console.log("Serving news from cache");
            return res.json(cachedNews);
        }

        console.log("Fetching fresh news...");

        // Fetch from NewsAPI (Technology category)
        // Using a public free key or env variable. 
        // Ideally: process.env.NEWS_API_KEY
        // For now, I'll assume the user might not have one set, 
        // so I'll add a fallback or use a placeholder if env is missing.

        const apiKey = process.env.NEWS_API_KEY;

        if (!apiKey) {
            // Mock response if no key is present to prevent crash
            return res.json([
                {
                    title: "No API Key Configured",
                    description: "Please set NEWS_API_KEY in .env to fetch real news.",
                    url: "#",
                    publishedAt: new Date().toISOString()
                }
            ]);
        }

        const response = await axios.get(`https://newsapi.org/v2/top-headlines`, {
            params: {
                category: 'technology',
                language: 'en',
                apiKey: apiKey
            }
        });

        // Sanitize Data
        const articles = response.data.articles.map(article => ({
            title: article.title,
            description: article.description,
            url: article.url,
            image: article.urlToImage,
            publishedAt: article.publishedAt,
            source: article.source.name
        })).filter(a => a.title && a.url); // Basic filtering

        // Save to cache
        newsCache.set(CACHE_KEY, articles);

        res.json(articles);

    } catch (err) {
        console.error("News Fetch Error:", err.message);
        res.status(500).json({ msg: "Failed to fetch news" });
    }
});

module.exports = router;
