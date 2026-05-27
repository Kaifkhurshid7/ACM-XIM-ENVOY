/**
 * DiscussionThread Model
 *
 * Stores the feed-level discussion document. Replies live in DiscussionReply
 * so heavily active threads do not grow into large MongoDB documents.
 *
 * @module models/DiscussionThread
 */

const mongoose = require("mongoose");

const DISCUSSION_CATEGORIES = Object.freeze([
  "Web Development",
  "AI/ML",
  "Competitive Programming",
  "Placement Preparation",
  "Hackathons",
  "General Discussion",
  "College Queries",
  "ACM Events",
  "Research",
  "Open Source",
]);

const AuthorSnapshotSchema = new mongoose.Schema(
  {
    name: { type: String, default: "ACM Member" },
    role: { type: String, default: "member" },
    avatar: { type: String, default: null },
  },
  { _id: false }
);

const DiscussionThreadSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },
    category: {
      type: String,
      enum: DISCUSSION_CATEGORIES,
      default: "General Discussion",
      index: true,
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 30,
    }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    authorSnapshot: AuthorSnapshotSchema,
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    replyCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    status: {
      type: String,
      enum: ["open", "resolved", "locked"],
      default: "open",
      index: true,
    },
    solvedReply: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiscussionReply",
      default: null,
    },
    pinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    announcement: {
      type: Boolean,
      default: false,
    },
    locked: {
      type: Boolean,
      default: false,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

DiscussionThreadSchema.index({ title: "text", content: "text", tags: "text" });
DiscussionThreadSchema.index({ pinned: -1, lastActivityAt: -1 });
DiscussionThreadSchema.index({ category: 1, lastActivityAt: -1 });
DiscussionThreadSchema.index({ status: 1, replyCount: 1, lastActivityAt: -1 });

DiscussionThreadSchema.virtual("likeCount").get(function getLikeCount() {
  return this.likes ? this.likes.length : 0;
});

DiscussionThreadSchema.set("toJSON", { virtuals: true });
DiscussionThreadSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("DiscussionThread", DiscussionThreadSchema);
module.exports.DISCUSSION_CATEGORIES = DISCUSSION_CATEGORIES;
