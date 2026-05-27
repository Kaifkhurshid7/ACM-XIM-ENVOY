/**
 * DiscussionReply Model
 *
 * Reply documents use parentReply + materialized path fields. The parent id
 * supports direct reply-to-reply lookups, while path/depth make threaded
 * rendering cheap without recursive database reads.
 *
 * @module models/DiscussionReply
 */

const mongoose = require("mongoose");

const AuthorSnapshotSchema = new mongoose.Schema(
  {
    name: { type: String, default: "ACM Member" },
    role: { type: String, default: "member" },
    avatar: { type: String, default: null },
  },
  { _id: false }
);

const DiscussionReplySchema = new mongoose.Schema(
  {
    discussion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiscussionThread",
      required: true,
      index: true,
    },
    parentReply: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiscussionReply",
      default: null,
      index: true,
    },
    path: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiscussionReply",
    }],
    depth: {
      type: Number,
      default: 0,
      min: 0,
      max: 6,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    authorSnapshot: AuthorSnapshotSchema,
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    quotedReply: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiscussionReply",
      default: null,
    },
    mentions: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    official: {
      type: Boolean,
      default: false,
      index: true,
    },
    removed: {
      type: Boolean,
      default: false,
    },
    removedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

DiscussionReplySchema.index({ discussion: 1, createdAt: 1 });
DiscussionReplySchema.index({ discussion: 1, parentReply: 1, createdAt: 1 });

DiscussionReplySchema.virtual("likeCount").get(function getLikeCount() {
  return this.likes ? this.likes.length : 0;
});

DiscussionReplySchema.set("toJSON", { virtuals: true });
DiscussionReplySchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("DiscussionReply", DiscussionReplySchema);
