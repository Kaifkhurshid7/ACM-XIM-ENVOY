/**
 * Security Service
 * 
 * Handles password hashing, token generation, email verification,
 * and password reset workflows with OWASP best practices.
 * 
 * Features:
 * - Bcrypt password hashing with configurable rounds
 * - Cryptographically secure token generation
 * - Email verification flow
 * - Forgot password with token expiry
 * - Rate limiting for reset attempts
 * 
 * @module services/securityService
 */

const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "12", 10);
const TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
const RESET_ATTEMPT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_RESET_ATTEMPTS = 5;

/**
 * Hash password with bcrypt
 */
async function hashPassword(password) {
  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Compare plain password with hash
 */
async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Generate cryptographically secure token
 */
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Hash token for storage
 */
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generate verification token
 */
function generateVerificationToken() {
  return {
    token: generateToken(),
    expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS),
  };
}

/**
 * Generate password reset token
 */
function generatePasswordResetToken() {
  return {
    token: generateToken(),
    expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS),
  };
}

/**
 * Validate password strength
 */
function validatePasswordStrength(password) {
  const errors = [];

  if (password.length < 8) {
    errors.push("Minimum 8 characters");
  }
  if (password.length > 128) {
    errors.push("Maximum 128 characters");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("At least 1 lowercase letter");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("At least 1 uppercase letter");
  }
  if (!/\d/.test(password)) {
    errors.push("At least 1 number");
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("At least 1 special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate password strength score (0-100)
 */
function calculatePasswordStrength(password) {
  let score = 0;

  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/\d/.test(password)) score += 15;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 20;

  return Math.min(score, 100);
}

/**
 * Check if password reset is rate limited
 */
function isResetRateLimited(user) {
  if (!user.passwordResetAttempts) return false;

  const lastReset = user.passwordResetExpiry;
  if (!lastReset) return false;

  const timeSinceLastReset = Date.now() - new Date(lastReset).getTime();

  // If attempts are within the window, check count
  if (timeSinceLastReset < RESET_ATTEMPT_WINDOW_MS) {
    return user.passwordResetAttempts >= MAX_RESET_ATTEMPTS;
  }

  // Window expired, reset attempt counter
  return false;
}

/**
 * Increment reset attempt counter
 */
function incrementResetAttempts(user) {
  const now = Date.now();
  const lastReset = user.passwordResetExpiry ? new Date(user.passwordResetExpiry).getTime() : 0;
  const timeSinceLastReset = now - lastReset;

  // Reset counter if outside window
  if (timeSinceLastReset >= RESET_ATTEMPT_WINDOW_MS) {
    user.passwordResetAttempts = 1;
  } else {
    user.passwordResetAttempts += 1;
  }
}

/**
 * Reset attempt counter
 */
function resetAttemptCounter(user) {
  user.passwordResetAttempts = 0;
}

/**
 * Sanitize user input to prevent XSS
 */
function sanitizeInput(input) {
  if (typeof input !== "string") return input;

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
function isValidUrl(url) {
  if (!url) return true; // Optional field
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate social media link
 */
function isValidSocialLink(platform, url) {
  if (!url) return true; // Optional

  const patterns = {
    github: /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/,
    linkedin: /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9_-]+\/?$/,
    twitter: /^(https?:\/\/)?(www\.)?(twitter|x)\.com\/[a-zA-Z0-9_]+\/?$/,
    portfolio: /^https?:\/\/.+\..+/,
  };

  if (!patterns[platform]) return true;
  return patterns[platform].test(url);
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  hashToken,
  generateVerificationToken,
  generatePasswordResetToken,
  validatePasswordStrength,
  calculatePasswordStrength,
  isResetRateLimited,
  incrementResetAttempts,
  resetAttemptCounter,
  sanitizeInput,
  isValidEmail,
  isValidUrl,
  isValidSocialLink,
  BCRYPT_ROUNDS,
  TOKEN_EXPIRY_MS,
  RESET_ATTEMPT_WINDOW_MS,
  MAX_RESET_ATTEMPTS,
};
