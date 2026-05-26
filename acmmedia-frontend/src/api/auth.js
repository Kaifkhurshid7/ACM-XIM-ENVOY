/**
 * Authentication API Module
 * 
 * Handles all auth-related API calls: login, registration,
 * and session verification.
 * 
 * @module api/auth
 */

import client from "./client";

/** Authenticate user and receive JWT token */
export const login = (formData) => client.post("/auth/login", formData);

/** Register a new user account */
export const signup = (formData) => client.post("/auth/register", formData);

/** Verify current session and get user profile */
export const getCurrentUser = () => client.get("/auth/me");
