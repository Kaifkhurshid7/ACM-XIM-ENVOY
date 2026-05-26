/**
 * Admin Login Page
 * 
 * Restricted authentication page for chapter coordinators and
 * core committee members with admin privileges.
 * 
 * Security Flow:
 * 1. User submits credentials
 * 2. Login API returns JWT token
 * 3. Verify user role is "admin" via /auth/me
 * 4. If not admin → logout and deny access
 * 5. If admin → redirect to admin dashboard
 * 
 * @page
 */

import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../api/auth";
import { extractErrorMessage, extractObject } from "../utils/api";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loggedInUser = await login(formData.email, formData.password);

      // Fast path: if login response already contains role
      if (loggedInUser?.role === "admin") {
        navigate("/admin");
        return;
      }

      // Verify admin role via profile endpoint
      const { data } = await getCurrentUser();
      const currentUser = extractObject(data, ["user", "data"]);

      if (currentUser?.role !== "admin") {
        alert("Access Denied: Administrative privileges required.");
        logout();
      } else {
        navigate("/admin");
      }
    } catch (err) {
      console.error(err);
      alert(extractErrorMessage(err, "Admin login failed. Please verify your credentials."));
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-bg"></div>
      <div className="auth-card admin-auth">
        <header>
          <h1>Admin Portal</h1>
          <h3>ACM-XIM-ENVOY • ACM XIM Student Chapter</h3>
          <p>
            This section is restricted to officially appointed ACM chapter
            coordinators and core committee members. All access attempts
            are authenticated and monitored.
          </p>
          <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
            Admin registration is not available on the public signup form.
            Your account must already be approved with admin role before you can sign in here.
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Administrator Email Address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Administrator Security Key"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button type="submit">Authenticate & Access Dashboard</button>
        </form>

        <div className="auth-divider"><span></span></div>

        <div className="auth-footer">
          <p style={{ fontSize: "0.8rem" }}>
            ⚠ Unauthorized access is strictly prohibited.
            If you believe you should have admin access, please contact the ACM XIM CORE TEAM.
          </p>
          <span onClick={() => navigate("/login")} style={{ marginTop: "0.6rem", display: "inline-block" }}>
            ← Return to Student Login
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
