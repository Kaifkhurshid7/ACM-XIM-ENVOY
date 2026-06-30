/**
 * Security Utilities - Frontend
 * 
 * Client-side password validation and security checks.
 * These mirror backend security service for UX feedback.
 * 
 * @module utils/security
 */

/**
 * Validate password strength
 */
export function validatePasswordStrength(password) {
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
export function calculatePasswordStrength(password) {
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
 * Get password strength color
 */
export function getPasswordStrengthColor(score) {
  if (score < 30) return "#dc3545"; // Red
  if (score < 60) return "#ffc107"; // Orange
  if (score < 80) return "#17a2b8"; // Blue
  return "#28a745"; // Green
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(score) {
  if (score < 30) return "Weak";
  if (score < 60) return "Fair";
  if (score < 80) return "Good";
  return "Strong";
}
