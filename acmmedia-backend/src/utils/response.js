/**
 * Standardized API Response Utilities
 * 
 * Provides consistent response formatting across all API endpoints.
 * Ensures frontend can reliably parse success and error responses.
 * 
 * @module utils/response
 */

/**
 * Sends a successful JSON response.
 * 
 * @param {object} res - Express response object
 * @param {*} data - Response payload
 * @param {number} [statusCode=200] - HTTP status code
 */
const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json(data);
};

/**
 * Sends a success response with a message string.
 * 
 * @param {object} res - Express response object
 * @param {string} msg - Success message
 * @param {number} [statusCode=200] - HTTP status code
 */
const sendMessage = (res, msg, statusCode = 200) => {
  res.status(statusCode).json({ msg });
};

module.exports = { sendSuccess, sendMessage };
