import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../api/auth";
import { extractErrorMessage, extractObject } from "../utils/api";
import { AUTH } from "../constants/copy";
import Toast from "../components/Toast";
import { EyeIcon, EyeOffIcon, ShieldIcon } from "../components/ui/Icons";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);
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
        setToast({ type: "error", message: AUTH.ADMIN_LOGIN.ERROR_DENIED });
        logout();
      } else {
        navigate("/admin");
      }
    } catch (err) {
      setToast({ type: "error", message: extractErrorMessage(err, AUTH.ADMIN_LOGIN.ERROR_CREDENTIALS) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card admin-auth">
        <header className="auth-card-header">
          <div className="auth-logo-mark" style={{ background: "var(--color-primary-dark)" }}>
            <ShieldIcon size={18} />
          </div>
          <h1>{AUTH.ADMIN_LOGIN.HEADING}</h1>
          <p>{AUTH.ADMIN_LOGIN.SUBHEADING}</p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form-grid" noValidate>
          <div className="field-group full-width">
            <label htmlFor="admin-email">{AUTH.ADMIN_LOGIN.LABEL_EMAIL}</label>
            <input
              id="admin-email"
              type="email"
              placeholder={AUTH.ADMIN_LOGIN.PLACEHOLDER_EMAIL}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              autoComplete="email"
              aria-required="true"
            />
          </div>
          <div className="field-group full-width">
            <label htmlFor="admin-password">{AUTH.ADMIN_LOGIN.LABEL_PASSWORD}</label>
            <div className="input-with-icon">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                placeholder={AUTH.ADMIN_LOGIN.PLACEHOLDER_PASSWORD}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                autoComplete="current-password"
                aria-required="true"
              />
              <button
                type="button"
                className="toggle-pw"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className="auth-submit-btn" disabled={loading} aria-busy={loading}>
            {loading ? "Verifying..." : AUTH.ADMIN_LOGIN.BUTTON_SUBMIT}
          </button>
        </form>

        <div className="auth-card-footer">
          <p>Not an admin? <span onClick={() => navigate("/login")} role="link" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && navigate("/login")}>Back to sign in</span></p>
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default AdminLogin;
