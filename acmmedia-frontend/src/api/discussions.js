/**
 * Discussions API Module
 *
 * Provides client-side API wrappers for the community discussions feature.
 * Functions use enterprise naming and map to the backend ` /api/v1/discussions ` endpoints.
 */

import client from "./client";

/** Fetch all discussion threads */
export const fetchDiscussions = () => client.get("/discussions");

/** Create a new discussion thread */
export const createDiscussion = (payload) => client.post("/discussions", payload);

/** Remove a discussion thread (admin only) */
export const removeDiscussion = (id) => client.delete(`/discussions/${id}`);

/** Reply to a discussion thread */
export const replyToDiscussion = (id, payload) => client.post(`/discussions/reply/${id}`, payload);
