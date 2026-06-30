/**
 * Profile API V2 - Client
 * 
 * Complete profile management endpoints with:
 * - Profile CRUD operations
 * - File uploads (avatar, banner)
 * - Bookmark system
 * - Achievement tracking
 * - Privacy and notification settings
 * 
 * All requests include error handling and response parsing.
 * 
 * @module api/profileV2
 */

import api from "./client";

const BASE_URL = "/api/v1/profile/v2";

// ────────────────────────────────────────────────────────────────────────────
// Profile Retrieval
// ────────────────────────────────────────────────────────────────────────────

export const getCurrentProfile = () =>
  api.get(BASE_URL);

export const getPublicProfile = (username) =>
  api.get(`${BASE_URL}/${username}`);

export const getProfileStats = () =>
  api.get(`${BASE_URL}/stats/summary`);

// ────────────────────────────────────────────────────────────────────────────
// Profile Update
// ────────────────────────────────────────────────────────────────────────────

export const updateProfile = (profileData) =>
  api.patch(BASE_URL, profileData);

export const updatePrivacy = (privacySettings) =>
  api.patch(`${BASE_URL}/privacy`, privacySettings);

export const updateNotifications = (notificationSettings) =>
  api.patch(`${BASE_URL}/notifications`, notificationSettings);

// ────────────────────────────────────────────────────────────────────────────
// File Uploads
// ────────────────────────────────────────────────────────────────────────────

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return api.post(`${BASE_URL}/avatar`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const uploadBanner = (file) => {
  const formData = new FormData();
  formData.append("banner", file);
  return api.post(`${BASE_URL}/banner`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteAvatar = () =>
  api.delete(`${BASE_URL}/avatar`);

export const deleteBanner = () =>
  api.delete(`${BASE_URL}/banner`);

// ────────────────────────────────────────────────────────────────────────────
// Bookmarks - Posts
// ────────────────────────────────────────────────────────────────────────────

export const addPostBookmark = (postId) =>
  api.post(`${BASE_URL}/bookmarks/post/${postId}`);

export const removePostBookmark = (postId) =>
  api.delete(`${BASE_URL}/bookmarks/post/${postId}`);

// ────────────────────────────────────────────────────────────────────────────
// Bookmarks - Discussions
// ────────────────────────────────────────────────────────────────────────────

export const addDiscussionBookmark = (discussionId) =>
  api.post(`${BASE_URL}/bookmarks/discussion/${discussionId}`);

export const removeDiscussionBookmark = (discussionId) =>
  api.delete(`${BASE_URL}/bookmarks/discussion/${discussionId}`);

// ────────────────────────────────────────────────────────────────────────────
// Bookmarks - Events
// ────────────────────────────────────────────────────────────────────────────

export const addEventBookmark = (eventId) =>
  api.post(`${BASE_URL}/bookmarks/event/${eventId}`);

export const removeEventBookmark = (eventId) =>
  api.delete(`${BASE_URL}/bookmarks/event/${eventId}`);

// ────────────────────────────────────────────────────────────────────────────
// Bookmarks - External Articles
// ────────────────────────────────────────────────────────────────────────────

export const addArticleBookmark = (url, title) =>
  api.post(`${BASE_URL}/bookmarks/article`, {
    url,
    title,
  });

export const removeArticleBookmark = (url) =>
  api.delete(`${BASE_URL}/bookmarks/article`, {
    data: { url },
  });

// ────────────────────────────────────────────────────────────────────────────
// Bookmarks - Retrieval
// ────────────────────────────────────────────────────────────────────────────

export const getAllBookmarks = (type = "all", page = 1, limit = 10) =>
  api.get(`${BASE_URL}/bookmarks/all`, {
    params: { type, page, limit },
  });

export const getPostBookmarks = (page = 1, limit = 10) =>
  api.get(`${BASE_URL}/bookmarks/all`, {
    params: { type: "posts", page, limit },
  });

export const getDiscussionBookmarks = (page = 1, limit = 10) =>
  api.get(`${BASE_URL}/bookmarks/all`, {
    params: { type: "discussions", page, limit },
  });

export const getEventBookmarks = (page = 1, limit = 10) =>
  api.get(`${BASE_URL}/bookmarks/all`, {
    params: { type: "events", page, limit },
  });

export const getArticleBookmarks = (page = 1, limit = 10) =>
  api.get(`${BASE_URL}/bookmarks/all`, {
    params: { type: "articles", page, limit },
  });

// ────────────────────────────────────────────────────────────────────────────
// Achievements
// ────────────────────────────────────────────────────────────────────────────

export const getAchievements = () =>
  api.get(`${BASE_URL}/achievements`);

export default {
  // Profile retrieval
  getCurrentProfile,
  getPublicProfile,
  getProfileStats,

  // Profile updates
  updateProfile,
  updatePrivacy,
  updateNotifications,

  // File uploads
  uploadAvatar,
  uploadBanner,
  deleteAvatar,
  deleteBanner,

  // Bookmarks - posts
  addPostBookmark,
  removePostBookmark,

  // Bookmarks - discussions
  addDiscussionBookmark,
  removeDiscussionBookmark,

  // Bookmarks - events
  addEventBookmark,
  removeEventBookmark,

  // Bookmarks - articles
  addArticleBookmark,
  removeArticleBookmark,

  // Bookmarks - retrieval
  getAllBookmarks,
  getPostBookmarks,
  getDiscussionBookmarks,
  getEventBookmarks,
  getArticleBookmarks,

  // Achievements
  getAchievements,
};
