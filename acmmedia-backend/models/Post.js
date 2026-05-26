const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Post", PostSchema);
