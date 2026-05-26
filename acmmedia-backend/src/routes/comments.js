/**
 * Comments Routes
 * 
 * Manages user comments on posts with pagination support.
 * Uses compound index (postId + createdAt) for efficient queries.
 * 
 * Endpoints:
 * - GET    /:postId - Get comments for a post with pagination (public)
 * - POST   /        - Add a comment (authenticated)
 * - DELETE /:id     - Delete a comment (admin only)
 * 
 * @module routes/comments
 */

const router = require("express").Router();
const { Comment } = require("../models");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const { emitAnalytics } = require("../socket");
const { ROLES } = require("../constants");
const { parsePagination, paginatedResponse } = require("../utils/pagination");

/**
 * Get all comments for a specific post with pagination.
 * Populates user name for display. Uses compound index for performance.
 */
router.get("/:postId", async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, { limit: 30 });
    const filter = { postId: req.params.postId };

    const [comments, total] = await Promise.all([
      Comment.find(filter)
        .populate("user", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments(filter),
    ]);

    res.json(paginatedResponse(comments, total, page, limit));
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * Add a comment to a post.
 * Returns the populated comment for immediate frontend display.
 */
router.post("/", auth, async (req, res) => {
  try {
    const newComment = new Comment({
      postId: req.body.postId,
      user: req.user.id,
      text: req.body.text,
    });

    const comment = await newComment.save();
    await comment.populate("user", "name avatar");

    emitAnalytics();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/** Delete a comment - restricted to admin users */
router.delete("/:id", auth, role(ROLES.ADMIN), async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ msg: "Comment not found" });

    await comment.deleteOne();
    emitAnalytics();
    res.json({ msg: "Comment removed" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
