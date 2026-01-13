const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

// Get Platform Stats
router.get("/stats", auth, role('admin'), async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const postCount = await Post.countDocuments();
        const commentCount = await Comment.countDocuments();
        const adminCount = await User.countDocuments({ role: 'admin' });

        // Calculate total likes
        const posts = await Post.find();
        const likeCount = posts.reduce((acc, post) => acc + (post.likes ? post.likes.length : 0), 0);

        res.json({
            userCount,
            postCount,
            commentCount,
            adminCount,
            likeCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
