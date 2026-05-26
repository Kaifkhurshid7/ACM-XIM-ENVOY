/**
 * Forum Routes
 * 
 * Community discussion forum with threaded conversations.
 * Any authenticated user can create threads and reply;
 * only admins can delete threads for moderation.
 * 
 * Endpoints:
 * - GET    /          - List all threads (public)
 * - POST   /          - Create a thread (authenticated)
 * - POST   /reply/:id - Reply to a thread (authenticated)
 * - DELETE /:id       - Delete a thread (admin only)
 * 
 * Real-time:
 * - New replies are broadcast via Socket.IO for live updates
 * 
 * @module routes/forum
 */

const router = require("express").Router();
const { Forum } = require("../models");
const auth = require("../middlewares/auth");
const { AppError } = require("../middlewares/errorHandler");
const { validateObjectIdParam, validateForumThread, validateForumReply } = require("../middlewares/validators");
const { getIO, emitAnalytics } = require("../socket");
const { ROLES, SOCKET_EVENTS } = require("../constants");

/** List all forum threads, sorted newest first */
router.get("/", async (req, res, next) => {
  try {
    const threads = await Forum.find().sort({ createdAt: -1 });
    res.json(threads);
  } catch (err) {
    return next(err);
  }
});

/** Create a new discussion thread */
router.post("/", auth, validateForumThread, async (req, res, next) => {
  try {
    const newThread = new Forum({
      ...req.body,
      author: req.user.id,
    });
    const thread = await newThread.save();
    res.json(thread);
  } catch (err) {
    return next(err);
  }
});

/**
 * Reply to an existing thread.
 * Replies are embedded in the thread document for efficient retrieval.
 * Broadcasts the new reply to all connected clients.
 */
router.post("/reply/:id", auth, validateForumReply, async (req, res, next) => {
  try {
    const thread = await Forum.findById(req.params.id);
    if (!thread) return next(new AppError(404, "Thread not found"));

    const newReply = {
      user: req.user.id,
      text: req.body.text,
    };
    thread.replies.push(newReply);
    await thread.save();

    // Broadcast reply for real-time forum updates
    getIO().emit(SOCKET_EVENTS.FORUM_NEW_REPLY, {
      threadId: thread._id,
      reply: newReply,
    });

    res.json(thread);
  } catch (err) {
    return next(err);
  }
});

/** Delete a thread - admin moderation action */
router.delete("/:id", auth, validateObjectIdParam, async (req, res, next) => {
  try {
    const thread = await Forum.findById(req.params.id);
    if (!thread) return next(new AppError(404, "Thread not found"));

    if (req.user.role !== ROLES.ADMIN) {
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
