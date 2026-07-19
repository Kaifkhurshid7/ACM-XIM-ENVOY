/**
 * Validation Utilities & Rules
 * 
 * Production-grade client-side validation with comprehensive rules,
 * real-time validation support, and accessible error messaging.
 * 
 * @module utils/validation
 */

import { ALLOWED_DOMAINS } from "../constants";

/**
 * Validation error type definitions
 */
export const ValidationErrors = Object.freeze({
  REQUIRED: "required",
  INVALID_EMAIL: "invalidEmail",
  INVALID_DOMAIN: "invalidDomain",
  PASSWORD_SHORT: "passwordShort",
  PASSWORD_WEAK: "passwordWeak",
  PASSWORD_MISMATCH: "passwordMismatch",
  INVALID_URL: "invalidUrl",
  MIN_LENGTH: "minLength",
  MAX_LENGTH: "maxLength",
  PATTERN: "pattern",
});

/**
 * Validation rules for form fields
 * Each rule is a function that returns { isValid, error }
 */
export const ValidationRules = {
  /**
   * Required field validation
   * @returns {function} Validator function
   */
  required: (fieldName = "This field") => (value) => {
    const trimmed = typeof value === "string" ? value.trim() : value;
    return {
      isValid: Boolean(trimmed),
      error: trimmed ? null : `${fieldName} is required.`,
      errorType: ValidationErrors.REQUIRED,
    };
  },

  /**
   * Email format validation
   * @returns {function} Validator function
   */
  email: () => (value) => {
    if (!value) return { isValid: true, error: null };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(value);

    return {
      isValid,
      error: isValid ? null : "Please enter a valid email address.",
      errorType: ValidationErrors.INVALID_EMAIL,
    };
  },

  /**
   * University email domain validation
   * Only accepts emails from allowed domains (e.g., @stu.xim.edu.in, @xim.edu.in)
   * @returns {function} Validator function
   */
  universityEmail: () => (value) => {
    if (!value) return { isValid: true, error: null };

    const emailLower = value.toLowerCase().trim();
    const isValidDomain = ALLOWED_DOMAINS.some((d) => emailLower.endsWith(d));

    return {
      isValid: isValidDomain,
      error: isValidDomain
        ? null
        : `Sign up using your XIM email (${ALLOWED_DOMAINS.join(" or ")}).`,
      errorType: ValidationErrors.INVALID_DOMAIN,
    };
  },

  /**
   * Minimum length validation
   * @param {number} min - Minimum length required
   * @returns {function} Validator function
   */
  minLength: (min) => (value) => {
    if (!value) return { isValid: true, error: null };

    const length = String(value).trim().length;
    const isValid = length >= min;

    return {
      isValid,
      error: isValid ? null : `Must be at least ${min} characters.`,
      errorType: ValidationErrors.MIN_LENGTH,
      meta: { min, actual: length },
    };
  },

  /**
   * Maximum length validation
   * @param {number} max - Maximum length allowed
   * @returns {function} Validator function
   */
  maxLength: (max) => (value) => {
    if (!value) return { isValid: true, error: null };

    const length = String(value).trim().length;
    const isValid = length <= max;

    return {
      isValid,
      error: isValid ? null : `Must be no more than ${max} characters.`,
      errorType: ValidationErrors.MAX_LENGTH,
      meta: { max, actual: length },
    };
  },

  /**
   * Password strength validation
   * Requires mix of letters, numbers, and symbols
   * @returns {function} Validator function
   */
  passwordStrength: () => (value) => {
    if (!value) return { isValid: true, error: null };

    const hasLetters = /[a-zA-Z]/.test(value);
    const hasNumbers = /\d/.test(value);
    const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

    const strength = [hasLetters, hasNumbers, hasSymbols].filter(Boolean).length;
    const isValid = strength >= 2; // At least 2 out of 3

    return {
      isValid,
      error: isValid ? null : "Mix letters, numbers, and symbols for stronger security.",
      errorType: ValidationErrors.PASSWORD_WEAK,
      meta: { strength, maxStrength: 3 },
    };
  },

  /**
   * Password field matching (for confirmation)
   * @param {string} targetValue - The value to match against
   * @returns {function} Validator function
   */
  matches: (targetValue) => (value) => {
    const match = value === targetValue;

    return {
      isValid: match,
      error: match ? null : "Passwords do not match.",
      errorType: ValidationErrors.PASSWORD_MISMATCH,
    };
  },

  /**
   * URL format validation
   * @returns {function} Validator function
   */
  url: () => (value) => {
    if (!value) return { isValid: true, error: null };

    try {
      new URL(value);
      return { isValid: true, error: null };
    } catch {
      return {
        isValid: false,
        error: "Please enter a valid URL.",
        errorType: ValidationErrors.INVALID_URL,
      };
    }
  },

  /**
   * Pattern matching validation (regex)
   * @param {RegExp} pattern - Pattern to match
   * @param {string} message - Custom error message
   * @returns {function} Validator function
   */
  pattern: (pattern, message = "Invalid format.") => (value) => {
    if (!value) return { isValid: true, error: null };

    const isValid = pattern.test(value);

    return {
      isValid,
      error: isValid ? null : message,
      errorType: ValidationErrors.PATTERN,
    };
  },
};

