/**
 * Community Hub Routes
 *
 * Production-minded discussion APIs for ACM Connect. The feed is optimized for
 * indexed list queries, while replies are stored separately to support nested
 * conversations without creating oversized discussion documents.
 *
 * @module routes/forum
 */

const router = require("express").Router();
const mongoose = require("mongoose");
const { DiscussionThread, DiscussionReply, Notification, User } = require("../models");
const { DISCUSSION_CATEGORIES } = require("../models/DiscussionThread");
const auth = require("../middlewares/auth");
const { AppError } = require("../middlewares/errorHandler");
const {
  validateObjectIdParam,
  validateForumThread,
  validateForumReply,
  validateForumListQuery,
  validateRequest,
} = require("../middlewares/validators");
const { getIO, emitAnalytics } = require("../socket");
const { ROLES, SOCKET_EVENTS } = require("../constants");
const { parsePagination, paginatedResponse } = require("../utils/pagination");

const mentionPattern = /@([a-zA-Z0-9._-]{2,40})/g;
const validateReplyIdParam = [
  require("express-validator").param("replyId").isMongoId().withMessage("Invalid reply id format"),
  validateRequest,
];

const normalizeTags = (tags = []) =>
  [...new Set(tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean))].slice(0, 6);

const extractMentions = (text = "") =>
  [...new Set([...text.matchAll(mentionPattern)].map((match) => match[1].toLowerCase()))];

const authorSnapshot = (user) => ({
  name: user?.name || "ACM Member",
  role: user?.role || ROLES.MEMBER,
  avatar: user?.avatar || null,
});

const serializeDiscussion = (discussion, currentUserId) => {
  const doc = discussion.toObject ? discussion.toObject({ virtuals: true }) : discussion;
  const likes = (doc.likes || []).map(String);
  return {
    ...doc,
    likeCount: likes.length,
    isLiked: currentUserId ? likes.includes(String(currentUserId)) : false,
    description: doc.content,
  };
};

const serializeReply = (reply, currentUserId) => {
  const doc = reply.toObject ? reply.toObject({ virtuals: true }) : reply;
  const likes = (doc.likes || []).map(String);
  return {
    ...doc,
    likeCount: likes.length,
    isLiked: currentUserId ? likes.includes(String(currentUserId)) : false,
    text: doc.content,
  };
};

const buildReplyTree = (flatReplies, currentUserId) => {
  const byId = new Map();
  const roots = [];

  flatReplies.forEach((reply) => {
    const item = { ...serializeReply(reply, currentUserId), children: [] };
    byId.set(String(item._id), item);
  });

  byId.forEach((reply) => {
    const parentId = reply.parentReply ? String(reply.parentReply) : null;
    if (parentId && byId.has(parentId)) {
      byId.get(parentId).children.push(reply);
    } else {
      roots.push(reply);
    }
  });

  return roots;
};

const createNotification = async ({ recipient, actor, type, discussion, reply, message }) => {
  if (!recipient || String(recipient) === String(actor)) return null;
  const notification = await Notification.create({ recipient, actor, type, discussion, reply, message });
  getIO().to(`user:${recipient}`).emit(SOCKET_EVENTS.NOTIFICATION_CREATED, notification);
  return notification;
};

const getSortStage = (sort) => {
  if (sort === "latest") return { createdAt: -1 };
  if (sort === "active") return { lastActivityAt: -1 };
  if (sort === "unanswered") return { replyCount: 1, lastActivityAt: -1 };
  if (sort === "solved") return { status: -1, lastActivityAt: -1 };
  return { pinned: -1, replyCount: -1, likes: -1, views: -1, lastActivityAt: -1 };
};

/** Feed list with search, filters, and pagination */
router.get("/", validateForumListQuery, async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, category, tag, sort = "trending" } = req.query;
    const filter = {};

    if (category && category !== "All") filter.category = category;
    if (tag) filter.tags = String(tag).toLowerCase();
    if (sort === "unanswered") filter.replyCount = 0;
    if (sort === "solved") filter.status = "resolved";
    if (search) filter.$text = { $search: search };

    const projection = search ? { score: { $meta: "textScore" } } : {};
    const sortStage = search ? { score: { $meta: "textScore" }, ...getSortStage(sort) } : getSortStage(sort);

    const [threads, total, topContributors] = await Promise.all([
      DiscussionThread.find(filter, projection)
        .sort(sortStage)
        .skip(skip)
        .limit(limit)
        .populate("author", "name avatar role department year")
        .lean({ virtuals: true }),
      DiscussionThread.countDocuments(filter),
      DiscussionReply.aggregate([
        { $match: { removed: false } },
        { $group: { _id: "$author", replies: { $sum: 1 }, helpful: { $sum: { $cond: ["$official", 1, 0] } } } },
        { $sort: { helpful: -1, replies: -1 } },
        { $limit: 5 },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
        { $unwind: "$user" },
        { $project: { replies: 1, helpful: 1, "user.name": 1, "user.avatar": 1, "user.role": 1 } },
      ]),
    ]);

    const currentUserId = req.header("Authorization") ? null : null;
    const data = threads.map((thread) => serializeDiscussion(thread, currentUserId));

    return res.json({
      ...paginatedResponse(data, total, page, limit),
      meta: {
        categories: DISCUSSION_CATEGORIES,
        sort,
        topContributors,
      },
    });
  } catch (err) {
    return next(err);
  }
});

