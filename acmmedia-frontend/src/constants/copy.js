/**
 * UX Writing Constants
 * 
 * Centralized UX copy for consistent, accessible messaging across the platform.
 * All strings follow premium SaaS writing standards:
 * - Clear, concise, action-oriented
 * - Sentence case (unless proper noun)
 * - User-focused benefit language
 * - Minimal jargon, maximum clarity
 * 
 * @module constants/copy
 */

export const AUTH = {
  // Registration
  REGISTER: {
    HEADING: "Create your account",
    SUBHEADING: "Join the ACM Student Chapter and connect with tech enthusiasts.",
    LABEL_NAME: "Full name",
    LABEL_EMAIL: "University email",
    LABEL_EMAIL_HINT: "We accept @xim.edu.in and @stu.xim.edu.in addresses only.",
    LABEL_PASSWORD: "Password",
    LABEL_PASSWORD_HINT: "Minimum 6 characters. Mix letters, numbers, and symbols for stronger security.",
    LABEL_PASSWORD_CONFIRM: "Confirm password",
    LABEL_ACM_MEMBER: "Are you an ACM member?",
    LABEL_ACM_ID: "ACM membership ID",
    LABEL_ACM_ID_HINT: "Link your membership to unlock exclusive benefits and networking opportunities.",
    PLACEHOLDER_NAME: "John Doe",
    PLACEHOLDER_EMAIL: "name@stu.xim.edu.in",
    PLACEHOLDER_PASSWORD: "Minimum 6 characters",
    PLACEHOLDER_PASSWORD_CONFIRM: "Re-enter password",
    PLACEHOLDER_ACM_ID: "Your membership ID",
    BUTTON_SUBMIT: "Create Account",
    OPTION_NOT_YET: "Not yet",
    OPTION_YES: "Yes, I am",
    SUCCESS: "Account created! You can now sign in.",
    ERROR_INVALID_EMAIL: "Sign up using your XIM email (@stu.xim.edu.in or @xim.edu.in).",
    ERROR_PASSWORD_SHORT: "Password must be at least 6 characters.",
    ERROR_PASSWORD_MISMATCH: "Passwords do not match. Please try again.",
    ERROR_GENERIC: "We couldn't create your account. Please check your information and try again.",
    LINK_SIGNIN: "Already have an account? Sign in",
    LINK_ADMIN: "Chapter admin? Admin access →",
  },

  // Login
  LOGIN: {
    HEADING: "Welcome back",
    SUBHEADING: "Sign in to access announcements, events, and discussions.",
    LABEL_EMAIL: "Email address",
    LABEL_PASSWORD: "Password",
    PLACEHOLDER_EMAIL: "name@stu.xim.edu.in",
    PLACEHOLDER_PASSWORD: "Enter your password",
    BUTTON_SUBMIT: "Sign In Securely",
    SUCCESS: "Signed in successfully.",
    ERROR_CREDENTIALS: "Email or password is incorrect. Please try again.",
    ERROR_GENERIC: "We couldn't sign you in. Please check your information and try again.",
    LINK_SIGNUP: "Don't have an account? Create account",
    LINK_ADMIN: "Chapter admin? Admin access →",
  },

  // Admin Login
  ADMIN_LOGIN: {
    HEADING: "Admin access",
    SUBHEADING: "Restricted to chapter coordinators and core committee members.",
    LABEL_EMAIL: "Admin email",
    LABEL_PASSWORD: "Password",
    PLACEHOLDER_EMAIL: "admin@xim.edu.in",
    PLACEHOLDER_PASSWORD: "Enter admin password",
    BUTTON_SUBMIT: "Access Admin Panel",
    ERROR_DENIED: "Access denied. This account doesn't have admin privileges.",
    ERROR_CREDENTIALS: "Email or password is incorrect. Please try again.",
    ERROR_GENERIC: "We couldn't verify your admin access. Please try again.",
    LINK_BACK: "Not an admin? ← Back to sign in",
  },

  // Password visibility
  PASSWORD_SHOW: "Show",
  PASSWORD_HIDE: "Hide",
};

