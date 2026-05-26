/**
 * Comment Model
 * 
 * Represents a user comment on a post. Comments are linked to both
 * the parent post (via postId) and the commenting user (via user ref).
 * 
 * The user field is a reference to enable population of user details
 * (name) when displaying comments on the frontend.
 * 
 * @module models/Comment
 */

const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

module.exports = mongoose.model("Comment", CommentSchema);
