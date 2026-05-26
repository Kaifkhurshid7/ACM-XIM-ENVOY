/**
 * Post Model
 * 
 * Represents an official chapter announcement or news post.
 * Only admins can create posts; all members can view and like them.
 * 
 * The likes array stores User ObjectIds to enable toggle-like behavior
 * and prevent duplicate likes from the same user.
 * 
 * @module models/Post
 */

const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      trim: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
