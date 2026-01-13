const mongoose = require("mongoose");

const ForumSchema = new mongoose.Schema({
  title: String,
  description: String,
  author: String,
  replies: [{ user: String, text: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Forum", ForumSchema);
