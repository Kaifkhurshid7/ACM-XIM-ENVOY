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

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET environment variable is required. " +
    "Set a strong, unique secret key (openssl rand -hex 32)."
  );
}

module.exports = JWT_SECRET;
