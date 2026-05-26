/**
 * Security Middleware Stack
 * 
 * Production-grade security hardening for the Express application.
 * Protects against common web vulnerabilities without breaking functionality.
 * 
 * Layers:
 * 1. Helmet - Sets secure HTTP headers (XSS, clickjacking, MIME sniffing)
 * 2. CORS - Restricts cross-origin access to known frontends
 * 3. Mongo Sanitize - Prevents NoSQL injection via query operators
 * 4. HPP - Prevents HTTP parameter pollution attacks
 * 5. Compression - Reduces response size for faster transfers
 * 6. Body limits - Prevents payload-based DoS attacks
 * 
 * Why these specific protections:
 * - Helmet: Single package that sets 11+ security headers
 * - mongoSanitize: MongoDB is vulnerable to {$gt: ""} injection in req.body
 * - HPP: Prevents duplicate query params from causing unexpected behavior
 * - Compression: 60-80% size reduction for JSON responses
 * 
 * @module middlewares/security
 */

const helmet = require("helmet");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const compression = require("compression");

/**
 * Applies the full security middleware stack to an Express app.
 * Must be called BEFORE route mounting.
 * 
 * @param {object} app - Express application instance
 */
const applySecurityMiddleware = (app) => {
  // ─── Helmet: Secure HTTP Headers ─────────────────────────────────────────
  // Sets X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, etc.
  // crossOriginResourcePolicy disabled to allow serving uploaded images cross-origin
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: false, // Disabled for Swagger UI compatibility
    })
  );

  // ─── CORS: Cross-Origin Resource Sharing ─────────────────────────────────
  // In production, restrict to known frontend origins.
  // In development, allow all origins for local testing.
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://acmmedia-frontend.vercel.app",
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        // In production, reject unknown origins; in dev, allow all
        if (process.env.NODE_ENV === "production") {
          return callback(null, false);
        }
        return callback(null, true);
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
      maxAge: 86400, // Cache preflight for 24 hours
    })
  );

  // ─── Body Parsing with Size Limits ───────────────────────────────────────
  // Prevents payload-based DoS by rejecting oversized request bodies.
  // 10KB is generous for JSON APIs; file uploads use multipart (handled by multer)
  app.use(require("express").json({ limit: "10kb" }));
  app.use(require("express").urlencoded({ extended: true, limit: "10kb" }));

  // ─── NoSQL Injection Prevention ──────────────────────────────────────────
  // Strips MongoDB operators ($gt, $ne, etc.) from req.body, req.query, req.params
  // Without this, an attacker could send { email: { $gt: "" } } to bypass auth
  app.use(mongoSanitize());

  // ─── HTTP Parameter Pollution Protection ─────────────────────────────────
  // Prevents duplicate query parameters from causing unexpected array behavior
  // e.g., ?sort=name&sort=email would normally create an array
  app.use(hpp());

  // ─── Response Compression ────────────────────────────────────────────────
  // Gzip/Brotli compression reduces JSON response sizes by 60-80%
  // Critical for mobile users and slower connections
  // Threshold: Only compress responses > 1KB (small responses aren't worth it)
  app.use(
    compression({
      threshold: 1024,
      filter: (req, res) => {
        if (req.headers["x-no-compression"]) return false;
        return compression.filter(req, res);
      },
    })
  );
};

module.exports = applySecurityMiddleware;
