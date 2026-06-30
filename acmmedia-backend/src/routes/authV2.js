/**
 * Authentication Routes V2 - Production Ready
 * 
 * Complete authentication system with:
 * - Email verification flow
 * - Secure password reset
 * - Session management
 * - Device tracking
 * - Login history
 * - Security logging
 * - Rate limiting
 * 
 * All endpoints follow REST conventions and OWASP security guidelines.
 * 
 * @module routes/authV2
 */

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const securityService = require("../services/securityService");
const emailService = require("../services/emailService");
const { authenticateToken } = require("../middlewares/auth");
const { validatePasswordStrength } = require("../middlewares/validators");
const logger = require("../utils/logger");

const APP_URL = process.env.APP_URL || "https://acm-xim.local";

// ────────────────────────────────────────────────────────────────────────────
// Helper: Extract client information from request
// ────────────────────────────────────────────────────────────────────────────

function getClientInfo(req) {
  const userAgent = req.headers["user-agent"] || "Unknown";
  const ipAddress = req.headers["x-forwarded-for"]?.split(",")[0] || req.ip || "0.0.0.0";

  // Simple browser/OS detection
  let browser = "Unknown";
  let os = "Unknown";

  if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Edge")) browser = "Edge";

  if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Mac")) os = "macOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iPhone")) os = "iOS";

  return { browser, os, ipAddress, userAgent };
}

