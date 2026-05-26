const router = require("express").Router();
const Forum = require("../models/Forum");
const auth = require("../middleware/auth");
const { AppError } = require("../middleware/errorHandler");
const { validateObjectIdParam, validateForumThread, validateForumReply } = require("../middleware/validators");
const { getIO, emitAnalytics } = require("../socket");

// Get all forum threads
router.get("/", async (req, res, next) => {
    try {
        const threads = await Forum.find().sort({ createdAt: -1 });
        res.json(threads);
    } catch (err) {
        return next(err);
    }
});

// Create a thread
router.post("/", auth, validateForumThread, async (req, res, next) => {
    try {
        const newThread = new Forum({
            ...req.body,
            author: req.user.id
        });
        const thread = await newThread.save();
        res.json(thread);
    } catch (err) {
        return next(err);
    }
});

// Reply to a thread
router.post("/reply/:id", auth, validateForumReply, async (req, res, next) => {
    try {
        const thread = await Forum.findById(req.params.id);
        if (!thread) return next(new AppError(404, "Thread not found"));

        const newReply = {
            user: req.user.id,
            text: req.body.text
        };
        thread.replies.push(newReply);
        await thread.save();

        getIO().emit("forum:new-reply", {
            threadId: thread._id,
            reply: newReply
        });

        res.json(thread);
    } catch (err) {
        return next(err);
    }
});

// Delete a thread (Admin only)
router.delete("/:id", auth, validateObjectIdParam, async (req, res, next) => {
    try {
        const thread = await Forum.findById(req.params.id);
        if (!thread) return next(new AppError(404, "Thread not found"));

        if (req.user.role !== 'admin') {
            return next(new AppError(403, "Access denied"));
        }

        await thread.deleteOne();

        emitAnalytics();

        res.json({ msg: "Thread removed" });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
