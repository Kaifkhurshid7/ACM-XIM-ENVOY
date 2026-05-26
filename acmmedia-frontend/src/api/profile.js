/**
 * Profile API Module
 * 
 * Handles user profile management: fetching, updating,
 * avatar upload, and password changes.
 * 
 * @module api/profile
 */

import client from "./client";

/** Fetch current user's full profile */
export const getProfile = () => client.get("/profile");

/** Update profile fields (name, bio, department, year, github, linkedin) */
export const updateProfile = (data) => client.patch("/profile", data);

/** Upload profile avatar image (multipart form data) */
export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return client.post("/profile/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/** Remove profile avatar */
export const removeAvatar = () => client.delete("/profile/avatar");

/** Change password (requires current + new + confirm) */
export const changePassword = (data) => client.post("/profile/password", data);