/**
 * Compose multiple validators for a field
 * Returns the first error encountered, or null if all pass
 * 
 * @param {function[]} validators - Array of validator functions
 * @returns {function} Combined validator function
 */
export const composeValidators = (...validators) => (value) => {
  for (const validator of validators) {
    const result = validator(value);
    if (!result.isValid) {
      return result;
    }
  }

  return { isValid: true, error: null };
};

/**
 * Real-time validation state manager
 * Tracks field-level errors and touched state
 * 
 * @class FieldValidator
 */
export class FieldValidator {
  constructor(validators = []) {
    this.validators = validators;
    this.touched = false;
    this.dirty = false;
    this.error = null;
    this.errorType = null;
    this.meta = null;
  }

  /**
   * Validate a value
   * @param {*} value - Value to validate
   * @returns {boolean} Whether validation passed
   */
  validate(value) {
    const result = composeValidators(...this.validators)(value);
    this.error = result.error;
    this.errorType = result.errorType;
    this.meta = result.meta || null;
    return result.isValid;
  }

  /**
   * Mark field as touched (user has interacted with it)
   */
  touch() {
    this.touched = true;
  }

  /**
   * Mark field as dirty (value has changed)
   */
  markDirty() {
    this.dirty = true;
  }

  /**
   * Check if field should show error
   * (Only show errors after user has interacted or dirty state)
   * @returns {boolean}
   */
  shouldShowError() {
    return (this.touched || this.dirty) && this.error !== null;
  }

  /**
   * Reset field state
   */
  reset() {
    this.touched = false;
    this.dirty = false;
    this.error = null;
    this.errorType = null;
    this.meta = null;
  }
}

/**
 * Input sanitization utilities
 */
export const Sanitize = {
  /**
   * Trim whitespace and collapse multiple spaces
   */
  trim: (value) => {
    if (typeof value !== "string") return value;
    return value.trim().replace(/\s+/g, " ");
  },

  /**
   * Convert email to lowercase and trim
   */
  email: (value) => {
    if (typeof value !== "string") return value;
    return value.toLowerCase().trim();
  },

  /**
   * Remove leading/trailing whitespace
   */
  whitespace: (value) => {
    if (typeof value !== "string") return value;
    return value.trim();
  },

  /**
   * Remove any non-alphanumeric characters except hyphens
   */
  alphanumeric: (value) => {
    if (typeof value !== "string") return value;
    return value.replace(/[^a-zA-Z0-9-]/g, "");
  },
};

/**
 * Password strength indicator
 * Returns strength level (0-3) and visual metadata
 * 
 * @param {string} password - Password to evaluate
 * @returns {object} Strength data
 */
export const getPasswordStrength = (password) => {
  if (!password) {
    return {
      level: 0,
      label: "Enter a password",
      color: "var(--color-fog-grey)",
      percentage: 0,
    };
  }

  let strength = 0;

  // Length
  if (password.length >= 6) strength++;
  if (password.length >= 12) strength++;

  // Complexity
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;

  // Cap at 3 for visual representation
  const level = Math.min(Math.ceil(strength / 2), 3);

  const levels = {
    0: { label: "Enter a password", color: "var(--color-fog-grey)", percentage: 0 },
    1: { label: "Weak", color: "#f87171", percentage: 33 }, // red-400
    2: { label: "Good", color: "#fbbf24", percentage: 66 }, // amber-400
    3: { label: "Strong", color: "var(--color-neon-lime)", percentage: 100 },
  };

  return { level, ...levels[level] };
};
