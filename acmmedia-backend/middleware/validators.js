const { body, param, validationResult } = require("express-validator");

// Allow any valid email for registration
const xImDomainRule = () => true;

const normalizeBooleanLike = (value) => {
    if (typeof value === "boolean") return value;
    if (typeof value !== "string") return value;

    const normalized = value.trim().toLowerCase();
    if (["true", "yes", "y", "1", "member", "acm member"].includes(normalized)) return true;
    if (["false", "no", "n", "0", "not yet", "non-member", "non member"].includes(normalized)) return false;
    return value;
};

const normalizeRole = (value) => {
    if (typeof value !== "string") return value;

    const normalized = value.trim().toLowerCase();
    if (["member", "student", "student / chapter member", "chapter member"].includes(normalized)) return "member";
    if (normalized === "admin") return "admin";
    return value;
};

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array().map((error) => ({
            field: error.path,
            message: error.msg
        }))
    });
};

const validateObjectIdParam = [
    param("id").isMongoId().withMessage("Invalid id format"),
    validateRequest
];

const validateRegister = [
    body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),
    body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format").custom(xImDomainRule),
    body("password").notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").optional().customSanitizer(normalizeRole).isIn(["member", "admin"]).withMessage("Role must be member or admin"),
    body("isAcmMember").optional().customSanitizer(normalizeBooleanLike).isBoolean().withMessage("isAcmMember must be boolean"),
    body("acmId").optional({ values: "falsy" }).isString().trim().isLength({ min: 2, max: 50 }).withMessage("acmId must be 2-50 characters"),
    validateRequest
];

const validateLogin = [
    body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format"),
    body("password").notEmpty().withMessage("Password is required"),
    validateRequest
];

const validatePostCreate = [
    body("title").trim().notEmpty().withMessage("Title is required").isLength({ min: 3, max: 200 }).withMessage("Title must be 3-200 characters"),
    body("content").trim().notEmpty().withMessage("Content is required").isLength({ min: 10 }).withMessage("Content must be at least 10 characters"),
    body("author").optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage("Author must be 2-100 characters"),
    validateRequest
];

const validatePostUpdate = [
    param("id").isMongoId().withMessage("Invalid post id format"),
    body("title").optional().isString().trim().isLength({ min: 3, max: 200 }).withMessage("Title must be 3-200 characters"),
    body("content").optional().isString().trim().isLength({ min: 10 }).withMessage("Content must be at least 10 characters"),
    body("author").optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage("Author must be 2-100 characters"),
    body().custom((value) => {
        const allowed = ["title", "content", "author"];
        const provided = Object.keys(value || {});
        return provided.length > 0 && provided.some((key) => allowed.includes(key));
    }).withMessage("Provide at least one updatable field: title, content, author"),
    validateRequest
];

const validateEventCreate = [
    body("title").trim().notEmpty().withMessage("Title is required").isLength({ min: 3, max: 200 }).withMessage("Title must be 3-200 characters"),
    body("description").trim().notEmpty().withMessage("Description is required").isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),
    body("date").notEmpty().withMessage("Date is required").isISO8601().withMessage("Date must be a valid ISO date"),
    body("location").trim().notEmpty().withMessage("Location is required").isLength({ min: 2, max: 200 }).withMessage("Location must be 2-200 characters"),
    body("registrationLink").optional().isURL().withMessage("registrationLink must be a valid URL"),
    body("isPast").optional().isBoolean().withMessage("isPast must be boolean"),
    validateRequest
];

const validateEventUpdate = [
    param("id").isMongoId().withMessage("Invalid event id format"),
    body("title").optional().isString().trim().isLength({ min: 3, max: 200 }).withMessage("Title must be 3-200 characters"),
    body("description").optional().isString().trim().isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),
    body("date").optional().isISO8601().withMessage("Date must be a valid ISO date"),
    body("location").optional().isString().trim().isLength({ min: 2, max: 200 }).withMessage("Location must be 2-200 characters"),
    body("registrationLink").optional().isURL().withMessage("registrationLink must be a valid URL"),
    body("isPast").optional().isBoolean().withMessage("isPast must be boolean"),
    body().custom((value) => {
        const allowed = ["title", "description", "date", "location", "registrationLink", "isPast"];
        const provided = Object.keys(value || {});
        return provided.length > 0 && provided.some((key) => allowed.includes(key));
    }).withMessage("Provide at least one updatable event field"),
    validateRequest
];

const validateForumThread = [
    body("title").trim().notEmpty().withMessage("Title is required").isLength({ min: 3, max: 200 }).withMessage("Title must be 3-200 characters"),
    body("description").trim().notEmpty().withMessage("Description is required").isLength({ min: 5 }).withMessage("Description must be at least 5 characters"),
    validateRequest
];

const validateForumReply = [
    param("id").isMongoId().withMessage("Invalid thread id format"),
    body("text").trim().notEmpty().withMessage("Reply text is required").isLength({ min: 1, max: 2000 }).withMessage("Reply text must be 1-2000 characters"),
    validateRequest
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
    validateForumReply
};
