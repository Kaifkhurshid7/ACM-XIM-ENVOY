/**
 * Authentication API V2 - Client
 * 
 * Complete authentication system endpoints with:
 * - Registration with email verification
 * - Email verification flow
 * - Secure password reset
 * - Login with session management
 * - Session and security management
 * - Login history
 * 
 * All requests include error handling and response parsing.
 * 
 * @module api/authV2
 */

import api from "./client";

const BASE_URL = "/api/v1/auth/v2";

// ────────────────────────────────────────────────────────────────────────────
// Registration & Email Verification
// ────────────────────────────────────────────────────────────────────────────

export const register = (email, password, name, confirmPassword) =>
  api.post(`${BASE_URL}/register`, {
    email,
    password,
    name,
    confirmPassword,
  });

export const verifyEmail = (email, token) =>
  api.post(`${BASE_URL}/verify-email`, {
    email,
    token,
  });

export const resendVerificationEmail = (email) =>
  api.post(`${BASE_URL}/resend-verification`, {
    email,
  });

// ────────────────────────────────────────────────────────────────────────────
// Password Management
// ────────────────────────────────────────────────────────────────────────────

export const forgotPassword = (email) =>
  api.post(`${BASE_URL}/forgot-password`, {
    email,
  });

export const resetPassword = (email, token, newPassword, confirmPassword) =>
  api.post(`${BASE_URL}/reset-password`, {
    email,
    token,
    newPassword,
    confirmPassword,
  });

export const changePassword = (currentPassword, newPassword, confirmPassword) =>
  api.post(`${BASE_URL}/change-password`, {
    currentPassword,
    newPassword,
    confirmPassword,
  });

// ────────────────────────────────────────────────────────────────────────────
// Authentication
// ────────────────────────────────────────────────────────────────────────────

export const login = (email, password) =>
  api.post(`${BASE_URL}/login`, {
    email,
    password,
  });

export const logout = () =>
  api.post(`${BASE_URL}/logout`);

export const logoutAllDevices = () =>
  api.post(`${BASE_URL}/logout-all`);

export const getCurrentUser = () =>
  api.get(`${BASE_URL}/me`);

// ────────────────────────────────────────────────────────────────────────────
// Session & Security
// ────────────────────────────────────────────────────────────────────────────

export const getSessions = () =>
  api.get(`${BASE_URL}/sessions`);

export const revokeSession = (sessionId) =>
  api.delete(`${BASE_URL}/sessions/${sessionId}`);

export const getLoginHistory = (page = 1, limit = 10) =>
  api.get(`${BASE_URL}/login-history`, {
    params: { page, limit },
  });

export const getSecurityLogs = (page = 1, limit = 10) =>
  api.get(`${BASE_URL}/security-logs`, {
    params: { page, limit },
  });

export default {
  // Registration
  register,
  verifyEmail,
  resendVerificationEmail,

  // Password
  forgotPassword,
  resetPassword,
  changePassword,

  // Auth
  login,
  logout,
  logoutAllDevices,
  getCurrentUser,

  // Sessions
  getSessions,
  revokeSession,
  getLoginHistory,
  getSecurityLogs,
};
