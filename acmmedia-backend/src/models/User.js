/**
 * User Model - Production Ready
 * 
 * Represents a registered platform user with complete profile, security, and analytics capabilities.
 * 
 * Roles:
 * - "member": Standard student chapter member (default)
 * - "admin": Chapter coordinator with elevated privileges
 * 
 * Features:
 * - Complete profile with social links and professional info
 * - Security: password reset tokens, email verification, session management
 * - Analytics: profile views, reputation, contribution score
 * - Privacy controls and notification preferences
 * - Achievement and bookmark system
 * 
 * @module models/User
 */

const mongoose = require("mongoose");
const { ROLES } = require("../constants");

const UserSchema = new mongoose.Schema(
  {
    // ─── Authentication ────────────────────────────────────────────────────────
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // Never return password by default
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-z0-9_-]+$/,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.MEMBER,
    },

    // ─── Email & Verification ──────────────────────────────────────────────────
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationExpiry: Date,

    // ─── Password Reset ────────────────────────────────────────────────────────
    passwordResetToken: String,
    passwordResetExpiry: Date,
    passwordResetAttempts: {
      type: Number,
      default: 0,
    },

    // ─── Profile Fields ────────────────────────────────────────────────────────
    avatar: {
      type: String,
      default: null,
    },
    bannerImage: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },
    department: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },
    batch: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50,
    },
    location: {
      type: String,
      default: "",
      maxlength: 100,
    },
    website: {
      type: String,
      default: "",
      match: /^(https?:\/\/)?.*/,
    },
    portfolio: {
      type: String,
      default: "",
      match: /^(https?:\/\/)?.*/,
    },

    // ─── Professional Links ────────────────────────────────────────────────────
    socialLinks: {
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      portfolio: { type: String, default: "" },
      website: { type: String, default: "" },
    },

    // ─── Skills & Interests ────────────────────────────────────────────────────
    skills: [
      {
        type: String,
        maxlength: 50,
      },
    ],
    interests: [
      {
        type: String,
        maxlength: 50,
      },
    ],

    // ─── Preferences ──────────────────────────────────────────────────────────
    timezone: {
      type: String,
      default: "UTC",
    },
    language: {
      type: String,
      default: "en",
      enum: ["en", "hi"],
    },
    theme: {
      type: String,
      default: "dark",
      enum: ["light", "dark", "auto"],
    },

    // ─── Privacy Settings ──────────────────────────────────────────────────────
    privacy: {
      profilePublic: { type: Boolean, default: true },
      showEmail: { type: Boolean, default: false },
      showActivity: { type: Boolean, default: true },
      showContributions: { type: Boolean, default: true },
    },

    // ─── Notification Settings ────────────────────────────────────────────────
    notificationSettings: {
      emailNotifications: { type: Boolean, default: true },
      postNotifications: { type: Boolean, default: true },
      discussionNotifications: { type: Boolean, default: true },
      eventNotifications: { type: Boolean, default: true },
      securityAlerts: { type: Boolean, default: true },
    },

    // ─── Profile Analytics ────────────────────────────────────────────────────
    profileViews: {
      type: Number,
      default: 0,
      min: 0,
    },
    reputation: {
      type: Number,
      default: 0,
      min: 0,
    },
    contributionScore: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ─── Bookmarks ────────────────────────────────────────────────────────────
    bookmarks: {
      posts: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Post",
        },
      ],
      discussions: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "DiscussionThread",
        },
      ],
      events: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Event",
        },
      ],
      articles: [
        {
          type: String, // External article URLs
        },
      ],
    },

    // ─── Achievements ──────────────────────────────────────────────────────────
    achievements: [
      {
        badge: String,
        unlockedAt: Date,
        description: String,
      },
    ],

    // ─── ACM Membership ────────────────────────────────────────────────────────
    isAcmMember: {
      type: Boolean,
      default: true,
    },
    acmId: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },

    // ─── Account Status ────────────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },
    lastActiveAt: Date,

    // ─── Security Logs ────────────────────────────────────────────────────────
    securityLogs: [
      {
        action: {
          type: String,
          enum: [
            "LOGIN",
            "LOGOUT",
            "PASSWORD_CHANGED",
            "PROFILE_UPDATED",
            "AVATAR_UPDATED",
            "EMAIL_CHANGED",
            "2FA_ENABLED",
            "2FA_DISABLED",
            "SESSION_REVOKED",
          ],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        ipAddress: String,
        userAgent: String,
        status: {
          type: String,
          enum: ["SUCCESS", "FAILED"],
          default: "SUCCESS",
        },
        details: mongoose.Schema.Types.Mixed,
      },
    ],

    // ─── Login History ────────────────────────────────────────────────────────
    loginHistory: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
        },
        browser: String,
        os: String,
        ipAddress: String,
        country: String,
        deviceName: String,
      },
    ],

    // ─── Active Sessions ──────────────────────────────────────────────────────
    sessions: [
      {
        sessionId: String,
        token: String,
        browser: String,
        os: String,
        ipAddress: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
        lastActivityAt: {
          type: Date,
          default: Date.now,
        },
        expiresAt: Date,
      },
    ],
  },
  {
    timestamps: true,
    indexes: [
      { email: 1 },
      { username: 1 },
      { acmId: 1 },
      { createdAt: 1 },
      { reputation: -1 },
      { contributionScore: -1 },
      { "securityLogs.timestamp": 1 },
      { "loginHistory.timestamp": 1 },
    ],
  }
);

