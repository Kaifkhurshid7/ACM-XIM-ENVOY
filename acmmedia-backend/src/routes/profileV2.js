/**
 * Profile Routes V2 - Production Ready
 * 
 * Complete profile management system with:
 * - Profile CRUD operations
 * - Avatar and banner uploads
 * - File handling with cleanup
 * - Bookmark system
 * - Achievement tracking
 * - Privacy controls
 * - Notification preferences
 * - Security logging
 * 
 * File Upload Configuration:
 * - Max file size: 5MB
 * - Supported formats: JPEG, PNG, GIF, WebP
 * - Automatic cleanup of old files
 * 
 * @module routes/profileV2
 */

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const securityService = require("../services/securityService");
const { authenticateToken } = require("../middlewares/auth");
const logger = require("../utils/logger");

// ────────────────────────────────────────────────────────────────────────────
// File Upload Configuration
// ────────────────────────────────────────────────────────────────────────────

const uploadDir = path.join(__dirname, "../../uploads");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, GIF, WebP allowed"));
    }
  },
});

// ────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ────────────────────────────────────────────────────────────────────────────

function deleteFile(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    logger.error({ err: error }, `Failed to delete file: ${filePath}`);
  }
}

function getClientInfo(req) {
  const userAgent = req.headers["user-agent"] || "Unknown";
  const ipAddress = req.headers["x-forwarded-for"]?.split(",")[0] || req.ip || "0.0.0.0";
  return { ipAddress, userAgent };
}

// ────────────────────────────────────────────────────────────────────────────
// GET / - Get current user profile with completion percentage
// ────────────────────────────────────────────────────────────────────────────

