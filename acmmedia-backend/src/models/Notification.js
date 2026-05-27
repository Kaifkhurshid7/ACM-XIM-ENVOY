/**
 * Notification Model
 *
 * Lightweight notification queue for discussion engagement events. Keeping
 * notifications separate from discussions lets the feed remain fast while the
 * user inbox can evolve independently.
 *
 * @module models/Notification
 */

const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    type: {
      type: String,
      enum: ["reply", "mention", "like", "accepted-answer", "announcement"],
      required: true,
      index: true,
    },
    discussion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiscussionThread",
      default: null,
    },
    reply: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiscussionReply",
      default: null,
    },
    message: {
      type: String,
      required: true,
      maxlength: 240,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", NotificationSchema);
