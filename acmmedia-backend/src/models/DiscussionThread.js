/**
 * DiscussionThread Model
 *
 * Represents a discussion thread within the community discussions feature.
 * Replies are embedded as subdocuments for efficient retrieval.
 *
 * @module models/DiscussionThread
 */

const mongoose = require("mongoose");

const ReplySchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const DiscussionThreadSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    author: {
      type: String,
    },
    replies: [ReplySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("DiscussionThread", DiscussionThreadSchema);
