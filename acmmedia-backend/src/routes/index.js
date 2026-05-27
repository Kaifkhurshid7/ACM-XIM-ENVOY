/**
 * Route Index
 * 
 * Centralizes all route mounting with per-route rate limiting.
 * 
 * Rate Limiting Strategy:
 * - Auth routes: Strict (5 req/min) to prevent brute-force
 * - Upload routes: Moderate (10 req/hour) to prevent storage abuse
 * - General routes: Covered by global limiter (100 req/15min)
 * 
 * API Versioning: All routes prefixed with /api/v1
 * 
 * @module routes
 */

const { authLimiter, registerLimiter, uploadLimiter } = require("../middlewares/rateLimiter");

const authRoutes = require("./auth");
const profileRoutes = require("./profile");
const postRoutes = require("./posts");
const commentRoutes = require("./comments");
const forumRoutes = require("./forum");
const eventRoutes = require("./events");
const adminRoutes = require("./admin");
const newsRoutes = require("./news");
const uploadRoutes = require("./upload");

/**
 * Mounts all API routes with appropriate rate limiting.
 * 
 * @param {object} app - Express application instance
 */
const mountRoutes = (app) => {
  // Auth routes with strict rate limiting
  app.use("/api/v1/auth/login", authLimiter);
  app.use("/api/v1/auth/register", registerLimiter);
  app.use("/api/v1/auth", authRoutes);

  // Profile routes
  app.use("/api/v1/profile", profileRoutes);

  // Content routes (covered by global limiter)
  app.use("/api/v1/posts", postRoutes);
  app.use("/api/v1/comments", commentRoutes);
  app.use("/api/v1/discussions", forumRoutes);
  app.use("/api/v1/forum", forumRoutes);
  app.use("/api/v1/events", eventRoutes);

  // Admin routes
  app.use("/api/v1/admin", adminRoutes);

  // News routes (backward compatibility alias)
  app.use("/api/v1/news", newsRoutes);
  app.use("/api/v1/external-news", newsRoutes);

  // Upload routes with storage-abuse prevention
  app.use("/api/v1/upload", uploadLimiter, uploadRoutes);
};

module.exports = mountRoutes;