router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const completionPercentage = user.getProfileCompletionPercentage();
    const completionSuggestions = user.getProfileCompletionSuggestions();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        bannerImage: user.bannerImage,
        bio: user.bio,
        department: user.department,
        batch: user.batch,
        location: user.location,
        website: user.website,
        portfolio: user.portfolio,
        skills: user.skills,
        interests: user.interests,
        socialLinks: user.socialLinks,
        timezone: user.timezone,
        language: user.language,
        theme: user.theme,
        privacy: user.privacy,
        notificationSettings: user.notificationSettings,
        profileViews: user.profileViews,
        reputation: user.reputation,
        contributionScore: user.contributionScore,
        achievements: user.achievements.length,
        createdAt: user.createdAt,
        emailVerified: user.emailVerified,
      },
      profileCompletion: {
        percentage: completionPercentage,
        suggestions: completionSuggestions,
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Get profile error");
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// GET /:username - Get public profile (privacy-aware)
// ────────────────────────────────────────────────────────────────────────────

router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check privacy settings
    if (!user.privacy.profilePublic) {
      return res.status(403).json({ error: "This profile is private" });
    }

    // Increment profile views
    user.profileViews += 1;
    await user.save();

    // Return public profile data only
    res.json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        bannerImage: user.bannerImage,
        bio: user.bio,
        department: user.department,
        batch: user.batch,
        location: user.location,
        website: user.website,
        portfolio: user.portfolio,
        skills: user.skills,
        interests: user.interests,
        socialLinks: {
          github: user.socialLinks.github,
          linkedin: user.socialLinks.linkedin,
          twitter: user.socialLinks.twitter,
          portfolio: user.socialLinks.portfolio,
          website: user.socialLinks.website,
        },
        profileViews: user.profileViews,
        reputation: user.reputation,
        contributionScore: user.contributionScore,
        achievements: user.achievements.length,
        createdAt: user.createdAt,
        email: user.privacy.showEmail ? user.email : undefined,
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Get public profile error");
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// PATCH / - Update user profile
// ────────────────────────────────────────────────────────────────────────────

router.patch("/", authenticateToken, async (req, res) => {
  try {
    const {
      name,
      bio,
      department,
      batch,
      location,
      website,
      portfolio,
      skills,
      interests,
      socialLinks,
      username,
      timezone,
      language,
      theme,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update basic profile
    if (name) user.name = securityService.sanitizeInput(name);
    if (bio) user.bio = securityService.sanitizeInput(bio);
    if (department) user.department = securityService.sanitizeInput(department);
    if (batch) user.batch = securityService.sanitizeInput(batch);
    if (location) user.location = securityService.sanitizeInput(location);

    // Validate and update URLs
    if (website && !securityService.isValidUrl(website)) {
      return res.status(400).json({ error: "Invalid website URL" });
    }
    if (website) user.website = website;

    if (portfolio && !securityService.isValidUrl(portfolio)) {
      return res.status(400).json({ error: "Invalid portfolio URL" });
    }
    if (portfolio) user.portfolio = portfolio;

    // Update skills and interests
    if (Array.isArray(skills)) {
      user.skills = skills.map((s) => securityService.sanitizeInput(s)).slice(0, 10);
    }
    if (Array.isArray(interests)) {
      user.interests = interests.map((i) => securityService.sanitizeInput(i)).slice(0, 10);
    }

    // Update social links with validation
    if (socialLinks) {
      if (socialLinks.github && !securityService.isValidSocialLink("github", socialLinks.github)) {
        return res.status(400).json({ error: "Invalid GitHub URL" });
      }
      if (socialLinks.linkedin && !securityService.isValidSocialLink("linkedin", socialLinks.linkedin)) {
        return res.status(400).json({ error: "Invalid LinkedIn URL" });
      }
      if (socialLinks.twitter && !securityService.isValidSocialLink("twitter", socialLinks.twitter)) {
        return res.status(400).json({ error: "Invalid Twitter URL" });
      }

      if (socialLinks.github) user.socialLinks.github = socialLinks.github;
      if (socialLinks.linkedin) user.socialLinks.linkedin = socialLinks.linkedin;
      if (socialLinks.twitter) user.socialLinks.twitter = socialLinks.twitter;
      if (socialLinks.portfolio) user.socialLinks.portfolio = socialLinks.portfolio;
      if (socialLinks.website) user.socialLinks.website = socialLinks.website;
    }

    // Update preferences
    if (username) {
      const existingUsername = await User.findOne({ username: username.toLowerCase(), _id: { $ne: user._id } });
      if (existingUsername) {
        return res.status(409).json({ error: "Username already taken" });
      }
      user.username = username.toLowerCase();
    }

    if (timezone) user.timezone = timezone;
    if (language) user.language = language;
    if (theme) user.theme = theme;

    // Log security event
    const clientInfo = getClientInfo(req);
    user.addSecurityLog("PROFILE_UPDATED", clientInfo.ipAddress, clientInfo.userAgent, "SUCCESS");

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        bio: user.bio,
        department: user.department,
        batch: user.batch,
        location: user.location,
        website: user.website,
        portfolio: user.portfolio,
        skills: user.skills,
        interests: user.interests,
        socialLinks: user.socialLinks,
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Update profile error");
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// PATCH /privacy - Update privacy settings
// ────────────────────────────────────────────────────────────────────────────

router.patch("/privacy", authenticateToken, async (req, res) => {
  try {
    const { profilePublic, showEmail, showActivity, showContributions } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (typeof profilePublic === "boolean") user.privacy.profilePublic = profilePublic;
    if (typeof showEmail === "boolean") user.privacy.showEmail = showEmail;
    if (typeof showActivity === "boolean") user.privacy.showActivity = showActivity;
    if (typeof showContributions === "boolean") user.privacy.showContributions = showContributions;

    await user.save();

    res.json({
      message: "Privacy settings updated",
      privacy: user.privacy,
    });
  } catch (error) {
    logger.error({ err: error }, "Update privacy error");
    res.status(500).json({ error: "Failed to update privacy settings" });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// PATCH /notifications - Update notification settings
// ────────────────────────────────────────────────────────────────────────────

router.patch("/notifications", authenticateToken, async (req, res) => {
  try {
    const {
      emailNotifications,
      postNotifications,
      discussionNotifications,
      eventNotifications,
      securityAlerts,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (typeof emailNotifications === "boolean") user.notificationSettings.emailNotifications = emailNotifications;
    if (typeof postNotifications === "boolean") user.notificationSettings.postNotifications = postNotifications;
    if (typeof discussionNotifications === "boolean") user.notificationSettings.discussionNotifications = discussionNotifications;
    if (typeof eventNotifications === "boolean") user.notificationSettings.eventNotifications = eventNotifications;
    if (typeof securityAlerts === "boolean") user.notificationSettings.securityAlerts = securityAlerts;

    await user.save();

    res.json({
      message: "Notification settings updated",
      notificationSettings: user.notificationSettings,
    });
  } catch (error) {
    logger.error({ err: error }, "Update notifications error");
    res.status(500).json({ error: "Failed to update notification settings" });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /avatar - Upload avatar
// ────────────────────────────────────────────────────────────────────────────

router.post("/avatar", authenticateToken, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete old avatar
    if (user.avatar) {
      const oldPath = path.join(uploadDir, path.basename(user.avatar));
      deleteFile(oldPath);
    }

    // Save new avatar path
    user.avatar = `/uploads/${req.file.filename}`;

    const clientInfo = getClientInfo(req);
    user.addSecurityLog("AVATAR_UPDATED", clientInfo.ipAddress, clientInfo.userAgent, "SUCCESS");

    await user.save();

    res.json({
      message: "Avatar uploaded successfully",
      avatar: user.avatar,
    });
  } catch (error) {
    logger.error({ err: error }, "Avatar upload error");
    if (req.file) deleteFile(req.file.path);
    res.status(500).json({ error: "Failed to upload avatar" });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// POST /banner - Upload banner
// ────────────────────────────────────────────────────────────────────────────

router.post("/banner", authenticateToken, upload.single("banner"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete old banner
    if (user.bannerImage) {
      const oldPath = path.join(uploadDir, path.basename(user.bannerImage));
      deleteFile(oldPath);
    }

    // Save new banner path
    user.bannerImage = `/uploads/${req.file.filename}`;

    const clientInfo = getClientInfo(req);
    user.addSecurityLog("AVATAR_UPDATED", clientInfo.ipAddress, clientInfo.userAgent, "SUCCESS", {
      type: "banner",
    });

    await user.save();

    res.json({
      message: "Banner uploaded successfully",
      bannerImage: user.bannerImage,
    });
  } catch (error) {
    logger.error({ err: error }, "Banner upload error");
    if (req.file) deleteFile(req.file.path);
    res.status(500).json({ error: "Failed to upload banner" });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// DELETE /avatar - Remove avatar
// ────────────────────────────────────────────────────────────────────────────

router.delete("/avatar", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.avatar) {
      const oldPath = path.join(uploadDir, path.basename(user.avatar));
      deleteFile(oldPath);
      user.avatar = null;

      const clientInfo = getClientInfo(req);
      user.addSecurityLog("AVATAR_UPDATED", clientInfo.ipAddress, clientInfo.userAgent, "SUCCESS", {
        action: "Avatar removed",
      });

      await user.save();
    }

    res.json({ message: "Avatar removed" });
  } catch (error) {
    logger.error({ err: error }, "Delete avatar error");
    res.status(500).json({ error: "Failed to delete avatar" });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// DELETE /banner - Remove banner
// ────────────────────────────────────────────────────────────────────────────

router.delete("/banner", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.bannerImage) {
      const oldPath = path.join(uploadDir, path.basename(user.bannerImage));
      deleteFile(oldPath);
      user.bannerImage = null;

      const clientInfo = getClientInfo(req);
      user.addSecurityLog("AVATAR_UPDATED", clientInfo.ipAddress, clientInfo.userAgent, "SUCCESS", {
        action: "Banner removed",
      });

      await user.save();
    }

    res.json({ message: "Banner removed" });
  } catch (error) {
    logger.error({ err: error }, "Delete banner error");
    res.status(500).json({ error: "Failed to delete banner" });
  }
});


// ────────────────────────────────────────────────────────────────────────────
// Bookmark Endpoints
// ────────────────────────────────────────────────────────────────────────────

// POST /bookmarks/post/:id - Add post bookmark
router.post("/bookmarks/post/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already bookmarked
    if (user.bookmarks.posts.includes(id)) {
      return res.status(400).json({ error: "Already bookmarked" });
    }

    user.bookmarks.posts.push(id);
    await user.save();

    res.json({ message: "Post bookmarked successfully" });
  } catch (error) {
    logger.error({ err: error }, "Add post bookmark error");
    res.status(500).json({ error: "Failed to bookmark post" });
  }
});

// DELETE /bookmarks/post/:id - Remove post bookmark
router.delete("/bookmarks/post/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.bookmarks.posts = user.bookmarks.posts.filter((bookmarkId) => bookmarkId.toString() !== id);
    await user.save();

    res.json({ message: "Bookmark removed" });
  } catch (error) {
    logger.error({ err: error }, "Remove post bookmark error");
    res.status(500).json({ error: "Failed to remove bookmark" });
  }
});

// POST /bookmarks/discussion/:id - Add discussion bookmark
router.post("/bookmarks/discussion/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.bookmarks.discussions.includes(id)) {
      return res.status(400).json({ error: "Already bookmarked" });
    }

    user.bookmarks.discussions.push(id);
    await user.save();

    res.json({ message: "Discussion bookmarked successfully" });
  } catch (error) {
    logger.error({ err: error }, "Add discussion bookmark error");
    res.status(500).json({ error: "Failed to bookmark discussion" });
  }
});

// DELETE /bookmarks/discussion/:id - Remove discussion bookmark
router.delete("/bookmarks/discussion/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.bookmarks.discussions = user.bookmarks.discussions.filter(
      (bookmarkId) => bookmarkId.toString() !== id
    );
    await user.save();

    res.json({ message: "Bookmark removed" });
  } catch (error) {
    logger.error({ err: error }, "Remove discussion bookmark error");
    res.status(500).json({ error: "Failed to remove bookmark" });
  }
});

// POST /bookmarks/event/:id - Add event bookmark
router.post("/bookmarks/event/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.bookmarks.events.includes(id)) {
      return res.status(400).json({ error: "Already bookmarked" });
    }

    user.bookmarks.events.push(id);
    await user.save();

    res.json({ message: "Event bookmarked successfully" });
  } catch (error) {
    logger.error({ err: error }, "Add event bookmark error");
    res.status(500).json({ error: "Failed to bookmark event" });
  }
});

