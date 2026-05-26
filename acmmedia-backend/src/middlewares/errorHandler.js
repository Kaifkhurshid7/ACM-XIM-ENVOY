/**
 * Error Handling Middleware
 * 
 * Provides centralized error handling for the entire application.
 * Includes a custom AppError class for operational errors and
 * catch-all handlers for unmatched routes and unexpected failures.
 * 
 * Error Flow:
 * 1. Route handlers throw or call next(error)
 * 2. notFoundHandler catches unmatched routes
 * 3. errorHandler formats and sends the error response
 * 
 * @module middlewares/errorHandler
 */

/**
 * Custom application error with HTTP status code.
 * Use this for expected/operational errors (validation, not found, etc.)
 */
class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Catches requests to undefined routes and forwards a 404 error.
 */
const notFoundHandler = (req, res, next) => {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Global error handler - formats all errors into a consistent JSON response.
 * Logs server errors (5xx) for debugging while keeping client responses clean.
 */
const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Server error";

  // Log unexpected server errors for debugging
  if (statusCode >= 500) {
    console.error("Unhandled error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = { AppError, notFoundHandler, errorHandler };