export const PROFILE = {
  HEADING: "My profile",
  SUBHEADING: "Manage your account information, avatar, and security settings.",
  
  // Avatar section
  AVATAR_HEADING: "Profile picture",
  AVATAR_BUTTON_UPLOAD: "Upload new photo",
  AVATAR_BUTTON_REMOVE: "Remove picture",
  AVATAR_HINT: "JPEG, PNG, GIF, or WebP. Max 2MB. Square images work best.",
  AVATAR_OVERLAY: "Change",
  AVATAR_UPLOADING: "Uploading...",
  AVATAR_ERROR_SIZE: "Image too large. Please use a file under 2MB.",
  AVATAR_ERROR_GENERIC: "Couldn't upload your photo. Please try again.",
  AVATAR_REMOVED: "Profile picture removed.",
  AVATAR_UPLOADED: "Profile picture updated!",

  // Personal info section
  INFO_HEADING: "Personal information",
  LABEL_NAME: "Full name",
  LABEL_EMAIL: "Email address",
  LABEL_EMAIL_HINT: "Email cannot be changed. Contact support if you need to update it.",
  LABEL_BIO: "Bio",
  LABEL_BIO_PLACEHOLDER: "Tell us about yourself (max 300 characters)",
  LABEL_BIO_HINT: "Share your interests, tech stack, or what you're working on.",
  LABEL_DEPARTMENT: "Department",
  LABEL_DEPARTMENT_PLACEHOLDER: "e.g., Computer Science",
  LABEL_YEAR: "Academic year",
  LABEL_YEAR_PLACEHOLDER: "e.g., 3rd Year",
  LABEL_GITHUB: "GitHub profile",
  LABEL_GITHUB_PLACEHOLDER: "https://github.com/username",
  LABEL_GITHUB_HINT: "Optional. Helps members find collaborators.",
  LABEL_LINKEDIN: "LinkedIn profile",
  LABEL_LINKEDIN_PLACEHOLDER: "https://linkedin.com/in/username",
  LABEL_LINKEDIN_HINT: "Optional. Helps members connect professionally.",
  BUTTON_SAVE: "Save Profile Updates",
  SAVING: "Saving...",
  SAVED: "Profile updated successfully!",

  // Password section
  PASSWORD_HEADING: "Change password",
  PASSWORD_SUBHEADING: "For security, enter your current password to set a new one. You'll be signed out after changing.",
  LABEL_CURRENT: "Current password",
  LABEL_NEW: "New password",
  LABEL_NEW_HINT: "Minimum 6 characters.",
  LABEL_CONFIRM: "Confirm new password",
  PLACEHOLDER_CURRENT: "Enter current password",
  PLACEHOLDER_NEW: "Enter new password (min 6 characters)",
  PLACEHOLDER_CONFIRM: "Re-enter new password",
  BUTTON_CHANGE: "Update Password",
  CHANGING: "Updating...",
  ERROR_MISMATCH: "New passwords do not match.",
  ERROR_SHORT: "New password must be at least 6 characters.",
  ERROR_GENERIC: "Couldn't update your password. Please try again.",
  SUCCESS: "Password updated! Please sign in again.",

  // Account info section
  ACCOUNT_HEADING: "Account details",
  LABEL_ROLE: "Role",
  LABEL_ACM_MEMBER: "ACM member",
  LABEL_ACM_ID: "ACM ID",
  LABEL_JOINED: "Member since",
  ROLE_ADMIN: "Administrator",
  ROLE_MEMBER: "Chapter member",
  MEMBER_YES: "Yes",
  MEMBER_NO: "No",

  // Loading states
  LOADING: "Loading profile...",
  LOADING_AVATAR: "Uploading...",
};

export const HOME = {
  HEADING: "Chapter feed",
  SUBHEADING: "Announcements, achievements, and updates from the ACM Student Chapter.",
  LOADING: "Loading latest updates...",
  EMPTY: "No announcements yet.\n\nCheck back soon or follow us on social media for updates.",
  ERROR: "Couldn't load updates right now. Please try again shortly.",
};

export const EVENTS = {
  HEADING: "Events & workshops",
  SUBHEADING: "Workshops, hackathons, seminars, and technical sessions curated by ACM XIM.",
  EMPTY: "No upcoming events. Follow our social media for announcements or contact us to suggest an event.",
  LABEL_DATE: "Date",
  LABEL_LOCATION: "Location",
  BUTTON_REGISTER: "Register →",
  ERROR_DELETE: "Couldn't delete this event. Please try again.",
  CONFIRM_DELETE: {
    TITLE: "Delete event?",
    MESSAGE: "This action cannot be undone.",
  },
};

