import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../api/auth";
import { extractErrorMessage, extractObject } from "../utils/api";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedInUser = await login(formData.email, formData.password);
      if (loggedInUser?.role === "admin") { navigate("/admin"); return; }

      const { data } = await getCurrentUser();
      const currentUser = extractObject(data, ["user", "data"]);
      if (currentUser?.role !== "admin") {
        alert("Access denied. This account doesn't have admin privileges.");
        logout();
      } else {
        navigate("/admin");
      }
    } catch (err) {
      alert(extractErrorMessage(err, "Authentication failed. Please check your credentials."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card admin-auth">
        <header className="auth-card-header">
          <div className="auth-logo-mark" style={{ background: "var(--color-primary-dark)" }}>A</div>
          <h1>Admin access</h1>
          <p>Restricted to chapter coordinators and core committee members. Your account must have admin privileges.</p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form-grid">
          <div className="field-group full-width">
            <label>Admin email</label>
            <input type="email" placeholder="admin@xim.edu.in" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          </div>
          <div className="field-group full-width">
            <label>Password</label>
            <div className="input-with-icon">
              <input type={showPassword ? "text" : "password"} placeholder="Enter admin password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
              <button type="button" className="toggle-pw" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button>
            </div>
          </div>
          <button type="submit" className="auth-submit-btn" disabled={loading}>{loading ? "Verifying..." : "Access dashboard"}</button>
        </form>

        <div className="auth-card-footer">
          <p>Not an admin? <span onClick={() => navigate("/login")}>← Back to sign in</span></p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
