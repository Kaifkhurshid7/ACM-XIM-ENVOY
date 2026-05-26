/**
 * Forum API Module
 * 
 * Operations for discussion threads and replies.
 * 
 * @module api/forum
 */

import client from "./client";

/** Fetch all forum threads */
export const fetchThreads = () => client.get("/forum");

/** Create a new discussion thread */
export const createThread = (data) => client.post("/forum", data);

/** Delete a thread (admin only) */
export const deleteThread = (id) => client.delete(`/forum/${id}`);

/** Add a reply to an existing thread */
export const replyToThread = (id, data) => client.post(`/forum/reply/${id}`, data);
