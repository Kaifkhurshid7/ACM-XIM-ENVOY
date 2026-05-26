/**
 * Pagination Utility
 * 
 * Provides standardized pagination for all list endpoints.
 * Prevents loading entire collections into memory, which is critical
 * for scalability beyond 100+ concurrent users.
 * 
 * Design:
 * - Offset-based pagination (simple, works with MongoDB skip/limit)
 * - Default page size of 20 (balances UX and performance)
 * - Maximum page size of 50 (prevents memory abuse)
 * - Returns metadata for frontend pagination controls
 * 
 * Usage in routes:
 *   const { page, limit, skip } = parsePagination(req.query);
 *   const posts = await Post.find().skip(skip).limit(limit);
 *   res.json(paginatedResponse(posts, totalCount, page, limit));
 * 
 * @module utils/pagination
 */

/**
 * Parses and validates pagination parameters from query string.
 * 
 * @param {object} query - Express req.query object
 * @param {object} [defaults] - Override default values
 * @returns {object} { page, limit, skip } - Validated pagination params
 */
const parsePagination = (query, defaults = {}) => {
  const maxLimit = defaults.maxLimit || 50;
  const defaultLimit = defaults.limit || 20;

  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  // Validate and clamp values
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Wraps data with pagination metadata for consistent API responses.
 * 
 * @param {Array} data - Array of documents for current page
 * @param {number} total - Total document count (for page calculation)
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {object} Paginated response with metadata
 */
const paginatedResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

module.exports = { parsePagination, paginatedResponse };
