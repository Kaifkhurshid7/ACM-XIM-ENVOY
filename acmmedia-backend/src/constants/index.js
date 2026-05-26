/**
 * Application Constants
 * 
 * Centralized location for all magic strings, enums, and configuration
 * values used across the application. Prevents typos and ensures consistency.
 * 
 * @module constants
 */

/** User roles within the platform */
const ROLES = Object.freeze({
  ADMIN: "admin",
  MEMBER: "member",
});

/** Allowed email domains for university-restricted registration */
const ALLOWED_DOMAINS = Object.freeze([
  "@xim.edu.in",
  "@stu.xim.edu.in",
]);

/** HTTP status codes used in API responses */
const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
});

/** Socket.IO event names for real-time communication */
const SOCKET_EVENTS = Object.freeze({
  POST_LIKE_UPDATE: "post:like-update",
  FORUM_NEW_REPLY: "forum:new-reply",
  ANALYTICS_UPDATE: "analytics:update",
  ANALYTICS_REQUEST: "analytics:request",
});

/** News cache configuration */
const NEWS_CACHE = Object.freeze({
  TTL_SECONDS: 1800,       // 30 minutes for successful fetches
  ERROR_TTL_SECONDS: 300,  // 5 minutes for error/fallback responses
  CACHE_KEY: "tech-news-v2",
});

/** File upload constraints */
const UPLOAD = Object.freeze({
  MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: /jpeg|jpg|png|gif|webp/,
});

module.exports = {
  ROLES,
  ALLOWED_DOMAINS,
  HTTP_STATUS,
  SOCKET_EVENTS,
  NEWS_CACHE,
  UPLOAD,
};
