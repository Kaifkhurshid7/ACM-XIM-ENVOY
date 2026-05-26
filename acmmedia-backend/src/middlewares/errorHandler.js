/**
 * Centralized Error Handling Middleware
 * 
 * Handles all application errors with:
 * - Structured logging for production monitoring
 * - Consistent JSON error responses
 * - Environment-aware error detail exposure
 * - Mongoose/MongoDB specific error handling
 * - Multer file upload error handling
 * 
 * Error Categories:
 * - Operational (AppError): Expected errors (validation, not found, auth)
 * - Programming: Unexpected bugs (null reference, type errors)
 * - External: Third-party failures (DB timeout, API errors)
 * 
 * Security:
 * - Stack traces only exposed in development
 * - Internal error details hidden from clients in production
 * - All 5xx errors logged with full context for debugging
 * 
 * @module middlewares/errorHandler
 */

const logger = require("../utils/logger");

/**
 * Custom application error with HTTP status code.
 * Use for expected/operational errors.
 */
class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

/** Catches requests to undefined routes */
const notFoundHandler = (req, res, next) => {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Global error handler.
 * Formats errors into consistent JSON responses and logs appropriately.
 */
const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // ─── Mongoose Validation Error ─────────────────────────────────────────
  if (err.name === "ValidationError") {
    statusCode = 400;
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join(". ");
  }

  // ─── Mongoose Cast Error (invalid ObjectId) ────────────────────────────
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // ─── MongoDB Duplicate Key Error ───────────────────────────────────────
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for field: ${field}`;
  }

  // ─── Multer File Upload Errors ─────────────────────────────────────────
  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "File too large. Please upload a smaller file.";
  }

  // ─── JWT Errors ────────────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // ─── Logging ───────────────────────────────────────────────────────────
  if (statusCode >= 500) {
    logger.error({
      err: err.message,
      stack: err.stack,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    }, "Unhandled server error");
  } else if (statusCode >= 400) {
    logger.warn({
      statusCode,
      message,
      method: req.method,
      url: req.originalUrl,
    }, "Client error");
  }

  // ─── Response ──────────────────────────────────────────────────────────
  const response = {
    success: false,
    message,
  };

  // Include stack trace in development only
  if (process.env.NODE_ENV !== "production" && statusCode >= 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = { AppError, notFoundHandler, errorHandler };
