import { useState } from "react";
import { signup } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { extractErrorMessage } from "../utils/api";
import { ALLOWED_DOMAINS } from "../constants";
import { AUTH } from "../constants/copy";
import Toast from "../components/Toast";
import { EyeIcon, EyeOffIcon } from "../components/ui/Icons";

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
          <h1>{AUTH.REGISTER.HEADING}</h1>
          <p>{AUTH.REGISTER.SUBHEADING}</p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form-grid" noValidate>
          <div className="field-group full-width">
            <label htmlFor="register-name">{AUTH.REGISTER.LABEL_NAME}</label>
            <input
              id="register-name"
              type="text"
              placeholder={AUTH.REGISTER.PLACEHOLDER_NAME}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              autoComplete="name"
              aria-required="true"
            />
          </div>

          <div className="field-group full-width">
            <label htmlFor="register-email">{AUTH.REGISTER.LABEL_EMAIL}</label>
            <input
              id="register-email"
              type="email"
              placeholder={AUTH.REGISTER.PLACEHOLDER_EMAIL}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              autoComplete="email"
              aria-required="true"
              aria-describedby="email-hint"
            />
            <span className="form-hint" id="email-hint">{AUTH.REGISTER.LABEL_EMAIL_HINT}</span>
          </div>

          <div className="field-row">
            <div className="field-group">
              <label htmlFor="register-password">{AUTH.REGISTER.LABEL_PASSWORD}</label>
              <div className="input-with-icon">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={AUTH.REGISTER.PLACEHOLDER_PASSWORD}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  aria-required="true"
                  aria-describedby="password-hint"
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
              <span className="form-hint" id="password-hint">{AUTH.REGISTER.LABEL_PASSWORD_HINT}</span>
            </div>
            <div className="field-group">
              <label htmlFor="register-confirm">{AUTH.REGISTER.LABEL_PASSWORD_CONFIRM}</label>
              <input
                id="register-confirm"
                type={showPassword ? "text" : "password"}
                placeholder={AUTH.REGISTER.PLACEHOLDER_PASSWORD_CONFIRM}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                autoComplete="new-password"
                aria-required="true"
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field-group">
              <label htmlFor="register-acm">{AUTH.REGISTER.LABEL_ACM_MEMBER}</label>
              <select
                id="register-acm"
                value={formData.isAcmMember}
                onChange={(e) => setFormData({ ...formData, isAcmMember: e.target.value })}
              >
                <option value="no">{AUTH.REGISTER.OPTION_NOT_YET}</option>
                <option value="yes">{AUTH.REGISTER.OPTION_YES}</option>
              </select>
            </div>
            {formData.isAcmMember === "yes" && (
              <div className="field-group">
                <label htmlFor="register-acm-id">{AUTH.REGISTER.LABEL_ACM_ID}</label>
                <input
                  id="register-acm-id"
                  type="text"
                  placeholder={AUTH.REGISTER.PLACEHOLDER_ACM_ID}
                  value={formData.acmId}
                  onChange={(e) => setFormData({ ...formData, acmId: e.target.value })}
                  aria-describedby="acm-id-hint"
                />
                <span className="form-hint" id="acm-id-hint">{AUTH.REGISTER.LABEL_ACM_ID_HINT}</span>
              </div>
            )}
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading} aria-busy={loading}>
            {loading ? "Creating account..." : AUTH.REGISTER.BUTTON_SUBMIT}
          </button>
        </form>

        <div className="auth-card-footer">
          <p>Already have an account? <span onClick={() => navigate("/login")} role="link" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && navigate("/login")}>Sign in</span></p>
          <p className="auth-footer-alt">Chapter admin? <span onClick={() => navigate("/admin-login")} role="link" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && navigate("/admin-login")}>Admin access</span></p>
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default Register;
