const router = require("express").Router();
const Event = require("../models/Event");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/role");

// Get all events
router.get("/", async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

// Create event (Admin only)
router.post("/", auth, checkRole("admin"), async (req, res) => {
    try {
        const newEvent = new Event(req.body);
        const event = await newEvent.save();
        res.json(event);
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

// Delete event (Admin only)
router.delete("/:id", auth, checkRole("admin"), async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.json({ msg: "Event removed" });
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;
