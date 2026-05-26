/**
 * Frontend Application Constants
 * 
 * Centralized location for all configuration values, magic strings,
 * and shared constants used across the React application.
 * 
 * @module constants
 */

/** User roles - must match backend role values */
export const ROLES = Object.freeze({
  ADMIN: "admin",
  MEMBER: "member",
});

/** Allowed email domains for registration validation */
export const ALLOWED_DOMAINS = Object.freeze([
  "@xim.edu.in",
  "@stu.xim.edu.in",
]);

/** Navigation routes */
export const ROUTES = Object.freeze({
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORUM: "/forum",
  EVENTS: "/events",
  NEWS: "/news",
  ADMIN: "/admin",
  ADMIN_LOGIN: "/admin-login",
});

/** Socket.IO event names - must match backend events */
export const SOCKET_EVENTS = Object.freeze({
  POST_LIKE_UPDATE: "post:like-update",
  FORUM_NEW_REPLY: "forum:new-reply",
  ANALYTICS_UPDATE: "analytics:update",
  ANALYTICS_REQUEST: "analytics:request",
});
