const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET = require("../config/jwt");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

router.get("/me", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role, adminSecret } = req.body;
        if (!name || !email || !password) return res.status(400).json({ msg: "Missing fields" });

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ msg: "User already exists" });

        let userRole = 'member';
        if (role === 'admin') {
            if (adminSecret !== 'ACM_ADMIN_2026') {
                return res.status(400).json({ msg: "Invalid Admin Secret Key" });
            }
            userRole = 'admin';
        }

        const hashed = await bcrypt.hash(password, 10);
        await User.create({ name, email, password: hashed, role: userRole });
        res.json({ msg: "Registered" });
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

// Admins can create other admin users via this protected route
router.post("/create-admin", auth, role('admin'), async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ msg: "Missing fields" });
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ msg: "User already exists" });

        const hashed = await bcrypt.hash(password, 10);
        await User.create({ name, email, password: hashed, role: 'admin' });
        res.json({ msg: 'Admin created' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

router.post("/login", async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const ok = await bcrypt.compare(req.body.password, user.password);
    if (!ok) return res.status(400).json({ msg: "Wrong password" });

    const token = jwt.sign({ id: user._id, role: user.role }, SECRET);
    res.json({ token });
});

module.exports = router;
