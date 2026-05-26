/**
 * User Model
 * 
 * Represents a registered platform user (student member or admin).
 * Stores authentication credentials and ACM membership metadata.
 * 
 * Roles:
 * - "member": Standard student chapter member (default)
 * - "admin": Chapter coordinator with elevated privileges
 * 
 * @module models/User
 */

const mongoose = require("mongoose");
const { ROLES } = require("../constants");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.MEMBER,
    },
    isAcmMember: {
      type: Boolean,
      default: true,
    },
    acmId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
