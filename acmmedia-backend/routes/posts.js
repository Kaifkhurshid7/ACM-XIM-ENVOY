const router = require("express").Router();
const Post = require("../models/Post");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const { AppError } = require("../middleware/errorHandler");
const { validateObjectIdParam, validatePostCreate, validatePostUpdate } = require("../middleware/validators");
const { getIO, emitAnalytics } = require("../socket");

// Only admins can create posts
router.post("/", auth, role('admin'), validatePostCreate, async (req, res, next) => {
  try {
    const post = await Post.create(req.body);
    emitAnalytics();
    res.json(post);
  } catch (err) {
    return next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    return res.json(posts);
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", validateObjectIdParam, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return next(new AppError(404, "Post not found"));
    return res.json(post);
  } catch (err) {
    return next(err);
  }
});

router.patch("/:id", auth, role('admin'), validatePostUpdate, async (req, res, next) => {
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

// Toggle like (add if not liked, remove if already liked)
router.put("/like/:id", auth, validateObjectIdParam, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return next(new AppError(404, "Post not found"));

    if (post.likes.includes(req.user.id)) {
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();

    getIO().emit("post:like-update", {
      postId: post._id,
      likes: post.likes
    });

    emitAnalytics();

    res.json(post.likes);
  } catch (err) {
    return next(err);
  }
});

// Delete a post (Admin only)
router.delete("/:id", auth, role('admin'), validateObjectIdParam, async (req, res, next) => {
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
