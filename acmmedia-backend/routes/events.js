const router = require("express").Router();
const Event = require("../models/Event");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/role");
const { AppError } = require("../middleware/errorHandler");
const { validateObjectIdParam, validateEventCreate, validateEventUpdate } = require("../middleware/validators");

// Get all events
router.get("/", async (req, res, next) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (err) {
        return next(err);
    }
});

router.get("/:id", validateObjectIdParam, async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return next(new AppError(404, "Event not found"));
        return res.json(event);
    } catch (err) {
        return next(err);
    }
});

// Create event (Admin only)
router.post("/", auth, checkRole("admin"), validateEventCreate, async (req, res, next) => {
    try {
        const newEvent = new Event(req.body);
        const event = await newEvent.save();
        res.json(event);
    } catch (err) {
        return next(err);
    }
});

router.patch("/:id", auth, checkRole("admin"), validateEventUpdate, async (req, res, next) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedEvent) return next(new AppError(404, "Event not found"));

        return res.json(updatedEvent);
    } catch (err) {
        return next(err);
    }
});

// Delete event (Admin only)
router.delete("/:id", auth, checkRole("admin"), validateObjectIdParam, async (req, res, next) => {
    try {
        const deleted = await Event.findByIdAndDelete(req.params.id);
        if (!deleted) return next(new AppError(404, "Event not found"));
        res.json({ msg: "Event removed" });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
