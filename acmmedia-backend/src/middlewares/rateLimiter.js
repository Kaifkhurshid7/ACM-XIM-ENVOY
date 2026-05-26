/**
 * Rate Limiting Middleware
 * 
 * Protects the API from abuse, brute-force attacks, and DDoS-style flooding.
 * Different limits are applied based on endpoint sensitivity.
 * 
 * Strategy:
 * - Auth endpoints (login/register): Strict limits to prevent brute-force
 * - General API: Moderate limits for normal usage patterns
 * - Admin endpoints: Relaxed limits for dashboard operations
 * 
 * Why IP-based limiting:
 * - Simple and effective for our scale (100+ users)
 * - No external dependencies (Redis not needed at this scale)
 * - Transparent to legitimate users
 * 
 * Headers returned:
 * - X-RateLimit-Limit: Maximum requests allowed
 * - X-RateLimit-Remaining: Requests remaining in window
 * - X-RateLimit-Reset: Time when the limit resets
 * 
 * @module middlewares/rateLimiter
 */

const rateLimit = require("express-rate-limit");

/**
 * Strict limiter for authentication endpoints.
 * Prevents brute-force password attacks and registration spam.
 * 
 * Login: 5 attempts per minute per IP
 * Register: 3 attempts per minute per IP
 */
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 1 minute.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests from counting (only failed attempts matter)
  skipSuccessfulRequests: false,
});

/**
 * Even stricter limiter specifically for registration.
 * Prevents mass account creation from a single IP.
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3,
  message: {
    success: false,
    message: "Too many registration attempts. Please try again after 1 minute.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API limiter for all public endpoints.
 * Allows normal browsing patterns while preventing automated scraping.
 * 
 * 100 requests per 15 minutes per IP is generous for human users
 * but restrictive enough to block automated abuse.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Upload limiter to prevent storage abuse.
 * 10 uploads per hour per IP.
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    message: "Upload limit reached. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  registerLimiter,
  generalLimiter,
  uploadLimiter,
};
