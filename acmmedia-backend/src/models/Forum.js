/**
 * Forum Thread Model
 * 
 * Represents a discussion thread in the community forum.
 * Any authenticated user can create threads; replies are embedded
 * as subdocuments for efficient retrieval.
 * 
 * Design Decision: Replies are embedded (not referenced) because
 * forum threads typically have a manageable number of replies,
 * and this avoids additional queries when loading thread details.
 * 
 * @module models/Forum
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

const ForumSchema = new mongoose.Schema(
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

module.exports = mongoose.model("Forum", ForumSchema);
