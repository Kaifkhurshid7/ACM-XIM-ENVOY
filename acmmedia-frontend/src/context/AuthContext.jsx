/**
 * Authentication Context
 * 
 * Provides global authentication state management for the application.
 * Handles login, logout, session persistence, and user profile loading.
 * 
 * Flow:
 * 1. On mount: Checks localStorage for existing JWT token
 * 2. If token exists: Fetches user profile from /auth/me
 * 3. On login: Stores token, fetches profile, updates state
 * 4. On logout: Clears token and user state
 * 
 * The loading state prevents flash of unauthenticated content
 * while the initial session check is in progress.
 * 
 * @module context/AuthContext
 */

import React, { createContext, useState, useEffect } from "react";
import * as authApi from "../api/auth";
import { extractObject, extractToken } from "../utils/api";

export const AuthContext = createContext();

/** Convenience hook for consuming auth context */
export const useAuth = () => React.useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verify existing session on app mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const { data } = await authApi.getCurrentUser();
          setUser(extractObject(data, ["user", "data"]));
        } catch (err) {
          // Token expired or invalid - clear it
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  /**
   * Authenticates user with email/password.
   * Stores JWT token and fetches full user profile.
   * 
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {object} Authenticated user object
   */
  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password });
    const token = extractToken(data);

    if (!token) {
      throw new Error("Login succeeded but no token was returned.");
    }

    localStorage.setItem("token", token);

    try {
      const { data: me } = await authApi.getCurrentUser();
      const normalizedUser = extractObject(me, ["user", "data"]);
      setUser(normalizedUser);
      return normalizedUser;
    } catch (err) {
      // Fallback: use data from login response if /me fails
      const fallbackUser = extractObject(data, ["user", "data"]) || { token };
      setUser(fallbackUser);
      return fallbackUser;
    }
  };

  /** Clears authentication state and removes stored token */
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
