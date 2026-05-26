// Admin login - restricted access for chapter coordinators
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

      if (loggedInUser?.role === "admin") {
        navigate("/admin");
        return;
      }

      // Verify role via profile endpoint
      const { data } = await getCurrentUser();
      const currentUser = extractObject(data, ["user", "data"]);

      if (currentUser?.role !== "admin") {
        alert("Access Denied: Administrative privileges required.");
        logout();
      } else {
        navigate("/admin");
      }
    } catch (err) {
      alert(extractErrorMessage(err, "Admin login failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card admin-auth">
        <header className="auth-card-header">
          <div className="auth-logo-mark" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>A</div>
          <h1>Admin Portal</h1>
          <p>Restricted to ACM chapter coordinators and core committee members. Your account must have admin privileges.</p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form-grid">
          <div className="field-group full-width">
            <label>Administrator Email</label>
            <input
              type="email"
              placeholder="admin@xim.edu.in"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="field-group full-width">
            <label>Password</label>
            <div className="input-with-icon">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter admin password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button type="button" className="toggle-pw" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Authenticating..." : "Access Dashboard"}
          </button>
        </form>

        <div className="auth-card-footer">
          <p>Not an admin? <span onClick={() => navigate("/login")}>← Student login</span></p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
