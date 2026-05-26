const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../uploads");
        // Ensure directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Timestamp + Clean Filename
        const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
        cb(null, `${Date.now()}-${cleanName}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const names = filetypes.test(file.originalname.toLowerCase());
        const mimetypes = filetypes.test(file.mimetype);
        if (names && mimetypes) {
            return cb(null, true);
        }
        cb(new Error("Images only via administrative order!"));
    }
});

// @route   POST /api/upload
// @desc    Upload an image
// @access  Admin only
router.post("/", auth, role('admin'), upload.single("image"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: "No file uploaded" });
        }
        // Return the relative path to be served statically
        const filePath = `/uploads/${req.file.filename}`;
        res.json({ filePath });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error during upload" });
    }
});

// @route   GET /api/upload
// @desc    List all uploaded files
// @access  Admin only
router.get("/", auth, role('admin'), (req, res) => {
    const directoryPath = path.join(__dirname, "../uploads");

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).json({ msg: "Unable to scan files" });
        }

        // Filter for images and map to URLs
        const fileInfos = files
            .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
            .map(file => ({
                name: file,
                url: `/uploads/${file}`,
                created: fs.statSync(path.join(directoryPath, file)).birthtime
            }))
            .sort((a, b) => b.created - a.created); // Newest first

        res.json(fileInfos);
    });
});

module.exports = router;
