/**
 * Profile Routes
 * 
 * Handles user profile management: viewing, editing, avatar upload,
 * and password changes. All routes require authentication.
 * 
 * Endpoints:
 * - GET    /          - Get current user's full profile
 * - PATCH  /          - Update profile fields (name, bio, links, etc.)
 * - POST   /avatar    - Upload profile avatar image
 * - POST   /password  - Change password (requires current password)
 * 
 * Security:
 * - All routes require valid JWT token
 * - Password change requires current password verification
 * - Avatar uploads are limited to 2MB, images only
 * 
 * @module routes/profile
 */

const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

const { User } = require("../models");
const auth = require("../middlewares/auth");
const { AppError } = require("../middlewares/errorHandler");
const { validateProfileUpdate, validatePasswordChange } = require("../middlewares/validators");

// ─── Avatar Upload Configuration ─────────────────────────────────────────────

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads/avatars");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Use user ID as filename for easy replacement on re-upload
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${req.user.id}${ext}`);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit for avatars
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const isValidExt = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const isValidMime = allowedTypes.test(file.mimetype);
    if (isValidExt && isValidMime) {
      return cb(null, true);
    }
    cb(new Error("Only image files (JPEG, PNG, GIF, WebP) are allowed for avatars."));
  },
});

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * GET / - Returns the authenticated user's full profile.
 * Excludes password field for security.
 */
router.get("/", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return next(new AppError(404, "User not found"));
    res.json(user);
  } catch (err) {
    return next(err);
  }
});

/**
 * PATCH / - Updates profile fields.
 * 
 * Allowed fields: name, bio, department, year, github, linkedin
 * Email and role cannot be changed through this endpoint.
 */
router.patch("/", auth, validateProfileUpdate, async (req, res, next) => {
  try {
    const allowedFields = ["name", "bio", "department", "year", "github", "linkedin"];
    const updates = {};

    // Only pick allowed fields from request body
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return next(new AppError(400, "No valid fields to update"));
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return next(new AppError(404, "User not found"));

    res.json({ msg: "Profile updated successfully", user });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /avatar - Upload or replace profile avatar.
 * 
 * Replaces any existing avatar for the user.
 * Old avatar file is automatically overwritten (same filename pattern).
 * Returns the new avatar URL path.
 */
router.post("/avatar", auth, (req, res, next) => {
  avatarUpload.single("avatar")(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(new AppError(400, "Avatar image must be under 2MB"));
        }
        return next(new AppError(400, err.message));
      }
      return next(new AppError(400, err.message));
    }

    if (!req.file) {
      return next(new AppError(400, "No image file provided"));
    }

    try {
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: { avatar: avatarUrl } },
        { new: true }
      ).select("-password");

      if (!user) return next(new AppError(404, "User not found"));

      res.json({ msg: "Avatar uploaded successfully", avatar: avatarUrl, user });
    } catch (error) {
      return next(error);
    }
  });
});

/**
 * POST /password - Change user password.
 * 
 * Security Flow:
 * 1. Verify current password matches stored hash
 * 2. Hash new password with bcrypt
 * 3. Update password in database
 * 
 * Requires: currentPassword, newPassword, confirmPassword
 */
router.post("/password", auth, validatePasswordChange, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Fetch user with password field (normally excluded)
    const user = await User.findById(req.user.id);
    if (!user) return next(new AppError(404, "User not found"));

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return next(new AppError(400, "Current password is incorrect"));
    }

    // Prevent setting same password
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return next(new AppError(400, "New password must be different from current password"));
    }

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ msg: "Password changed successfully" });
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /avatar - Remove profile avatar.
 * Resets avatar to null (default state).
 */
router.delete("/avatar", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return next(new AppError(404, "User not found"));

    // Delete the file if it exists
    if (user.avatar) {
      const filePath = path.join(__dirname, "../../", user.avatar);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    user.avatar = null;
    await user.save();

    res.json({ msg: "Avatar removed successfully" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