/** Community statistics for the right rail */
router.get("/meta", async (req, res, next) => {
  try {
    const [discussions, replies, solved, unanswered] = await Promise.all([
      DiscussionThread.countDocuments(),
      DiscussionReply.countDocuments({ removed: false }),
      DiscussionThread.countDocuments({ status: "resolved" }),
      DiscussionThread.countDocuments({ replyCount: 0 }),
    ]);

    res.json({
      categories: DISCUSSION_CATEGORIES,
      stats: { discussions, replies, solved, unanswered },
    });
  } catch (err) {
    next(err);
  }
});

/** Create a new discussion */
router.post("/", auth, validateForumThread, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("name avatar role department year").lean();
    if (!user) return next(new AppError(404, "User not found"));

    const thread = await DiscussionThread.create({
      title: req.body.title,
      content: req.body.content || req.body.description,
      category: req.body.category || "General Discussion",
      tags: normalizeTags(req.body.tags),
      author: req.user.id,
      authorSnapshot: authorSnapshot(user),
      announcement: req.body.announcement && req.user.role === ROLES.ADMIN,
      pinned: req.body.pinned && req.user.role === ROLES.ADMIN,
    });

    const populated = await DiscussionThread.findById(thread._id)
      .populate("author", "name avatar role department year")
      .lean({ virtuals: true });

    getIO().to("discussions").emit(SOCKET_EVENTS.DISCUSSION_CREATED, serializeDiscussion(populated, req.user.id));
    emitAnalytics();
    res.status(201).json(serializeDiscussion(populated, req.user.id));
  } catch (err) {
    return next(err);
  }
});

