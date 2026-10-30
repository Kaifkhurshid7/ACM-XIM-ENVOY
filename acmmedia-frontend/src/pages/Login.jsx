import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { extractErrorMessage } from "../utils/api";
import { AUTH } from "../constants/copy";
import Toast from "../components/Toast";
import { LockIcon } from "../components/ui/Icons";
import AuthLayout, { AuthField, MailIcon } from "../components/AuthLayout";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
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
    <AuthLayout
      eyebrow={AUTH.LOGIN.EYEBROW}
      title={AUTH.LOGIN.HEADING}
      subtitle={AUTH.LOGIN.SUBHEADING}
      aside={<>New here?<Link to="/register">Create account</Link></>}
      footer={
        <p className="al-footnote">
          Chapter admin? <Link to="/admin-login">Admin access</Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="al-form" noValidate>
        <AuthField
          id="login-email"
          type="email"
          label={AUTH.LOGIN.LABEL_EMAIL}
          icon={<MailIcon />}
          placeholder={AUTH.LOGIN.PLACEHOLDER_EMAIL}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          autoComplete="email"
          aria-required="true"
        />
        <AuthField
          id="login-password"
          password
          label={AUTH.LOGIN.LABEL_PASSWORD}
          icon={<LockIcon size={18} />}
          placeholder={AUTH.LOGIN.PLACEHOLDER_PASSWORD}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          autoComplete="current-password"
          aria-required="true"
        />

        <button type="submit" className="al-submit" disabled={loading} aria-busy={loading}>
          {loading ? "Signing in..." : <>{AUTH.LOGIN.BUTTON_SUBMIT} <span aria-hidden="true">→</span></>}
        </button>
      </form>

      <div className="al-divider">or</div>
      <Link to="/register" className="al-secondary">Create a free account</Link>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </AuthLayout>
  );
};

export default Login;
