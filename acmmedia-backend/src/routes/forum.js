/**
 * Forum Routes
 * 
 * Community discussion forum with threaded conversations.
 * Optimized with pagination and lean queries for scalability.
 * 
 * Endpoints:
 * - GET    /          - List threads with pagination (public)
 * - POST   /          - Create a thread (authenticated)
 * - POST   /reply/:id - Reply to a thread (authenticated)
 * - DELETE /:id       - Delete a thread (admin only)
 * 
 * @module routes/forum
 */

const router = require("express").Router();
const { DiscussionThread } = require("../models");
const auth = require("../middlewares/auth");
const { AppError } = require("../middlewares/errorHandler");
const { validateObjectIdParam, validateForumThread, validateForumReply } = require("../middlewares/validators");
const { getIO, emitAnalytics } = require("../socket");
const { ROLES, SOCKET_EVENTS } = require("../constants");
const { parsePagination, paginatedResponse } = require("../utils/pagination");

/** List all discussion threads with pagination */
router.get("/", async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [threads, total] = await Promise.all([
      DiscussionThread.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      DiscussionThread.countDocuments(),
    ]);
    return res.json(paginatedResponse(threads, total, page, limit));
  } catch (err) {
    return next(err);
  }
});

/** Create a new discussion thread */
router.post("/", auth, validateForumThread, async (req, res, next) => {
  try {
    const newThread = new DiscussionThread({
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
 * Broadcasts the new reply to all connected clients for real-time updates.
 */
router.post("/reply/:id", auth, validateForumReply, async (req, res, next) => {
  try {
    const thread = await DiscussionThread.findById(req.params.id);
    if (!thread) return next(new AppError(404, "Thread not found"));

    const newReply = { user: req.user.id, text: req.body.text };
    thread.replies.push(newReply);
    await thread.save();

    getIO().emit(SOCKET_EVENTS.DISCUSSION_NEW_REPLY, {
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
    const thread = await DiscussionThread.findById(req.params.id);
    if (!thread) return next(new AppError(404, "Thread not found"));

    if (req.user.role !== ROLES.ADMIN) {
      return next(new AppError(403, "Access denied"));
    }

    await thread.deleteOne();
    emitAnalytics();
    res.json({ msg: "Discussion removed" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
