/**
 * Comments Routes
 * 
 * Manages user comments on posts. Comments enable community
 * discussion beneath chapter announcements.
 * 
 * Endpoints:
 * - GET    /:postId - Get all comments for a post (public)
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

/**
 * Get all comments for a specific post.
 * Populates user name for display. Sorted newest first.
 */
router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * Add a comment to a post.
 * The commenting user is automatically set from the auth token.
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
    await comment.populate("user", "name");

    emitAnalytics();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * Delete a comment - restricted to admin users.
 * Enables content moderation by chapter coordinators.
 */
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
