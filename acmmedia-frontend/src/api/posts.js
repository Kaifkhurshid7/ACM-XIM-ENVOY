/**
 * Posts API Module
 * 
 * CRUD operations for chapter news/announcement posts.
 * 
 * @module api/posts
 */

import client from "./client";

/** Fetch all posts (sorted newest first by backend) */
export const fetchPosts = () => client.get("/posts");

/** Create a new post (admin only) */
export const createPost = (data) => client.post("/posts", data);

/** Toggle like on a post (authenticated users) */
export const likePost = (id) => client.put(`/posts/like/${id}`);

/** Delete a post (admin only) */
export const deletePost = (id) => client.delete(`/posts/${id}`);
