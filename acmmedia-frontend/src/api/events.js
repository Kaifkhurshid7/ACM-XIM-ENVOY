/**
 * Events API Module
 * 
 * CRUD operations for chapter events.
 * 
 * @module api/events
 */

import client from "./client";

/** Fetch all events (sorted by date ascending) */
export const fetchEvents = () => client.get("/events");

/** Create a new event (admin only) */
export const createEvent = (data) => client.post("/events", data);

/** Delete an event (admin only) */
export const deleteEvent = (id) => client.delete(`/events/${id}`);