export const ADMIN = {
  HEADING: "Dashboard",
  SUBHEADING: "Manage content, monitor engagement, and keep the chapter running smoothly.",

  // Post creation
  POST_HEADING: "Publish announcement",
  POST_DESCRIPTION: "Create updates that appear on the chapter feed for all members.",
  POST_LABEL_TITLE: "Announcement title",
  POST_LABEL_CONTENT: "Write your announcement",
  POST_PLACEHOLDER_TITLE: "e.g., Hackathon Winners Announced",
  POST_PLACEHOLDER_CONTENT: "Add event details, results, wins, or key announcements here...",
  POST_BUTTON: "Publish Announcement",
  POST_PUBLISHING: "Publishing...",
  POST_SUCCESS: "Post published successfully!",
  POST_ERROR: "Couldn't publish post. Please try again.",

  // Event creation
  EVENT_HEADING: "Schedule event",
  EVENT_DESCRIPTION: "Add upcoming workshops, hackathons, or technical sessions.",
  EVENT_LABEL_TITLE: "Event name",
  EVENT_LABEL_DATE: "Date",
  EVENT_LABEL_LOCATION: "Location or mode",
  EVENT_LABEL_LINK: "Registration link",
  EVENT_LABEL_DESCRIPTION: "Description & details",
  EVENT_PLACEHOLDER_TITLE: "e.g., React Workshop",
  EVENT_PLACEHOLDER_LOCATION: "e.g., Classroom 301 or Virtual/Zoom",
  EVENT_PLACEHOLDER_LINK: "Paste registration URL (optional)",
  EVENT_PLACEHOLDER_DESCRIPTION: "Add event details: agenda, speakers, eligibility, prerequisites, or requirements...",
  EVENT_BUTTON: "Schedule Event",
  EVENT_CREATING: "Creating...",
  EVENT_SUCCESS: "Event created successfully!",
  EVENT_ERROR: "Couldn't create event. Please try again.",

  // Content moderation
  MODERATION_HEADING: "Content moderation",
  MODERATION_DESCRIPTION: "Manage posts, moderate discussions, and remove content from the feed.",
  MODERATION_BUTTON: "← View feed",

  // Analytics
  ANALYTICS_HEADING: "Platform overview",
  ANALYTICS_SUBHEADING: "A summary of platform engagement and user activity.",
  ANALYTICS_SYNCING: "Synchronizing analytics...",
  ANALYTICS_USERS: "Total Users",
  ANALYTICS_POSTS: "Total Posts",
  ANALYTICS_COMMENTS: "Total Comments",
  ANALYTICS_LIKES: "Total Likes",
};

export const FORUM = {
  HEADING: "Discussions",
  SUBHEADING: "Ask questions, share insights, and collaborate with fellow members.",
  NEW_THREAD_HEADING: "Start a discussion",
  LABEL_TITLE: "Discussion title",
  LABEL_DESCRIPTION: "What's on your mind?",
  PLACEHOLDER_TITLE: "e.g., How to prepare for Google interviews?",
  PLACEHOLDER_DESCRIPTION: "Provide background, context, and be specific with your question...",
  BUTTON_CREATE: "Start Discussion",
  EMPTY: "No discussions started yet. Be the first to ask a question or share an insight with the community.",
  LABEL_REPLIES: "Replies",
  REPLIES_NONE: "No responses yet. Be the first to share your thoughts.",
  PLACEHOLDER_REPLY: "Share your thoughts...",
  CONFIRM_DELETE: {
    TITLE: "Delete discussion?",
    MESSAGE: "This action cannot be undone. All replies will be removed.",
  },
  ERROR_CREATE: "Couldn't create discussion. Please try again.",
  ERROR_DELETE: "Couldn't delete discussion. Please try again.",
  ERROR_REPLY: "Couldn't add reply. Please try again.",
};

