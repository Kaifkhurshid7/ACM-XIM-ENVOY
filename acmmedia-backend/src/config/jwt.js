/**
 * JWT Configuration
 * 
 * Provides the JWT signing secret used for token generation and verification.
 * The secret MUST be set via environment variable in production.
 * 
 * Environment Variables:
 * - JWT_SECRET: Secret key for signing JWT tokens (required in production)
 * 
 * @module config/jwt
 */

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error(
    "JWT_SECRET environment variable is required in production. " +
    "Set a strong, unique secret key."
  );
}

module.exports = JWT_SECRET || "dev_secret_change_in_production";
