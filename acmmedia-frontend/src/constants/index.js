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
  FORUM: "/discussions",
  EVENTS: "/events",
  NEWS: "/news",
  ADMIN: "/admin",
  ADMIN_LOGIN: "/admin-login",
  PROFILE: "/profile",
});

// Must match backend src/constants/index.js SOCKET_EVENTS exactly
export const SOCKET_EVENTS = Object.freeze({
  POST_LIKE_UPDATE: "post:like-update",
  DISCUSSION_CREATED: "discussions:created",
  DISCUSSION_NEW_REPLY: "discussions:new-reply",
  DISCUSSION_UPDATED: "discussions:updated",
  DISCUSSION_LIKE_UPDATE: "discussions:like-update",
  DISCUSSION_REPLY_LIKE_UPDATE: "discussions:reply-like-update",
  DISCUSSION_TYPING: "discussions:typing",
  DISCUSSION_ONLINE_UPDATE: "discussions:online-update",
  NOTIFICATION_CREATED: "notifications:created",
  FORUM_NEW_REPLY: "discussions:new-reply",
  ANALYTICS_UPDATE: "platform:analytics-update",
  ANALYTICS_REQUEST: "platform:analytics-request",
});

export const DISCUSSION_CATEGORIES = Object.freeze([
  "Web Development",
  "AI/ML",
  "Competitive Programming",
  "Placement Preparation",
  "Hackathons",
  "General Discussion",
  "College Queries",
  "ACM Events",
  "Research",
  "Open Source",
]);
