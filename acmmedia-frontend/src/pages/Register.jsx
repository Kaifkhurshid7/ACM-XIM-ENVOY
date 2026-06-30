import { useState } from "react";
import { signup } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { extractErrorMessage } from "../utils/api";
import { ALLOWED_DOMAINS } from "../constants";
import { AUTH } from "../constants/copy";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    isAcmMember: "no", acmId: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailLower = formData.email.toLowerCase();
    const isValidDomain = ALLOWED_DOMAINS.some((d) => emailLower.endsWith(d));

    if (!isValidDomain) {
      setToast({ type: "error", message: AUTH.REGISTER.ERROR_INVALID_EMAIL });
      return;
    }
    if (formData.password.length < 6) {
      setToast({ type: "error", message: AUTH.REGISTER.ERROR_PASSWORD_SHORT });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setToast({ type: "error", message: AUTH.REGISTER.ERROR_PASSWORD_MISMATCH });
      return;
    }

    setLoading(true);
    try {
      await signup({ name: formData.name.trim(), email: emailLower, password: formData.password });
      setToast({ type: "success", message: AUTH.REGISTER.SUCCESS });
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setToast({ type: "error", message: extractErrorMessage(err, AUTH.REGISTER.ERROR_GENERIC) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card register-card">
        <header className="auth-card-header">
          <div className="auth-logo-mark">E</div>
          <h1>Create your account</h1>
          <p>Join the ACM Student Chapter. Use your official university email to get started.</p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form-grid">
          <div className="field-group full-width">
            <label>Full name</label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="field-group full-width">
            <label>University email</label>
            <input
              type="email"
              placeholder="you@stu.xim.edu.in"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <span className="form-hint">Only @xim.edu.in and @stu.xim.edu.in domains are accepted.</span>
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
              <label>Confirm password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field-group">
              <label>ACM member?</label>
              <select value={formData.isAcmMember} onChange={(e) => setFormData({ ...formData, isAcmMember: e.target.value })}>
                <option value="no">Not yet</option>
                <option value="yes">Yes, I am</option>
              </select>
            </div>
            {formData.isAcmMember === "yes" && (
              <div className="field-group">
                <label>ACM membership ID</label>
                <input
                  type="text"
                  placeholder="e.g. 1234567"
                  value={formData.acmId}
                  onChange={(e) => setFormData({ ...formData, acmId: e.target.value })}
                />
              </div>
            )}
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="auth-card-footer">
          <p>Already have an account? <span onClick={() => navigate("/login")}>Sign in</span></p>
          <p className="auth-footer-alt">Chapter admin? <span onClick={() => navigate("/admin-login")}>Admin access →</span></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
