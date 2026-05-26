/**
 * Route Index
 * 
 * Centralizes all route mounting in one place.
 * Each route module handles its own middleware chain.
 * 
 * API Versioning: All routes are prefixed with /api/v1
 * to support future API version migrations without breaking clients.
 * 
 * @module routes
 */

const authRoutes = require("./auth");
const postRoutes = require("./posts");
const commentRoutes = require("./comments");
const forumRoutes = require("./forum");
const eventRoutes = require("./events");
const adminRoutes = require("./admin");
const newsRoutes = require("./news");
const uploadRoutes = require("./upload");

/**
 * Mounts all API routes on the Express app.
 * 
 * @param {object} app - Express application instance
 */
const mountRoutes = (app) => {
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/posts", postRoutes);
  app.use("/api/v1/comments", commentRoutes);
  app.use("/api/v1/forum", forumRoutes);
  app.use("/api/v1/events", eventRoutes);
  app.use("/api/v1/admin", adminRoutes);
  app.use("/api/v1/news", newsRoutes);
  app.use("/api/v1/external-news", newsRoutes); // Backward compatibility alias
  app.use("/api/v1/upload", uploadRoutes);
};

module.exports = mountRoutes;
