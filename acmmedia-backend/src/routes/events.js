/**
 * Events Routes
 * 
 * CRUD operations for chapter events (workshops, hackathons, seminars).
 * Events are publicly viewable but only admins can create/modify/delete.
 * 
 * Endpoints:
 * - GET    /     - List all events sorted by date (public)
 * - GET    /:id  - Get single event (public)
 * - POST   /     - Create event (admin only)
 * - PATCH  /:id  - Update event (admin only)
 * - DELETE /:id  - Delete event (admin only)
 * 
 * @module routes/events
 */

const router = require("express").Router();
const { Event } = require("../models");
const auth = require("../middlewares/auth");
const checkRole = require("../middlewares/role");
const { AppError } = require("../middlewares/errorHandler");
const { validateObjectIdParam, validateEventCreate, validateEventUpdate } = require("../middlewares/validators");
const { ROLES } = require("../constants");

/** List all events, sorted by date ascending (upcoming first) */
router.get("/", async (req, res, next) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    return next(err);
  }
});

/** Get a single event by ID */
router.get("/:id", validateObjectIdParam, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return next(new AppError(404, "Event not found"));
    return res.json(event);
  } catch (err) {
    return next(err);
  }
});

/** Create a new event - admin only */
router.post("/", auth, checkRole(ROLES.ADMIN), validateEventCreate, async (req, res, next) => {
  try {
    const newEvent = new Event(req.body);
    const event = await newEvent.save();
    res.json(event);
  } catch (err) {
    return next(err);
  }
});

/** Update an existing event - admin only */
router.patch("/:id", auth, checkRole(ROLES.ADMIN), validateEventUpdate, async (req, res, next) => {
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

/** Delete an event - admin only */
router.delete("/:id", auth, checkRole(ROLES.ADMIN), validateObjectIdParam, async (req, res, next) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return next(new AppError(404, "Event not found"));
    res.json({ msg: "Event removed" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
