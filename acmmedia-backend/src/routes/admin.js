/**
 * Admin Routes
 * 
 * Administrative endpoints for platform management.
 * All routes require admin authentication.
 * 
 * Endpoints:
 * - GET /stats - Platform-wide analytics (admin only)
 * 
 * @module routes/admin
 */

const router = require("express").Router();
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const { getAnalytics } = require("../services/analyticsService");
const { ROLES } = require("../constants");

/**
 * GET /stats - Returns aggregated platform metrics.
 * Used by the admin dashboard for the analytics overview panel.
 */
router.get("/stats", auth, role(ROLES.ADMIN), async (req, res) => {
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