// ─── Indexes for performance ──────────────────────────────────────────────
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ reputation: -1 });
UserSchema.index({ contributionScore: -1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ "securityLogs.timestamp": -1 });
UserSchema.index({ "loginHistory.timestamp": -1 });

// ─── Methods ───────────────────────────────────────────────────────────────

/**
 * Calculate profile completion percentage
 */
UserSchema.methods.getProfileCompletionPercentage = function () {
  const fields = [
    { name: "name", weight: 15 },
    { name: "avatar", weight: 15 },
    { name: "bio", weight: 10 },
    { name: "department", weight: 10 },
    { name: "batch", weight: 10 },
    { name: "username", weight: 10 },
    { name: "skills", weight: 10, isArray: true },
    { name: "interests", weight: 10, isArray: true },
  ];

  let completed = 0;
  let total = 0;

  fields.forEach((field) => {
    total += field.weight;
    if (field.isArray) {
      if (this[field.name] && this[field.name].length > 0) {
        completed += field.weight;
      }
    } else if (this[field.name]) {
      completed += field.weight;
    }
  });

  return Math.round((completed / total) * 100);
};

/**
 * Get profile completion suggestions
 */
UserSchema.methods.getProfileCompletionSuggestions = function () {
  const suggestions = [];

  if (!this.avatar) suggestions.push("Upload a profile picture");
  if (!this.bio || this.bio.length === 0) suggestions.push("Add a bio");
  if (!this.department) suggestions.push("Specify your department");
  if (!this.batch) suggestions.push("Add your batch year");
  if (!this.username) suggestions.push("Create a unique username");
  if (!this.skills || this.skills.length === 0) suggestions.push("Add your skills");
  if (!this.socialLinks.github) suggestions.push("Connect your GitHub");
  if (!this.socialLinks.linkedin) suggestions.push("Connect your LinkedIn");

  return suggestions;
};

/**
 * Add security log entry
 */
UserSchema.methods.addSecurityLog = function (action, ipAddress, userAgent, status = "SUCCESS", details = {}) {
  this.securityLogs.push({
    action,
    ipAddress,
    userAgent,
    status,
    details,
    timestamp: new Date(),
  });

  // Keep only last 100 logs
  if (this.securityLogs.length > 100) {
    this.securityLogs = this.securityLogs.slice(-100);
  }
};

/**
 * Add login history entry
 */
UserSchema.methods.addLoginHistory = function (browser, os, ipAddress, country, deviceName) {
  this.loginHistory.push({
    browser,
    os,
    ipAddress,
    country,
    deviceName,
    timestamp: new Date(),
  });

  // Keep only last 50 entries
  if (this.loginHistory.length > 50) {
    this.loginHistory = this.loginHistory.slice(-50);
  }

  this.lastActiveAt = new Date();
};

/**
 * Create active session
 */
UserSchema.methods.createSession = function (sessionId, token, browser, os, ipAddress, expiresIn = 7 * 24 * 60 * 60 * 1000) {
  const session = {
    sessionId,
    token,
    browser,
    os,
    ipAddress,
    createdAt: new Date(),
    lastActivityAt: new Date(),
    expiresAt: new Date(Date.now() + expiresIn),
  };

  this.sessions.push(session);

  // Keep only active sessions (last 10)
  this.sessions = this.sessions.filter((s) => s.expiresAt > new Date()).slice(-10);
};

/**
 * Revoke session by ID
 */
UserSchema.methods.revokeSession = function (sessionId) {
  this.sessions = this.sessions.filter((s) => s.sessionId !== sessionId);
};

/**
 * Revoke all sessions
 */
UserSchema.methods.revokeAllSessions = function () {
  this.sessions = [];
};

/**
 * Update last activity
 */
UserSchema.methods.updateLastActivity = function () {
  this.lastActiveAt = new Date();
  if (this.sessions.length > 0) {
    this.sessions[this.sessions.length - 1].lastActivityAt = new Date();
  }
};

/**
 * Unlock achievement
 */
UserSchema.methods.unlockAchievement = function (badge, description) {
  const exists = this.achievements.some((a) => a.badge === badge);
  if (!exists) {
    this.achievements.push({
      badge,
      description,
      unlockedAt: new Date(),
    });
    return true;
  }
  return false;
};

module.exports = mongoose.model("User", UserSchema);