/** Load a single discussion and its threaded replies */
router.get("/:id", validateObjectIdParam, async (req, res, next) => {
  try {
    const [thread] = await Promise.all([
      DiscussionThread.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
        .populate("author", "name avatar role department year")
        .lean({ virtuals: true }),
    ]);
    if (!thread) return next(new AppError(404, "Discussion not found"));

    const replies = await DiscussionReply.find({ discussion: req.params.id })
      .sort({ createdAt: 1 })
      .populate("author", "name avatar role department year")
      .lean({ virtuals: true });

    res.json({
      discussion: serializeDiscussion(thread),
      replies: buildReplyTree(replies),
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * Add a reply or nested reply.
 * Parent validation is kept in the write path so a forged parent id cannot
 * attach replies across discussions.
 */
router.post("/:id/replies", auth, validateForumReply, async (req, res, next) => {
  try {
    const thread = await DiscussionThread.findById(req.params.id);
    if (!thread) return next(new AppError(404, "Discussion not found"));
    if (thread.locked || thread.status === "locked") return next(new AppError(403, "Discussion is locked"));

    const user = await User.findById(req.user.id).select("name avatar role department year").lean();
    if (!user) return next(new AppError(404, "User not found"));

    let parent = null;
    if (req.body.parentReply) {
      parent = await DiscussionReply.findOne({ _id: req.body.parentReply, discussion: thread._id }).lean();
      if (!parent) return next(new AppError(404, "Parent reply not found"));
    }

    const content = req.body.content || req.body.text;
    const reply = await DiscussionReply.create({
      discussion: thread._id,
      parentReply: parent?._id || null,
      path: parent ? [...(parent.path || []), parent._id] : [],
      depth: parent ? Math.min((parent.depth || 0) + 1, 6) : 0,
      author: req.user.id,
      authorSnapshot: authorSnapshot(user),
      content,
      quotedReply: req.body.quotedReply || null,
      mentions: extractMentions(content),
    });

    await DiscussionThread.updateOne(
      { _id: thread._id },
      { $inc: { replyCount: 1 }, $set: { lastActivityAt: new Date() } }
    );

    const populated = await DiscussionReply.findById(reply._id)
      .populate("author", "name avatar role department year")
      .lean({ virtuals: true });

    await createNotification({
      recipient: thread.author,
      actor: req.user.id,
      type: "reply",
      discussion: thread._id,
      reply: reply._id,
      message: `${user.name} replied to your discussion`,
    });

    getIO().to(`discussion:${thread._id}`).emit(SOCKET_EVENTS.DISCUSSION_NEW_REPLY, {
      discussionId: thread._id,
      reply: serializeReply(populated, req.user.id),
    });
    getIO().to("discussions").emit(SOCKET_EVENTS.DISCUSSION_UPDATED, {
      discussionId: thread._id,
      replyCountDelta: 1,
      lastActivityAt: new Date(),
    });
    emitAnalytics();

    res.status(201).json(serializeReply(populated, req.user.id));
  } catch (err) {
    return next(err);
  }
});

/** Backward-compatible reply endpoint used by older clients */
router.post("/reply/:id", auth, validateForumReply, async (req, res, next) => {
  req.url = `/${req.params.id}/replies`;
  return router.handle(req, res, next);
});

/** Toggle discussion upvote */
router.post("/:id/like", auth, validateObjectIdParam, async (req, res, next) => {
  try {
    const thread = await DiscussionThread.findById(req.params.id).select("likes author title");
    if (!thread) return next(new AppError(404, "Discussion not found"));

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const liked = thread.likes.some((id) => String(id) === String(userId));
    const update = liked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } };
    const updated = await DiscussionThread.findByIdAndUpdate(req.params.id, update, { new: true }).lean();

    if (!liked) {
      await createNotification({
        recipient: thread.author,
        actor: req.user.id,
        type: "like",
        discussion: thread._id,
        message: "Someone found your discussion helpful",
      });
    }

    const payload = { discussionId: thread._id, likeCount: updated.likes.length, isLiked: !liked };
    getIO().to("discussions").emit(SOCKET_EVENTS.DISCUSSION_LIKE_UPDATE, payload);
    getIO().to(`discussion:${thread._id}`).emit(SOCKET_EVENTS.DISCUSSION_LIKE_UPDATE, payload);
    res.json(payload);
  } catch (err) {
    return next(err);
  }
});

/** Toggle reply upvote */
router.post("/replies/:replyId/like", auth, validateReplyIdParam, async (req, res, next) => {
  try {
    const reply = await DiscussionReply.findById(req.params.replyId).select("likes author discussion");
    if (!reply) return next(new AppError(404, "Reply not found"));

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const liked = reply.likes.some((id) => String(id) === String(userId));
    const update = liked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } };
    const updated = await DiscussionReply.findByIdAndUpdate(req.params.replyId, update, { new: true }).lean();

    const payload = {
      discussionId: reply.discussion,
      replyId: reply._id,
      likeCount: updated.likes.length,
      isLiked: !liked,
    };
    getIO().to(`discussion:${reply.discussion}`).emit(SOCKET_EVENTS.DISCUSSION_REPLY_LIKE_UPDATE, payload);
    res.json(payload);
  } catch (err) {
    return next(err);
  }
});

/** Admin/moderator controls: pin, lock, announcement, and solved answer flow */
router.patch("/:id/moderation", auth, validateObjectIdParam, async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.ADMIN) return next(new AppError(403, "Access denied"));

    const allowed = ["pinned", "announcement", "locked", "status", "solvedReply"];
    const update = {};
    allowed.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) update[field] = req.body[field];
    });

    if (update.solvedReply) {
      const reply = await DiscussionReply.findOne({ _id: update.solvedReply, discussion: req.params.id });
      if (!reply) return next(new AppError(404, "Solved reply not found"));
      reply.official = true;
      await reply.save();
      update.status = "resolved";
      update.locked = false;
      await createNotification({
        recipient: reply.author,
        actor: req.user.id,
        type: "accepted-answer",
        discussion: req.params.id,
        reply: reply._id,
        message: "Your answer was marked as official",
      });
    }

    const thread = await DiscussionThread.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate("author", "name avatar role department year")
      .lean({ virtuals: true });
    if (!thread) return next(new AppError(404, "Discussion not found"));

    getIO().to("discussions").emit(SOCKET_EVENTS.DISCUSSION_UPDATED, serializeDiscussion(thread, req.user.id));
    getIO().to(`discussion:${thread._id}`).emit(SOCKET_EVENTS.DISCUSSION_UPDATED, serializeDiscussion(thread, req.user.id));
    res.json(serializeDiscussion(thread, req.user.id));
  } catch (err) {
    return next(err);
  }
});

/** Delete discussion - admin moderation action */
router.delete("/:id", auth, validateObjectIdParam, async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.ADMIN) return next(new AppError(403, "Access denied"));
    const thread = await DiscussionThread.findById(req.params.id);
    if (!thread) return next(new AppError(404, "Discussion not found"));

    await Promise.all([
      DiscussionReply.deleteMany({ discussion: thread._id }),
      thread.deleteOne(),
    ]);
    getIO().to("discussions").emit(SOCKET_EVENTS.DISCUSSION_UPDATED, { discussionId: thread._id, deleted: true });
    emitAnalytics();
    res.json({ msg: "Discussion removed" });
  } catch (err) {
    return next(err);
  }
});

/** Soft-remove a reply so thread context remains readable after moderation */
router.delete("/replies/:replyId", auth, validateReplyIdParam, async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.ADMIN) return next(new AppError(403, "Access denied"));
    const reply = await DiscussionReply.findByIdAndUpdate(
      req.params.replyId,
      { removed: true, removedBy: req.user.id, content: "Removed by moderator" },
      { new: true }
    );
    if (!reply) return next(new AppError(404, "Reply not found"));

    getIO().to(`discussion:${reply.discussion}`).emit(SOCKET_EVENTS.DISCUSSION_UPDATED, {
      discussionId: reply.discussion,
      replyId: reply._id,
      removed: true,
    });
    res.json({ msg: "Reply removed" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
