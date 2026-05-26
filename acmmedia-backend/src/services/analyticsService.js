/**
 * Analytics Service
 * 
 * Aggregates platform-wide statistics for the admin dashboard.
 * Uses MongoDB aggregation pipelines for efficient computation
 * of metrics like total likes across all posts.
 * 
 * These analytics are emitted via Socket.IO to connected admin
 * clients whenever content changes occur (new posts, likes, etc.)
 * 
 * @module services/analyticsService
 */

const { User, Post, Comment } = require("../models");

/**
 * Computes platform-wide engagement metrics.
 * 
 * @returns {object|null} Analytics object with user, post, comment, and like counts
 */
const getAnalytics = async () => {
  try {
    // Execute all count queries in parallel for performance
    const [userCount, postCount, commentCount, likesResult] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Comment.countDocuments(),
      Post.aggregate([
        {
          $group: {
            _id: null,
            totalLikes: { $sum: { $size: { $ifNull: ["$likes", []] } } },
          },
        },
      ]),
    ]);

    const totalLikes = likesResult.length > 0 ? likesResult[0].totalLikes : 0;

    return {
      users: userCount,
      posts: postCount,
      comments: commentCount,
      likes: totalLikes,
    };
  } catch (err) {
    console.error("Error fetching analytics:", err);
    return null;
  }
};

module.exports = { getAnalytics };
