// Register page - new student account creation
import React, { useState } from "react";
import { signup } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { extractErrorMessage } from "../utils/api";
import { ALLOWED_DOMAINS } from "../constants";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    isAcmMember: "no", acmId: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validations
    const emailLower = formData.email.toLowerCase();
    const isValidDomain = ALLOWED_DOMAINS.some((d) => emailLower.endsWith(d));
    if (!isValidDomain) {
      alert("Please use your official university email (@stu.xim.edu.in or @xim.edu.in).");
      return;
    }
    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await signup({ name: formData.name.trim(), email: emailLower, password: formData.password });
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      alert(extractErrorMessage(err, "Registration failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card register-card">
        <header className="auth-card-header">
          <div className="auth-logo-mark">E</div>
          <h1>Create Account</h1>
          <p>Join the ACM Student Chapter community. Use your official university email to register.</p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form-grid">
          {/* Personal Info */}
          <div className="field-group full-width">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="e.g. Kaif Khurshid"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="field-group full-width">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@stu.xim.edu.in"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <span className="form-hint">Only @xim.edu.in and @stu.xim.edu.in accepted</span>
          </div>

          <div className="field-row">
            <div className="field-group">
              <label>Password</label>
              <div className="input-with-icon">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
                <button type="button" className="toggle-pw" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div className="field-group">
              <label>Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>

          {/* ACM Membership */}
          <div className="field-row">
            <div className="field-group">
              <label>ACM Member?</label>
              <select
                value={formData.isAcmMember}
                onChange={(e) => setFormData({ ...formData, isAcmMember: e.target.value })}
              >
                <option value="no">No, not yet</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            {formData.isAcmMember === "yes" && (
              <div className="field-group">
                <label>ACM ID</label>
                <input
                  type="text"
                  placeholder="Membership ID"
                  value={formData.acmId}
                  onChange={(e) => setFormData({ ...formData, acmId: e.target.value })}
                />
              </div>
            )}
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-card-footer">
          <p>Already have an account? <span onClick={() => navigate("/login")}>Sign in</span></p>
          <p className="auth-footer-alt">Admin? <span onClick={() => navigate("/admin-login")}>Admin portal →</span></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