export const POSTS = {
  BUTTON_LIKE: "Like",
  BUTTON_COMMENTS: "Comments",
  BUTTON_DELETE: "Delete",
  PROMPT_LOGIN: "Please sign in to like posts and join the discussion.",
  CONFIRM_DELETE: {
    TITLE: "Delete post?",
    MESSAGE: "This action cannot be undone.",
  },
  COMMENTS_HEADING: "Comments",
  COMMENTS_EMPTY: "No comments yet. Be the first to share your thoughts.",
  COMMENTS_LOADING: "Loading comments...",
  COMMENTS_PLACEHOLDER: "Share your thoughts...",
  COMMENTS_BUTTON: "Comment",
  COMMENTS_LOGIN_PROMPT: "Please sign in to participate in this discussion.",
  CONFIRM_DELETE_COMMENT: {
    TITLE: "Remove comment?",
    MESSAGE: "This will be permanently deleted.",
  },
  ERROR_DELETE: "Couldn't delete post. Please try again.",
  ERROR_DELETE_COMMENT: "Couldn't remove comment. Please try again.",
};

export const FORM = {
  // Validation
  REQUIRED: "*Required",
  OPTIONAL: "(Optional)",
  ERROR_GENERIC: "This field is required.",
  ERROR_EMAIL: "Please enter a valid email address.",
  ERROR_URL: "Please enter a valid URL.",
  ERROR_MIN_LENGTH: (min) => `Must be at least ${min} characters.`,
  ERROR_MAX_LENGTH: (max) => `Must be no more than ${max} characters.`,

  // States
  SAVING: "Saving...",
  SUBMITTING: "Submitting...",
  LOADING: "Loading...",
  SAVED: "Saved successfully!",
  SUBMITTED: "Submitted successfully!",

  // Helpers
  CHAR_COUNT: (current, max) => `${current}/${max}`,
  CHAR_REMAINING: (remaining) => `${remaining} characters remaining`,
};

export const ERRORS = {
  NETWORK: "Check your connection and try again.",
  TIMEOUT: "Request took too long. Please try again.",
  FORBIDDEN: "You don't have permission to perform this action.",
  NOT_FOUND: "This item doesn't exist or has been removed.",
  SERVER: "Something went wrong on our end. Please try again shortly.",
  GENERIC: "Something unexpected happened. Please try again.",
  RETRY: "Try again",
  CONTACT_SUPPORT: "Contact support",
};

export const BUTTONS = {
  // Primary actions
  SUBMIT: "Submit",
  SAVE: "Save",
  CANCEL: "Cancel",
  DELETE: "Delete",
  REMOVE: "Remove",
  CONFIRM: "Confirm",
  CLOSE: "Close",
  BACK: "Go Back",
  NEXT: "Next",
  CONTINUE: "Continue",
  
  // Loading states
  LOADING_SUFFIX: "...",
};

export const CONFIRMATIONS = {
  DELETE_POST: {
    TITLE: "Delete this post?",
    MESSAGE: "This action cannot be undone. All comments will be removed.",
    CONFIRM: "Delete post",
    CANCEL: "Keep post",
    isDanger: true,
  },
  DELETE_COMMENT: {
    TITLE: "Remove this comment?",
    MESSAGE: "This will be permanently deleted.",
    CONFIRM: "Remove comment",
    CANCEL: "Cancel",
    isDanger: true,
  },
  DELETE_EVENT: {
    TITLE: "Delete this event?",
    MESSAGE: "This action cannot be undone.",
    CONFIRM: "Delete event",
    CANCEL: "Keep event",
    isDanger: true,
  },
  DELETE_THREAD: {
    TITLE: "Delete this discussion?",
    MESSAGE: "All replies will be removed. This cannot be undone.",
    CONFIRM: "Delete discussion",
    CANCEL: "Keep discussion",
    isDanger: true,
  },
  REMOVE_AVATAR: {
    TITLE: "Remove profile picture?",
    MESSAGE: "You can upload a new one anytime.",
    CONFIRM: "Remove picture",
    CANCEL: "Keep picture",
    isDanger: true,
  },
};

export const EMPTY_STATES = {
  POSTS: {
    title: "No announcements yet",
    message: "Check back soon or follow our social media for updates.",
  },
  EVENTS: {
    title: "No upcoming events",
    message: "Follow us on social media for announcements or suggest an event.",
  },
  FORUM: {
    title: "Start the conversation",
    message: "Be the first to ask a question or share an insight.",
  },
  COMMENTS: {
    title: "No comments yet",
    message: "Be the first to share your thoughts.",
  },
};
