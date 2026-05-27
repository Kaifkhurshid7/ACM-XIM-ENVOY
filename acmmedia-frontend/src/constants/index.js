// Frontend constants — must match backend values

export const ROLES = Object.freeze({
  ADMIN: "admin",
  MEMBER: "member",
});

export const ALLOWED_DOMAINS = Object.freeze([
  "@xim.edu.in",
  "@stu.xim.edu.in",
]);

export const ROUTES = Object.freeze({
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORUM: "/forum",
  EVENTS: "/events",
  NEWS: "/news",
  ADMIN: "/admin",
  ADMIN_LOGIN: "/admin-login",
  PROFILE: "/profile",
});

// Must match backend src/constants/index.js SOCKET_EVENTS exactly
export const SOCKET_EVENTS = Object.freeze({
  POST_LIKE_UPDATE: "post:like-update",
  FORUM_NEW_REPLY: "forum:new-reply",
  ANALYTICS_UPDATE: "analytics:update",
  ANALYTICS_REQUEST: "analytics:request",
});
