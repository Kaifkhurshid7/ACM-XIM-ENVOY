const router = require("express").Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const { getAnalytics } = require("../services/analyticsService");

// Get Platform Stats
router.get("/stats", auth, role('admin'), async (req, res) => {
    try {
        const stats = await getAnalytics();
        if (!stats) return res.status(500).json({ msg: "Error fetching stats" });
        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
