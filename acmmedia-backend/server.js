/**
 * ACM-XIM-ENVOY Backend Server
 * 
 * Production-grade Express.js application entry point.
 * 
 * Middleware Stack (order matters):
 * 1. Security headers (Helmet)
 * 2. CORS protection
 * 3. Body parsing with size limits
 * 4. NoSQL injection prevention
 * 5. HTTP parameter pollution protection
 * 6. Response compression
 * 7. Rate limiting (per-route)
 * 8. Routes
 * 9. Error handling
 * 
 * Scalability Features:
 * - Database indexes for O(log n) queries
 * - Response compression (60-80% size reduction)
 * - Rate limiting prevents resource exhaustion
 * - Structured logging for production monitoring
 * - Graceful shutdown handling
 * 
 * Deployment:
 * - Vercel: Serverless via vercel.json (routes all to server.js)
 * - Render: Traditional Node.js process with PORT env variable
 * 
 * @module server
 */

require("dotenv").config();

const express = require("express");
const swaggerUi = require("swagger-ui-express");

const connectDB = require("./src/config/database");
const ensureIndexes = require("./src/config/indexes");
const applySecurityMiddleware = require("./src/middlewares/security");
const { generalLimiter } = require("./src/middlewares/rateLimiter");
const swaggerSpec = require("./src/docs/swagger");
const mountRoutes = require("./src/routes");
const { notFoundHandler, errorHandler } = require("./src/middlewares/errorHandler");
const logger = require("./src/utils/logger");

const app = express();

// ─── Security & Performance Middleware ───────────────────────────────────────
// Applied BEFORE routes. Order is critical for security.
applySecurityMiddleware(app);

// ─── Global Rate Limiting ────────────────────────────────────────────────────
// Applies to all routes. Specific routes have stricter limits layered on top.
app.use("/api/", generalLimiter);

// ─── Health Check Endpoints ──────────────────────────────────────────────────
// Excluded from rate limiting. Used by Render/Vercel for uptime monitoring.
app.get("/", (req, res) => res.send("Server: Health OK"));
app.get("/api", (req, res) => res.send("API: Health OK"));
app.get("/api/v1", (req, res) => res.send("API v1: Health OK"));

// ─── API Documentation ──────────────────────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Static Files ────────────────────────────────────────────────────────────
// Serve uploaded images (avatars, post images) with cross-origin headers
app.use("/uploads", express.static("uploads"));

// ─── API Routes ──────────────────────────────────────────────────────────────
mountRoutes(app);

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Server Startup ──────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await ensureIndexes();

    const server = app.listen(PORT, () => {
      logger.info(`✓ Server active on port ${PORT}`);
      logger.info(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`✓ API docs: http://localhost:${PORT}/api-docs`);
    });

    // Initialize Socket.IO after HTTP server is ready
    require("./src/socket").init(server);

    // ─── Graceful Shutdown ─────────────────────────────────────────────────
    // Ensures in-flight requests complete before process exits.
    // Critical for zero-downtime deployments on Render.
    const shutdown = (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
      // Force exit after 10s if graceful shutdown hangs
      setTimeout(() => process.exit(1), 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (err) {
    logger.fatal({ err: err.message }, "Server startup failed");
    process.exit(1);
  }
};

startServer();
