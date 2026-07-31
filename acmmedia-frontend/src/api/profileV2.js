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

const BASE_URL_V2 = "/profile/v2";
const BASE_URL_V1 = "/profile";

// ────────────────────────────────────────────────────────────────────────────
// Profile Retrieval (with v1 fallback for deployed backends without v2)
// ────────────────────────────────────────────────────────────────────────────

export const getCurrentProfile = async () => {
  try {
    const res = await api.get(BASE_URL_V2);
    return res;
  } catch (err) {
    // If v2 endpoint doesn't exist on the backend, fall back to v1
    if (err.response?.status === 404 || err.response?.data?.message?.includes("route not found")) {
      const res = await api.get(BASE_URL_V1);
      // Normalize v1 response shape to match what ModernProfile expects
      return {
        data: {
          user: res.data,
          profileCompletion: { percentage: 0, suggestions: [] },
        },
      };
    }
    throw err;
  }
};

export const getPublicProfile = (username) =>
  api.get(`${BASE_URL_V2}/${username}`).catch(() =>
    api.get(`${BASE_URL_V1}/${username}`)
  );

// ────────────────────────────────────────────────────────────────────────────
// Profile Update
// ────────────────────────────────────────────────────────────────────────────

export const updateProfile = (profileData) =>
  api.patch(BASE_URL_V2, profileData).catch(() =>
    api.patch(BASE_URL_V1, profileData)
  );

export const updatePrivacy = (privacySettings) =>
  api.patch(`${BASE_URL_V2}/privacy`, privacySettings);

export const updateNotifications = (notificationSettings) =>
  api.patch(`${BASE_URL_V2}/notifications`, notificationSettings);

// ────────────────────────────────────────────────────────────────────────────
// File Uploads
// ────────────────────────────────────────────────────────────────────────────

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return api.post(`${BASE_URL_V2}/avatar`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).catch(() =>
    api.post(`${BASE_URL_V1}/avatar`, formData)
  );
};

export const uploadBanner = (file) => {
  const formData = new FormData();
  formData.append("banner", file);
  return api.post(`${BASE_URL_V2}/banner`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteAvatar = () =>
  api.delete(`${BASE_URL_V2}/avatar`).catch(() =>
    api.delete(`${BASE_URL_V1}/avatar`)
  );

export const deleteBanner = () =>
  api.delete(`${BASE_URL_V2}/banner`);

// ────────────────────────────────────────────────────────────────────────────
// Bookmarks - Posts
// ────────────────────────────────────────────────────────────────────────────

export const addPostBookmark = (postId) =>
  api.post(`${BASE_URL_V2}/bookmarks/post/${postId}`);

export const removePostBookmark = (postId) =>
  api.delete(`${BASE_URL_V2}/bookmarks/post/${postId}`);

// ────────────────────────────────────────────────────────────────────────────
// Bookmarks - Discussions
// ────────────────────────────────────────────────────────────────────────────

export const addDiscussionBookmark = (discussionId) =>
  api.post(`${BASE_URL_V2}/bookmarks/discussion/${discussionId}`);

export const removeDiscussionBookmark = (discussionId) =>
  api.delete(`${BASE_URL_V2}/bookmarks/discussion/${discussionId}`);

// ────────────────────────────────────────────────────────────────────────────
// Bookmarks - Events
// ────────────────────────────────────────────────────────────────────────────

export const addEventBookmark = (eventId) =>
  api.post(`${BASE_URL_V2}/bookmarks/event/${eventId}`);

export const removeEventBookmark = (eventId) =>
  api.delete(`${BASE_URL_V2}/bookmarks/event/${eventId}`);

// ────────────────────────────────────────────────────────────────────────────
// Bookmarks - External Articles
// ────────────────────────────────────────────────────────────────────────────

export const addArticleBookmark = (url, title) =>
  api.post(`${BASE_URL_V2}/bookmarks/article`, {
    url,
    title,
  });

export const removeArticleBookmark = (url) =>
  api.delete(`${BASE_URL_V2}/bookmarks/article`, {
    data: { url },
  });

// ────────────────────────────────────────────────────────────────────────────
// Bookmarks - Retrieval
// ────────────────────────────────────────────────────────────────────────────

export const getAllBookmarks = (type = "all", page = 1, limit = 10) =>
  api.get(`${BASE_URL_V2}/bookmarks/all`, {
    params: { type, page, limit },
  });

export const getPostBookmarks = (page = 1, limit = 10) =>
  api.get(`${BASE_URL_V2}/bookmarks/all`, {
    params: { type: "posts", page, limit },
  });

export const getDiscussionBookmarks = (page = 1, limit = 10) =>
  api.get(`${BASE_URL_V2}/bookmarks/all`, {
    params: { type: "discussions", page, limit },
  });

export const getEventBookmarks = (page = 1, limit = 10) =>
  api.get(`${BASE_URL_V2}/bookmarks/all`, {
    params: { type: "events", page, limit },
  });

export const getArticleBookmarks = (page = 1, limit = 10) =>
  api.get(`${BASE_URL_V2}/bookmarks/all`, {
    params: { type: "articles", page, limit },
  });

// ────────────────────────────────────────────────────────────────────────────
// Achievements
// ────────────────────────────────────────────────────────────────────────────

export const getAchievements = () =>
  api.get(`${BASE_URL_V2}/achievements`);

export default {
  // Profile retrieval
  getCurrentProfile,
  getPublicProfile,

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
