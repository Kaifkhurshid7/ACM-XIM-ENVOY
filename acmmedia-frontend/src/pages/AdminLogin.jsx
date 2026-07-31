import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { login as apiLogin, getCurrentUser } from "../api/auth";
import { extractErrorMessage, extractObject, extractToken } from "../utils/api";
import { AUTH } from "../constants/copy";
import Toast from "../components/Toast";
import { EyeIcon, EyeOffIcon, ShieldIcon } from "../components/ui/Icons";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const { setSession } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Preserve the member's existing session: it must survive a denied admin
    // attempt instead of being destroyed by the shared logout flow.
    const previousToken = localStorage.getItem("token");
    try {
      const { data } = await apiLogin({ email: formData.email, password: formData.password });
      const token = extractToken(data);
      if (!token) throw new Error("Login succeeded but no token was returned.");

      // Confirm the role with the freshly issued token before committing.
      localStorage.setItem("token", token);
      const { data: me } = await getCurrentUser();
      const currentUser = extractObject(me, ["user", "data"]);

      if (currentUser?.role === "admin") {
        setSession(token, currentUser);
        navigate("/admin");
      } else {
        // Not an admin — restore the previous session and deny access.
        if (previousToken) localStorage.setItem("token", previousToken);
        setToast({ type: "error", message: AUTH.ADMIN_LOGIN.ERROR_DENIED });
      }
    } catch (err) {
      if (previousToken) localStorage.setItem("token", previousToken);
      setToast({ type: "error", message: extractErrorMessage(err, AUTH.ADMIN_LOGIN.ERROR_CREDENTIALS) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card admin-auth">
        <header className="auth-card-header">
          <div className="auth-logo-mark">
            <ShieldIcon size={18} />
          </div>
          <p className="auth-eyebrow">{AUTH.ADMIN_LOGIN.EYEBROW}</p>
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
          <p>
            Not an admin?{" "}
            <button
              type="button"
              className="auth-link"
              onClick={() => navigate("/login")}
              aria-label="Back to sign in page"
            >
              Back to sign in
            </button>
          </p>
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default AdminLogin;
