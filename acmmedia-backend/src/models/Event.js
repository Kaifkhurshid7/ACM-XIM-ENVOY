/**
 * Event Model
 * 
 * Represents a chapter event (workshop, hackathon, seminar, etc.).
 * Events are created by admins and displayed publicly to all users.
 * 
 * The `isPast` flag allows manual archival of completed events
 * for historical reference on the platform.
 * 
 * @module models/Event
 */

const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    registrationLink: {
      type: String,
      default: null,
    },
    isPast: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", EventSchema);
