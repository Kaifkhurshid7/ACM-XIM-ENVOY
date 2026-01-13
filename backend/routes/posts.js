const router = require("express").Router();
const Post = require("../models/Post");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

// Only admins can create posts
router.post("/", auth, role('admin'), async (req, res) => {
  try {
    const post = await Post.create(req.body);
    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get("/", async (req, res) => {
  res.json(await Post.find().sort({ createdAt: -1 }));
});

// Toggle like (add if not liked, remove if already liked)
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    // Check if user already liked
    if (post.likes.includes(req.user.id)) {
      // Unlike
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
    } else {
      // Like
      post.likes.push(req.user.id);
    }

    await post.save();
    res.json(post.likes);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete a post (Admin only)
router.delete("/:id", auth, role('admin'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    await post.deleteOne();
    res.json({ msg: "Post removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
