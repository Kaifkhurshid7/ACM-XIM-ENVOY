/**
 * Comments API Module
 * 
 * Operations for post comments/discussions.
 * 
 * @module api/comments
 */

import client from "./client";

/** Fetch all comments for a specific post */
export const fetchComments = (postId) => client.get(`/comments/${postId}`);

/** Add a comment to a post (authenticated users) */
export const addComment = (data) => client.post("/comments", data);

/** Delete a comment (admin only) */
export const deleteComment = (id) => client.delete(`/comments/${id}`);
