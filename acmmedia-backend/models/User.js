const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "member" },
  isAcmMember: { type: Boolean, default: true },
  acmId: { type: String, default: null }
});

module.exports = mongoose.model("User", UserSchema);
