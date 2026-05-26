/**
 * Centralized Configuration Module
 * 
 * Aggregates all configuration values from environment variables
 * into a single, validated configuration object.
 * 
 * @module config
 */

const config = {
  // Server
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Database
  mongoUri: process.env.MONGO_URI,

  // Authentication
  jwtSecret: require("./jwt"),
  adminSecret: process.env.ADMIN_SECRET || "ADMIN_2026",

  // External APIs
  newsApiKey: process.env.NEWS_API_KEY,

  // CORS - Allowed origins for cross-origin requests
  allowedOrigins: [
    "http://localhost:5173",
    "https://acmmedia-frontend.vercel.app",
  ],
};

module.exports = config;
