/**
 * API Response Utilities
 * 
 * Helper functions for safely extracting data from API responses.
 * Handles various response shapes that may come from the backend
 * (direct arrays, wrapped objects, nested data, etc.)
 * 
 * These utilities provide defensive parsing to prevent runtime errors
 * when the API response format varies or is unexpected.
 * 
 * @module utils/api
 */

/**
 * Extracts an array from an API response payload.
 * Tries the payload directly, then checks nested keys.
 * 
 * @param {*} payload - Raw API response data
 * @param {string[]} keys - Possible keys where the array might be nested
 * @returns {Array} The extracted array, or empty array if not found
 */
export const extractArray = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload;

  for (const key of keys) {
    const value = payload?.[key];
    if (Array.isArray(value)) return value;
  }

  return [];
};

/**
 * Extracts an object from an API response payload.
 * Useful when the backend wraps data in { user: {...} } or { data: {...} }.
 * 
 * @param {*} payload - Raw API response data
 * @param {string[]} keys - Possible keys where the object might be nested
 * @returns {object|null} The extracted object, or null if not found
 */
export const extractObject = (payload, keys = []) => {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    for (const key of keys) {
      const value = payload[key];
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return value;
      }
    }
    return payload;
  }
  return null;
};

/**
 * Extracts a JWT token from various response formats.
 * Checks common token field names used by auth endpoints.
 * 
 * @param {object} payload - Login response data
 * @returns {string|null} The JWT token string, or null
 */
export const extractToken = (payload) =>
  payload?.token ||
  payload?.data?.token ||
  payload?.accessToken ||
  payload?.jwt ||
  null;

/**
 * Extracts a user-friendly error message from an API error.
 * Handles axios error response shapes and falls back gracefully.
 * 
 * @param {Error} error - Caught error (typically from axios)
 * @param {string} fallback - Default message if extraction fails
 * @returns {string} Human-readable error message
 */
export const extractErrorMessage = (error, fallback = "Something went wrong.") =>
  error?.response?.data?.msg ||
  error?.response?.data?.message ||
  error?.message ||
  fallback;
