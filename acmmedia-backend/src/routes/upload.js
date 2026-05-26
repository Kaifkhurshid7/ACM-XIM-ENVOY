/**
 * File Upload Routes
 * 
 * Handles image uploads for the platform (admin only).
 * Uses Multer for multipart form data processing with
 * file type validation and size limits.
 * 
 * Endpoints:
 * - POST / - Upload an image file (admin only)
 * - GET  / - List all uploaded files (admin only)
 * 
 * Constraints:
 * - Max file size: 5MB
 * - Allowed types: JPEG, PNG, GIF, WebP
 * - Files stored in /uploads directory
 * 
 * @module routes/upload
 */

const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const { ROLES, UPLOAD } = require("../constants");

// ─── Multer Configuration ────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Sanitize filename and prepend timestamp for uniqueness
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
    cb(null, `${Date.now()}-${cleanName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: UPLOAD.MAX_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    const isValidName = UPLOAD.ALLOWED_TYPES.test(file.originalname.toLowerCase());
    const isValidMime = UPLOAD.ALLOWED_TYPES.test(file.mimetype);
    if (isValidName && isValidMime) {
      return cb(null, true);
    }
    cb(new Error("Only image files (JPEG, PNG, GIF, WebP) are allowed."));
  },
});

// ─── Routes ──────────────────────────────────────────────────────────────────

/** Upload a single image file */
router.post("/", auth, role(ROLES.ADMIN), upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }
    const filePath = `/uploads/${req.file.filename}`;
    res.json({ filePath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error during upload" });
  }
});

/** List all uploaded image files */
router.get("/", auth, role(ROLES.ADMIN), (req, res) => {
  const directoryPath = path.join(__dirname, "../../uploads");

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).json({ msg: "Unable to scan files" });
    }

    const fileInfos = files
      .filter((file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map((file) => ({
        name: file,
        url: `/uploads/${file}`,
        created: fs.statSync(path.join(directoryPath, file)).birthtime,
      }))
      .sort((a, b) => b.created - a.created);

    res.json(fileInfos);
  });
});

module.exports = router;
