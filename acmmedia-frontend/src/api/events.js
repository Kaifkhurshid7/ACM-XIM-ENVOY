/**
 * Events API Module
 * 
 * CRUD operations for chapter events.
 * 
 * @module api/events
 */

import client from "./client";

/**
 * Fetch a page of events (sorted by date ascending).
 * Responds with { data: Event[], pagination: {...} }.
 *
 * @param {object} [params] - Optional { page, limit }; backend caps limit at 50
 */
export const fetchEvents = (params) => client.get("/events", { params });

/**
 * Fetch a single event by its MongoDB id.
 * Responds with the event document directly (not wrapped).
 */
export const fetchEvent = (id) => client.get(`/events/${id}`);

/** Create a new event (admin only) */
export const createEvent = (data) => client.post("/events", data);

/** Delete an event (admin only) */
export const deleteEvent = (id) => client.delete(`/events/${id}`);
