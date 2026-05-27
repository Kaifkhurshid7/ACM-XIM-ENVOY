/**
 * Request Validation Middleware
 * 
 * Uses express-validator to validate and sanitize incoming request data.
 * Each exported array is a middleware chain that validates specific fields
 * and returns structured error responses on failure.
 * 
 * Validation Strategy:
 * - All user inputs are trimmed and sanitized
 * - ObjectId params are validated to prevent invalid DB queries
 * - Role and boolean fields are normalized from various input formats
 * - Validation errors return 400 with field-level error details
 * 
 * @module middlewares/validators
 */

const { body, param, query, validationResult } = require("express-validator");
const { DISCUSSION_CATEGORIES } = require("../models/DiscussionThread");

// ─── Sanitizers ──────────────────────────────────────────────────────────────

/**
 * Normalizes various boolean-like string inputs to actual booleans.
 * Handles common user inputs like "yes", "no", "true", "false", etc.
 */
const normalizeBooleanLike = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return value;

  const normalized = value.trim().toLowerCase();
  const truthyValues = ["true", "yes", "y", "1", "member", "acm member"];
  const falsyValues = ["false", "no", "n", "0", "not yet", "non-member", "non member"];

  if (truthyValues.includes(normalized)) return true;
  if (falsyValues.includes(normalized)) return false;
  return value;
};

/**
 * Normalizes role strings to valid enum values.
 * Maps common variations to the canonical role names.
 */
const normalizeRole = (value) => {
  if (typeof value !== "string") return value;

  const normalized = value.trim().toLowerCase();
  const memberAliases = ["member", "student", "student / chapter member", "chapter member"];

  if (memberAliases.includes(normalized)) return "member";
  if (normalized === "admin") return "admin";
  return value;
};

// ─── Validation Result Handler ───────────────────────────────────────────────

