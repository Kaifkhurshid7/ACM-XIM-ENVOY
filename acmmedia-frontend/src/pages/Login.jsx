import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { extractErrorMessage } from "../utils/api";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate("/");
    } catch (err) {
      alert(extractErrorMessage(err, "The credentials you entered are incorrect. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <header className="auth-card-header">
          <div className="auth-logo-mark">E</div>
          <h1>Welcome back</h1>
          <p>Sign in to access chapter updates, events, and discussions.</p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form-grid">
          <div className="field-group full-width">
            <label>Email address</label>
            <input
              type="email"
              placeholder="you@stu.xim.edu.in"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              autoComplete="email"
            />
          </div>

          <div className="field-group full-width">
            <label>Password</label>
            <div className="input-with-icon">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                autoComplete="current-password"
              />
              <button type="button" className="toggle-pw" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="auth-card-footer">
          <p>Don't have an account? <span onClick={() => navigate("/register")}>Create account</span></p>
          <p className="auth-footer-alt">Chapter admin? <span onClick={() => navigate("/admin-login")}>Admin access →</span></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