// DELETE /bookmarks/event/:id - Remove event bookmark
router.delete("/bookmarks/event/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.bookmarks.events = user.bookmarks.events.filter((bookmarkId) => bookmarkId.toString() !== id);
    await user.save();

    res.json({ message: "Bookmark removed" });
  } catch (error) {
    logger.error({ err: error }, "Remove event bookmark error");
    res.status(500).json({ error: "Failed to remove bookmark" });
  }
});

// POST /bookmarks/article - Add external article bookmark
router.post("/bookmarks/article", authenticateToken, async (req, res) => {
  try {
    const { url, title } = req.body;

    if (!url || !securityService.isValidUrl(url)) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const article = {
      url,
      title: title ? securityService.sanitizeInput(title) : url,
      addedAt: new Date(),
    };

    user.bookmarks.articles.push(article);
    await user.save();

    res.json({ message: "Article bookmarked successfully" });
  } catch (error) {
    logger.error({ err: error }, "Add article bookmark error");
    res.status(500).json({ error: "Failed to bookmark article" });
  }
});

// DELETE /bookmarks/article - Remove external article bookmark
router.delete("/bookmarks/article", authenticateToken, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.bookmarks.articles = user.bookmarks.articles.filter((article) => article.url !== url);
    await user.save();

    res.json({ message: "Bookmark removed" });
  } catch (error) {
    logger.error({ err: error }, "Remove article bookmark error");
    res.status(500).json({ error: "Failed to remove bookmark" });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// GET /bookmarks/all - Get all bookmarks with filtering and pagination
// ────────────────────────────────────────────────────────────────────────────

router.get("/bookmarks/all", authenticateToken, async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const bookmarks = {
      posts: user.bookmarks.posts || [],
      discussions: user.bookmarks.discussions || [],
      events: user.bookmarks.events || [],
      articles: user.bookmarks.articles || [],
    };

    // Filter by type if specified
    if (type && type !== "all") {
      const filtered = bookmarks[type] || [];
      return res.json({
        bookmarks: filtered.slice(skip, skip + parseInt(limit)),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filtered.length,
          type,
        },
      });
    }

    res.json({
      bookmarks: {
        posts: bookmarks.posts.slice(skip, skip + parseInt(limit)),
        discussions: bookmarks.discussions.slice(skip, skip + parseInt(limit)),
        events: bookmarks.events.slice(skip, skip + parseInt(limit)),
        articles: bookmarks.articles.slice(skip, skip + parseInt(limit)),
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: {
          posts: bookmarks.posts.length,
          discussions: bookmarks.discussions.length,
          events: bookmarks.events.length,
          articles: bookmarks.articles.length,
        },
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Get bookmarks error");
    res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// GET /achievements - Get user achievements
// ────────────────────────────────────────────────────────────────────────────

router.get("/achievements", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      achievements: user.achievements,
      total: user.achievements.length,
    });
  } catch (error) {
    logger.error({ err: error }, "Get achievements error");
    res.status(500).json({ error: "Failed to fetch achievements" });
  }
});

module.exports = router;
