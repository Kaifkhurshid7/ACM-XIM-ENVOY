/**
 * User Model
 * 
 * Represents a registered platform user (student member or admin).
 * Stores authentication credentials, profile information, and ACM membership metadata.
 * 
 * Roles:
 * - "member": Standard student chapter member (default)
 * - "admin": Chapter coordinator with elevated privileges
 * 
 * Profile Features:
 * - Avatar image upload (stored as URL path)
 * - Bio/about section
 * - Social links (GitHub, LinkedIn)
 * - Department and year information
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
    // ─── Profile Fields ────────────────────────────────────────────────────────
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 300,
    },
    department: {
      type: String,
      default: "",
      trim: true,
    },
    year: {
      type: String,
      default: "",
      trim: true,
    },
    github: {
      type: String,
      default: "",
      trim: true,
    },
    linkedin: {
      type: String,
      default: "",
      trim: true,
    },
    // ─── ACM Membership ────────────────────────────────────────────────────────
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
