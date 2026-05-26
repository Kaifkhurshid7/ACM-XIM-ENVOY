/**
 * Structured Logging Utility
 * 
 * Production-grade logging using Pino for high-performance structured output.
 * 
 * Log Levels:
 * - fatal: System is unusable (process will exit)
 * - error: Operation failed, requires attention
 * - warn:  Unexpected behavior, non-critical
 * - info:  Normal operational events
 * - debug: Detailed diagnostic info (dev only)
 * 
 * Design Decisions:
 * - Pino chosen over Winston for 5-10x better throughput under load
 * - JSON format in production for log aggregation compatibility
 * - Pretty printing in development for readability
 * - Redaction of sensitive fields (password, token, authorization)
 * 
 * @module utils/logger
 */

const pino = require("pino");

const isProduction = process.env.NODE_ENV === "production";

const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),

  // Redact sensitive data from logs to prevent credential leaks
  redact: {
    paths: ["req.headers.authorization", "password", "token", "*.password", "*.token"],
    censor: "[REDACTED]",
  },

  // Human-readable timestamps
  timestamp: pino.stdTimeFunctions.isoTime,

  // Pretty print in development, JSON in production
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
});

module.exports = logger;
