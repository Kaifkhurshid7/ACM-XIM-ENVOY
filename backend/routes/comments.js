const router = require("express").Router();
const Comment = require("../models/Comment");
const auth = require("../middleware/auth");

// Get all comments for a post
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

// Add a comment
router.post("/", auth, async (req, res) => {
    try {
        const newComment = new Comment({
            postId: req.body.postId,
            user: req.user.id,
            text: req.body.text
        });
        const comment = await newComment.save();
        // Populate user details for immediate display on frontend
        await comment.populate("user", "name");
        res.json(comment);
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

// Delete a comment (Admin only)
router.delete("/:id", auth, require("../middleware/role")('admin'), async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ msg: "Comment not found" });

        await comment.deleteOne();
        res.json({ msg: "Comment removed" });
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
