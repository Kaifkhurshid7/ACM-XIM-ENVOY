const router = require("express").Router();
const { emitAnalytics } = require("../socket");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET = require("../config/jwt");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const { AppError } = require("../middleware/errorHandler");
const { validateRegister, validateLogin } = require("../middleware/validators");

router.get("/me", auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (err) {
        return next(err);
    }
});

router.post("/register", validateRegister, async (req, res, next) => {
    try {
        const { name, email, password, role, adminSecret, isAcmMember, acmId } = req.body;

        const emailLower = email.toLowerCase();

        const existing = await User.findOne({ email: emailLower });
        if (existing) return next(new AppError(400, "User already exists"));

        let userRole = 'member';
        if (role === 'admin') {
            const secret = process.env.ADMIN_SECRET || 'ADMIN_2026';
            if (adminSecret !== secret) {
                return next(new AppError(400, "Invalid Admin Secret Key"));
            }
            userRole = 'admin';
        }

        const hashed = await bcrypt.hash(password, 10);
        await User.create({
            name,
            email: emailLower,
            password: hashed,
            role: userRole,
            isAcmMember,
            acmId
        });

        res.json({ msg: "Registered Successfully" });
        emitAnalytics();
    } catch (err) {
        return next(err);
    }
});

// Admins can create other admin users
router.post("/create-admin", auth, role('admin'), async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return next(new AppError(400, "Missing fields"));

        const emailLower = email.toLowerCase();
        if (!emailLower.endsWith("@xim.edu.in") && !emailLower.endsWith("@stu.xim.edu.in")) {
            return next(new AppError(400, "Admin must have a valid XIM university email"));
        }

        const existing = await User.findOne({ email: emailLower });
        if (existing) return next(new AppError(400, "User already exists"));

        const hashed = await bcrypt.hash(password, 10);
        await User.create({ name, email: emailLower, password: hashed, role: 'admin' });
        res.json({ msg: 'Admin created' });
        emitAnalytics();
    } catch (err) {
        return next(err);
    }
});

router.post("/login", validateLogin, async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email.toLowerCase() });
        if (!user) return next(new AppError(400, "User not found"));

        const ok = await bcrypt.compare(req.body.password, user.password);
        if (!ok) return next(new AppError(400, "Wrong password"));

        const token = jwt.sign({ id: user._id, role: user.role }, SECRET);
        res.json({ token });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;