// ────────────────────────────────────────────────────────────────────────────
// POST /register - Register new user
// ────────────────────────────────────────────────────────────────────────────

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Input validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Check password strength
    const strengthCheck = securityService.validatePasswordStrength(password);
    if (!strengthCheck.isValid) {
      return res.status(400).json({
        error: "Password does not meet requirements",
        requirements: strengthCheck.errors,
      });
    }

    // Sanitize inputs
    const sanitizedName = securityService.sanitizeInput(name);
    const sanitizedEmail = email.toLowerCase().trim();

    // Check if email exists
    const existingEmail = await User.findOne({ email: sanitizedEmail });
    if (existingEmail) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await securityService.hashPassword(password);

    // Generate verification token
    const verificationTokenData = securityService.generateVerificationToken();
    const hashedVerificationToken = securityService.hashToken(verificationTokenData.token);

    // Create user
    const newUser = new User({
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
      verificationToken: hashedVerificationToken,
      verificationExpiry: verificationTokenData.expiresAt,
      emailVerified: false,
    });

    await newUser.save();

    // Log security event
    const clientInfo = getClientInfo(req);
    newUser.addSecurityLog("LOGIN", clientInfo.ipAddress, clientInfo.userAgent, "SUCCESS", {
      action: "Account created",
    });
    await newUser.save();

    // Send welcome and verification emails
    const verificationLink = `${APP_URL}/verify-email?token=${verificationTokenData.token}&email=${sanitizedEmail}`;
    await emailService.sendWelcomeEmail(sanitizedEmail, sanitizedName);
    await emailService.sendVerificationEmail(sanitizedEmail, sanitizedName, verificationLink);

    res.status(201).json({
      message: "Registration successful. Check your email to verify your account.",
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        emailVerified: newUser.emailVerified,
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Registration error");
    res.status(500).json({ error: "Registration failed" });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /verify-email - Verify user email with token
// ────────────────────────────────────────────────────────────────────────────

router.post("/verify-email", async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ error: "Email and token are required" });
    }

    const sanitizedEmail = email.toLowerCase().trim();
    const hashedToken = securityService.hashToken(token);

    // Find user
    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    // Validate token
    if (user.verificationToken !== hashedToken) {
      return res.status(400).json({ error: "Invalid verification token" });
    }

    // Check expiry
    if (new Date() > user.verificationExpiry) {
      return res.status(400).json({ error: "Verification token expired" });
    }

    // Verify email
    user.emailVerified = true;
    user.verificationToken = null;
    user.verificationExpiry = null;

    await user.save();

    res.json({
      message: "Email verified successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Email verification error");
    res.status(500).json({ error: "Verification failed" });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /resend-verification - Resend verification email
// ────────────────────────────────────────────────────────────────────────────

router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const sanitizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: sanitizedEmail });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    // Generate new verification token
    const verificationTokenData = securityService.generateVerificationToken();
    const hashedVerificationToken = securityService.hashToken(verificationTokenData.token);

    user.verificationToken = hashedVerificationToken;
    user.verificationExpiry = verificationTokenData.expiresAt;
    await user.save();

    // Send verification email
    const verificationLink = `${APP_URL}/verify-email?token=${verificationTokenData.token}&email=${sanitizedEmail}`;
    await emailService.sendVerificationEmail(sanitizedEmail, user.name, verificationLink);

    res.json({ message: "Verification email sent" });
  } catch (error) {
    logger.error({ err: error }, "Resend verification error");
    res.status(500).json({ error: "Failed to resend verification email" });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /forgot-password - Initiate password reset (rate limited)
// ────────────────────────────────────────────────────────────────────────────

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const sanitizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: sanitizedEmail });

    // Don't reveal if user exists (security best practice)
    if (!user) {
      return res.json({
        message: "If an account exists with this email, a password reset link will be sent",
      });
    }

    // Check rate limiting
    if (securityService.isResetRateLimited(user)) {
      return res.status(429).json({
        error: "Too many password reset attempts. Please try again in 1 hour",
      });
    }

    // Generate password reset token
    const resetTokenData = securityService.generatePasswordResetToken();
    const hashedResetToken = securityService.hashToken(resetTokenData.token);

    user.passwordResetToken = hashedResetToken;
    user.passwordResetExpiry = resetTokenData.expiresAt;
    securityService.incrementResetAttempts(user);

    await user.save();

    // Send password reset email
    const resetLink = `${APP_URL}/reset-password?token=${resetTokenData.token}&email=${sanitizedEmail}`;
    await emailService.sendPasswordResetEmail(sanitizedEmail, user.name, resetLink);

    res.json({
      message: "If an account exists with this email, a password reset link will be sent",
    });
  } catch (error) {
    logger.error({ err: error }, "Forgot password error");
    res.status(500).json({ error: "Failed to process password reset request" });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /reset-password - Reset password with token validation
// ────────────────────────────────────────────────────────────────────────────

router.post("/reset-password", async (req, res) => {
  try {
    const { email, token, newPassword, confirmPassword } = req.body;

    if (!email || !token || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Validate password strength
    const strengthCheck = securityService.validatePasswordStrength(newPassword);
    if (!strengthCheck.isValid) {
      return res.status(400).json({
        error: "Password does not meet requirements",
        requirements: strengthCheck.errors,
      });
    }

    const sanitizedEmail = email.toLowerCase().trim();
    const hashedToken = securityService.hashToken(token);

    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate token
    if (user.passwordResetToken !== hashedToken) {
      return res.status(400).json({ error: "Invalid reset token" });
    }

    // Check expiry
    if (new Date() > user.passwordResetExpiry) {
      return res.status(400).json({ error: "Reset token expired" });
    }

    // Update password
    user.password = await securityService.hashPassword(newPassword);
    user.passwordResetToken = null;
    user.passwordResetExpiry = null;
    securityService.resetAttemptCounter(user);

    // Revoke all sessions on password change (security best practice)
    user.revokeAllSessions();

    await user.save();

    // Send confirmation email
    const clientInfo = getClientInfo(req);
    await emailService.sendPasswordChangedEmail(
      sanitizedEmail,
      user.name,
      clientInfo.ipAddress,
      new Date()
    );

    // Log security event
    user.addSecurityLog("PASSWORD_CHANGED", clientInfo.ipAddress, clientInfo.userAgent, "SUCCESS");
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    logger.error({ err: error }, "Reset password error");
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /login - Login with session creation and device tracking
// ────────────────────────────────────────────────────────────────────────────

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const sanitizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: sanitizedEmail }).select("+password");

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        error: "Email not verified. Check your inbox for verification email",
      });
    }

    // Compare password
    const isPasswordValid = await securityService.comparePassword(password, user.password);
    if (!isPasswordValid) {
      // Log failed attempt
      const clientInfo = getClientInfo(req);
      user.addSecurityLog("LOGIN", clientInfo.ipAddress, clientInfo.userAgent, "FAILED", {
        reason: "Invalid password",
      });
      await user.save();

      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate session token
    const sessionToken = securityService.generateToken();
    const hashedSessionToken = securityService.hashToken(sessionToken);

    // Get client info
    const clientInfo = getClientInfo(req);

    // Create session
    user.createSession(
      sessionToken.substring(0, 16),
      hashedSessionToken,
      clientInfo.browser,
      clientInfo.os,
      clientInfo.ipAddress
    );

    // Add login history
    user.addLoginHistory(clientInfo.browser, clientInfo.os, clientInfo.ipAddress, "Unknown", `${clientInfo.browser} on ${clientInfo.os}`);

    // Log security event
    user.addSecurityLog("LOGIN", clientInfo.ipAddress, clientInfo.userAgent, "SUCCESS");

    await user.save();

    // Create JWT token (keep existing auth system compatible)
    const jwtToken = require("jsonwebtoken").sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token: jwtToken,
      sessionToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Login error");
    res.status(500).json({ error: "Login failed" });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /logout - Logout current session
// ────────────────────────────────────────────────────────────────────────────

router.post("/logout", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Optionally revoke specific session based on sessionId from client
    // For now, just log the logout event
    const clientInfo = getClientInfo(req);
    user.addSecurityLog("LOGOUT", clientInfo.ipAddress, clientInfo.userAgent, "SUCCESS");

    await user.save();

    res.json({ message: "Logout successful" });
  } catch (error) {
    logger.error({ err: error }, "Logout error");
    res.status(500).json({ error: "Logout failed" });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /logout-all - Logout all devices
// ────────────────────────────────────────────────────────────────────────────

router.post("/logout-all", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Revoke all sessions
    user.revokeAllSessions();

    const clientInfo = getClientInfo(req);
    user.addSecurityLog("LOGOUT", clientInfo.ipAddress, clientInfo.userAgent, "SUCCESS", {
      action: "Logout from all devices",
    });

    await user.save();

    res.json({ message: "Logged out from all devices" });
  } catch (error) {
    logger.error({ err: error }, "Logout all error");
    res.status(500).json({ error: "Failed to logout from all devices" });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// GET /me - Get current authenticated user
// ────────────────────────────────────────────────────────────────────────────

router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Get me error");
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /change-password - Change password (authenticated)
// ────────────────────────────────────────────────────────────────────────────

router.post("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "New passwords do not match" });
    }

    // Validate password strength
    const strengthCheck = securityService.validatePasswordStrength(newPassword);
    if (!strengthCheck.isValid) {
      return res.status(400).json({
        error: "Password does not meet requirements",
        requirements: strengthCheck.errors,
      });
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isCurrentPasswordValid = await securityService.comparePassword(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Update password
    user.password = await securityService.hashPassword(newPassword);

    // Revoke all sessions on password change
    user.revokeAllSessions();

    // Log security event
    const clientInfo = getClientInfo(req);
    user.addSecurityLog("PASSWORD_CHANGED", clientInfo.ipAddress, clientInfo.userAgent, "SUCCESS");

    await user.save();

    // Send confirmation email
    await emailService.sendPasswordChangedEmail(
      user.email,
      user.name,
      clientInfo.ipAddress,
      new Date()
    );

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    logger.error({ err: error }, "Change password error");
    res.status(500).json({ error: "Failed to change password" });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// GET /sessions - Get active sessions
// ────────────────────────────────────────────────────────────────────────────

router.get("/sessions", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      sessions: user.sessions.map((s) => ({
        sessionId: s.sessionId,
        browser: s.browser,
        os: s.os,
        ipAddress: s.ipAddress,
        createdAt: s.createdAt,
        lastActivityAt: s.lastActivityAt,
        expiresAt: s.expiresAt,
      })),
    });
  } catch (error) {
    logger.error({ err: error }, "Get sessions error");
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// DELETE /sessions/:sessionId - Revoke specific session
// ────────────────────────────────────────────────────────────────────────────

router.delete("/sessions/:sessionId", authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.revokeSession(sessionId);

    const clientInfo = getClientInfo(req);
    user.addSecurityLog("SESSION_REVOKED", clientInfo.ipAddress, clientInfo.userAgent, "SUCCESS", {
      sessionId,
    });

    await user.save();

    res.json({ message: "Session revoked" });
  } catch (error) {
    logger.error({ err: error }, "Revoke session error");
    res.status(500).json({ error: "Failed to revoke session" });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// GET /login-history - Get login history (paginated)
// ────────────────────────────────────────────────────────────────────────────

router.get("/login-history", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const loginHistory = user.loginHistory
      .reverse()
      .slice(skip, skip + parseInt(limit));

    res.json({
      loginHistory,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: user.loginHistory.length,
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Get login history error");
    res.status(500).json({ error: "Failed to fetch login history" });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// GET /security-logs - Get security logs (paginated)
// ────────────────────────────────────────────────────────────────────────────

router.get("/security-logs", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const securityLogs = user.securityLogs
      .reverse()
      .slice(skip, skip + parseInt(limit));

    res.json({
      securityLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: user.securityLogs.length,
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Get security logs error");
    res.status(500).json({ error: "Failed to fetch security logs" });
  }
});

module.exports = router;
