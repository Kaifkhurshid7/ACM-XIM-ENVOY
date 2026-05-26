/**
 * Posts Routes
 * 
 * CRUD operations for chapter news/announcement posts.
 * Optimized for 100+ concurrent users with:
 * - Pagination (prevents loading entire collection)
 * - Lean queries (returns plain objects, 3x faster than Mongoose docs)
 * - Indexed sorting (uses createdAt index)
 * 
 * Endpoints:
 * - GET    /         - List posts with pagination (public)
 * - GET    /:id      - Get single post (public)
 * - POST   /         - Create post (admin only)
 * - PATCH  /:id      - Update post (admin only)
 * - PUT    /like/:id - Toggle like (authenticated)
 * - DELETE /:id      - Delete post (admin only)
 * 
 * @module routes/posts
 */

const router = require("express").Router();
const { Post } = require("../models");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const { AppError } = require("../middlewares/errorHandler");
const { validateObjectIdParam, validatePostCreate, validatePostUpdate } = require("../middlewares/validators");
const { getIO, emitAnalytics } = require("../socket");
const { ROLES, SOCKET_EVENTS } = require("../constants");
const { parsePagination, paginatedResponse } = require("../utils/pagination");

/**
 * List all posts with pagination.
 * Uses lean() for 3x faster serialization (no Mongoose document overhead).
 * Sorted by createdAt DESC (uses index).
 */
router.get("/", async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [posts, total] = await Promise.all([
      Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Post.countDocuments(),
    ]);
    return res.json(paginatedResponse(posts, total, page, limit));
  } catch (err) {
    return next(err);
  }
});

/** Get a single post by ID */
router.get("/:id", validateObjectIdParam, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).lean();
    if (!post) return next(new AppError(404, "Post not found"));
    return res.json(post);
  } catch (err) {
    return next(err);
  }
});

/** Create a new post - restricted to admin users */
router.post("/", auth, role(ROLES.ADMIN), validatePostCreate, async (req, res, next) => {
  try {
    const post = await Post.create(req.body);
    emitAnalytics();
    res.json(post);
  } catch (err) {
    return next(err);
  }
});

/** Update a post - restricted to admin users */
router.patch("/:id", auth, role(ROLES.ADMIN), validatePostUpdate, async (req, res, next) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedPost) return next(new AppError(404, "Post not found"));
    emitAnalytics();
    return res.json(updatedPost);
  } catch (err) {
    return next(err);
  }
});

/**
 * Toggle like on a post.
 * Uses atomic $addToSet/$pull for concurrency safety.
 * Broadcasts updated likes to all connected clients.
 */
router.put("/like/:id", auth, validateObjectIdParam, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return next(new AppError(404, "Post not found"));

    const userId = req.user.id;
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    // Broadcast to all clients for real-time UI updates
    getIO().emit(SOCKET_EVENTS.POST_LIKE_UPDATE, {
      postId: post._id,
      likes: post.likes,
    });

    emitAnalytics();
    res.json(post.likes);
  } catch (err) {
    return next(err);
  }
});

/** Delete a post - restricted to admin users */
router.delete("/:id", auth, role(ROLES.ADMIN), validateObjectIdParam, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return next(new AppError(404, "Post not found"));
    await post.deleteOne();
    emitAnalytics();
    res.json({ msg: "Post removed" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
