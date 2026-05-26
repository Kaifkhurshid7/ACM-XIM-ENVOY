/**
 * ProtectedRoute Component
 * 
 * Higher-order component for route-level access control.
 * Redirects unauthenticated users to login and unauthorized
 * users (wrong role) to the home page.
 * 
 * Usage:
 *   <Route path="/admin" element={
 *     <ProtectedRoute roles={["admin"]}>
 *       <Admin />
 *     </ProtectedRoute>
 *   } />
 * 
 * @component
 * @param {React.ReactNode} children - Component to render if authorized
 * @param {string[]} roles - Optional array of allowed roles
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;
