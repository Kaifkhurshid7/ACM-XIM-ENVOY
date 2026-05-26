/**
 * Authentication Routes
 * 
 * Handles user registration, login, and session management.
 * 
 * Endpoints:
 * - POST /register  - Create a new user account
 * - POST /login     - Authenticate and receive JWT token
 * - POST /create-admin - Create admin accounts (admin-only)
 * - GET  /me        - Get current authenticated user profile
 * 
 * Security:
 * - Passwords are hashed with bcrypt (10 rounds)
 * - Admin registration requires a secret key
 * - Emails are normalized to lowercase for consistency
 * 
 * @module routes/auth
 */

const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { User } = require("../models");
const SECRET = require("../config/jwt");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const { AppError } = require("../middlewares/errorHandler");
const { validateRegister, validateLogin } = require("../middlewares/validators");
const { emitAnalytics } = require("../socket");
const { ROLES, ALLOWED_DOMAINS } = require("../constants");

/**
 * GET /me - Returns the authenticated user's profile (excluding password).
 * Used by the frontend to verify session validity on page load.
 */
router.get("/me", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /register - Creates a new user account.
 * 
 * Business Rules:
 * - Email must be unique (case-insensitive)
 * - Admin registration requires matching ADMIN_SECRET
 * - Default role is "member" unless admin secret is provided
 * - Emits analytics update for admin dashboard
 */
router.post("/register", validateRegister, async (req, res, next) => {
  try {
    const { name, email, password, role: requestedRole, adminSecret, isAcmMember, acmId } = req.body;
    const emailLower = email.toLowerCase();

    // Check for existing user
    const existing = await User.findOne({ email: emailLower });
    if (existing) return next(new AppError(400, "User already exists"));

    // Determine user role - admin requires secret verification
    let userRole = ROLES.MEMBER;
    if (requestedRole === ROLES.ADMIN) {
      const secret = process.env.ADMIN_SECRET || "ADMIN_2026";
      if (adminSecret !== secret) {
        return next(new AppError(400, "Invalid Admin Secret Key"));
      }
      userRole = ROLES.ADMIN;
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email: emailLower,
      password: hashed,
      role: userRole,
      isAcmMember,
      acmId,
    });

    res.json({ msg: "Registered Successfully" });
    emitAnalytics();
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /create-admin - Creates a new admin user (admin-only).
 * 
 * Business Rules:
 * - Only existing admins can create other admins
 * - Email must be from an allowed university domain
 * - Bypasses the admin secret requirement (already authenticated as admin)
 */
router.post("/create-admin", auth, role(ROLES.ADMIN), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return next(new AppError(400, "Missing fields"));
    }

    const emailLower = email.toLowerCase();

    // Verify university domain for admin accounts
    const isValidDomain = ALLOWED_DOMAINS.some((domain) =>
      emailLower.endsWith(domain)
    );
    if (!isValidDomain) {
      return next(new AppError(400, "Admin must have a valid XIM university email"));
    }

    const existing = await User.findOne({ email: emailLower });
    if (existing) return next(new AppError(400, "User already exists"));

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ name, email: emailLower, password: hashed, role: ROLES.ADMIN });

    res.json({ msg: "Admin created" });
    emitAnalytics();
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /login - Authenticates user and returns a JWT token.
 * 
 * The token contains the user's ID and role, enabling
 * stateless authentication on subsequent requests.
 */
router.post("/login", validateLogin, async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (!user) return next(new AppError(400, "User not found"));

    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordValid) return next(new AppError(400, "Wrong password"));

    const token = jwt.sign({ id: user._id, role: user.role }, SECRET);
    res.json({ token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