/**
 * Checks for validation errors and returns a structured 400 response.
 * Must be the last middleware in a validation chain.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  return res.status(400).json({
    success: false,
    message: "Validation failed",
    errors: errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    })),
  });
};

// ─── Validation Chains ───────────────────────────────────────────────────────

const validateObjectIdParam = [
  param("id").isMongoId().withMessage("Invalid id format"),
  validateRequest,
];

const validateRegister = [
  body("name")
    .trim().notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),
  body("email")
    .trim().notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format"),
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role")
    .optional()
    .customSanitizer(normalizeRole)
    .isIn(["member", "admin"]).withMessage("Role must be member or admin"),
  body("isAcmMember")
    .optional()
    .customSanitizer(normalizeBooleanLike)
    .isBoolean().withMessage("isAcmMember must be boolean"),
  body("acmId")
    .optional({ values: "falsy" })
    .isString().trim()
    .isLength({ min: 2, max: 50 }).withMessage("acmId must be 2-50 characters"),
  validateRequest,
];

const validateLogin = [
  body("email")
    .trim().notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format"),
  body("password")
    .notEmpty().withMessage("Password is required"),
  validateRequest,
];

const validatePostCreate = [
  body("title")
    .trim().notEmpty().withMessage("Title is required")
    .isLength({ min: 3, max: 200 }).withMessage("Title must be 3-200 characters"),
  body("content")
    .trim().notEmpty().withMessage("Content is required")
    .isLength({ min: 10 }).withMessage("Content must be at least 10 characters"),
  body("author")
    .optional().isString().trim()
    .isLength({ min: 2, max: 100 }).withMessage("Author must be 2-100 characters"),
  validateRequest,
];

const validatePostUpdate = [
  param("id").isMongoId().withMessage("Invalid post id format"),
  body("title")
    .optional().isString().trim()
    .isLength({ min: 3, max: 200 }).withMessage("Title must be 3-200 characters"),
  body("content")
    .optional().isString().trim()
    .isLength({ min: 10 }).withMessage("Content must be at least 10 characters"),
  body("author")
    .optional().isString().trim()
    .isLength({ min: 2, max: 100 }).withMessage("Author must be 2-100 characters"),
  body().custom((value) => {
    const allowed = ["title", "content", "author"];
    const provided = Object.keys(value || {});
    return provided.length > 0 && provided.some((key) => allowed.includes(key));
  }).withMessage("Provide at least one updatable field: title, content, author"),
  validateRequest,
];

const validateEventCreate = [
  body("title")
    .trim().notEmpty().withMessage("Title is required")
    .isLength({ min: 3, max: 200 }).withMessage("Title must be 3-200 characters"),
  body("description")
    .trim().notEmpty().withMessage("Description is required")
    .isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),
  body("date")
    .notEmpty().withMessage("Date is required")
    .isISO8601().withMessage("Date must be a valid ISO date"),
  body("location")
    .trim().notEmpty().withMessage("Location is required")
    .isLength({ min: 2, max: 200 }).withMessage("Location must be 2-200 characters"),
  body("registrationLink")
    .optional().isURL().withMessage("registrationLink must be a valid URL"),
  body("isPast")
    .optional().isBoolean().withMessage("isPast must be boolean"),
  validateRequest,
];

const validateEventUpdate = [
  param("id").isMongoId().withMessage("Invalid event id format"),
  body("title")
    .optional().isString().trim()
    .isLength({ min: 3, max: 200 }).withMessage("Title must be 3-200 characters"),
  body("description")
    .optional().isString().trim()
    .isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),
  body("date")
    .optional().isISO8601().withMessage("Date must be a valid ISO date"),
  body("location")
    .optional().isString().trim()
    .isLength({ min: 2, max: 200 }).withMessage("Location must be 2-200 characters"),
  body("registrationLink")
    .optional().isURL().withMessage("registrationLink must be a valid URL"),
  body("isPast")
    .optional().isBoolean().withMessage("isPast must be boolean"),
  body().custom((value) => {
    const allowed = ["title", "description", "date", "location", "registrationLink", "isPast"];
    const provided = Object.keys(value || {});
    return provided.length > 0 && provided.some((key) => allowed.includes(key));
  }).withMessage("Provide at least one updatable event field"),
  validateRequest,
];

const validateForumThread = [
  body("title")
    .trim().notEmpty().withMessage("Title is required")
    .isLength({ min: 3, max: 200 }).withMessage("Title must be 3-200 characters"),
  body("content")
    .optional().isString().trim()
    .isLength({ min: 5, max: 10000 }).withMessage("Content must be 5-10000 characters"),
  body("description")
    .optional().isString().trim()
    .isLength({ min: 5, max: 10000 }).withMessage("Description must be 5-10000 characters"),
  body().custom((value) => {
    if (!value.content && !value.description) {
      throw new Error("Content or description is required");
    }
    return true;
  }),
  body("category")
    .optional().isIn(DISCUSSION_CATEGORIES).withMessage("Invalid discussion category"),
  body("tags")
    .optional().isArray({ max: 6 }).withMessage("Tags must be an array with at most 6 items"),
  body("tags.*")
    .optional().isString().trim()
    .isLength({ min: 1, max: 30 }).withMessage("Each tag must be 1-30 characters"),
  validateRequest,
];

const validateForumReply = [
  param("id").optional().isMongoId().withMessage("Invalid discussion id format"),
  param("replyId").optional().isMongoId().withMessage("Invalid reply id format"),
  body("content")
    .optional().isString().trim()
    .isLength({ min: 1, max: 4000 }).withMessage("Reply content must be 1-4000 characters"),
  body("text")
    .optional().isString().trim()
    .isLength({ min: 1, max: 4000 }).withMessage("Reply text must be 1-4000 characters"),
  body("parentReply")
    .optional({ values: "falsy" }).isMongoId().withMessage("Invalid parent reply id"),
  body("quotedReply")
    .optional({ values: "falsy" }).isMongoId().withMessage("Invalid quoted reply id"),
  body().custom((value) => {
    if (!value.content && !value.text) {
      throw new Error("Reply content or text is required");
    }
    return true;
  }),
  validateRequest,
];

const validateForumListQuery = [
  query("category").optional().isString().trim(),
  query("tag").optional().isString().trim(),
  query("search").optional().isString().trim().isLength({ max: 120 }),
  query("sort")
    .optional().isIn(["trending", "latest", "active", "unanswered", "solved"])
    .withMessage("Invalid sort value"),
  validateRequest,
];

const validateProfileUpdate = [
  body("name")
    .optional().isString().trim()
    .isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),
  body("bio")
    .optional().isString().trim()
    .isLength({ max: 300 }).withMessage("Bio must be at most 300 characters"),
  body("department")
    .optional().isString().trim()
    .isLength({ max: 100 }).withMessage("Department must be at most 100 characters"),
  body("year")
    .optional().isString().trim()
    .isLength({ max: 20 }).withMessage("Year must be at most 20 characters"),
  body("github")
    .optional({ values: "falsy" }).isString().trim()
    .isLength({ max: 200 }).withMessage("GitHub URL must be at most 200 characters"),
  body("linkedin")
    .optional({ values: "falsy" }).isString().trim()
    .isLength({ max: 200 }).withMessage("LinkedIn URL must be at most 200 characters"),
  validateRequest,
];

const validatePasswordChange = [
  body("currentPassword")
    .notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
  body("confirmPassword")
    .notEmpty().withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  validateRequest,
];

module.exports = {
  validateRequest,
  validateObjectIdParam,
  validateRegister,
  validateLogin,
  validatePostCreate,
  validatePostUpdate,
  validateEventCreate,
  validateEventUpdate,
  validateForumThread,
  validateForumReply,
  validateForumListQuery,
  validateProfileUpdate,
  validatePasswordChange,
};
