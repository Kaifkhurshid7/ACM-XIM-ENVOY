import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { extractErrorMessage } from "../utils/api";
import { AUTH } from "../constants/copy";
import Toast from "../components/Toast";
import { EyeIcon, EyeOffIcon } from "../components/ui/Icons";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate("/");
    } catch (err) {
      setToast({ type: "error", message: extractErrorMessage(err, AUTH.LOGIN.ERROR_CREDENTIALS) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <header className="auth-card-header">
          <div className="auth-logo-mark">E</div>
          <h1>{AUTH.LOGIN.HEADING}</h1>
          <p>{AUTH.LOGIN.SUBHEADING}</p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form-grid" noValidate>
          <div className="field-group full-width">
            <label htmlFor="login-email">{AUTH.LOGIN.LABEL_EMAIL}</label>
            <input
              id="login-email"
              type="email"
              placeholder={AUTH.LOGIN.PLACEHOLDER_EMAIL}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              autoComplete="email"
              aria-required="true"
            />
          </div>

          <div className="field-group full-width">
            <label htmlFor="login-password">{AUTH.LOGIN.LABEL_PASSWORD}</label>
            <div className="input-with-icon">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder={AUTH.LOGIN.PLACEHOLDER_PASSWORD}
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
            {loading ? "Signing in..." : AUTH.LOGIN.BUTTON_SUBMIT}
          </button>
        </form>

        <div className="auth-card-footer">
          <p>Don't have an account? <span onClick={() => navigate("/register")} role="link" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && navigate("/register")}>Create account</span></p>
          <p className="auth-footer-alt">Chapter admin? <span onClick={() => navigate("/admin-login")} role="link" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && navigate("/admin-login")}>Admin access</span></p>
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default Login;
