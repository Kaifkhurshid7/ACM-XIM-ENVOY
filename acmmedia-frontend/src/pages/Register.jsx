/**
 * Register Page (Refactored)
 * 
 * Production-grade account creation with:
 * - Comprehensive client-side validation
 * - Real-time error feedback & password strength indicator
 * - Reusable form components with consistent styling
 * - Input sanitization and duplicate submission prevention
 * - Accessible keyboard navigation and screen reader support
 * - Graceful API error handling and user feedback
 * - Loading and success states with animations
 * 
 * @component
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { signup } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";
import { extractErrorMessage } from "../utils/api";
import { ALLOWED_DOMAINS } from "../constants";
import { AUTH } from "../constants/copy";
import Toast from "../components/Toast";
import {
  TextField,
  PasswordField,
  FormSection,
  FormRow,
} from "../components/FormField";
import {
  ValidationRules,
  composeValidators,
  FieldValidator,
  Sanitize,
  getPasswordStrength,
} from "../utils/validation";
import { CalendarIcon, MessageCircleIcon, ShieldIcon } from "../components/ui/Icons";
import AuthLayout from "../components/AuthLayout";
import "../components/FormField.css";

const PERKS = [
  { icon: <CalendarIcon size={20} />, title: AUTH.REGISTER.VALUE_1_TITLE, desc: AUTH.REGISTER.VALUE_1_DESC },
  { icon: <MessageCircleIcon size={20} />, title: AUTH.REGISTER.VALUE_2_TITLE, desc: AUTH.REGISTER.VALUE_2_DESC },
  { icon: <ShieldIcon size={20} />, title: AUTH.REGISTER.VALUE_3_TITLE, desc: AUTH.REGISTER.VALUE_3_DESC },
];

const Register = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    isAcmMember: "no",
    acmId: "",
  });

  // Field validation state
  const [fieldErrors, setFieldErrors] = useState({
    name: null,
    email: null,
    password: null,
    confirmPassword: null,
    acmId: null,
  });

  const [fieldTouched, setFieldTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    acmId: false,
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [formAttempted, setFormAttempted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(
    getPasswordStrength("")
  );

  const navigate = useNavigate();
  const submitButtonRef = useRef(null);

  // ============================================================================
  // Validation Setup
  // ============================================================================

  const validators = {
    name: composeValidators(
      ValidationRules.required("Full name"),
      ValidationRules.minLength(2),
      ValidationRules.maxLength(100)
    ),
    email: composeValidators(
      ValidationRules.required("Email"),
      ValidationRules.email(),
      ValidationRules.universityEmail()
    ),
    password: composeValidators(
      ValidationRules.required("Password"),
      ValidationRules.minLength(8),
      ValidationRules.passwordStrength()
    ),
    confirmPassword: composeValidators(
      ValidationRules.required("Confirm password"),
      ValidationRules.minLength(8)
    ),
    acmId: ValidationRules.minLength(1),
  };

  // ============================================================================
  // Validation Handlers
  // ============================================================================

  /**
   * Validate a specific field
   */
  const validateField = useCallback(
    (fieldName, value) => {
      if (!validators[fieldName]) return null;

      let result = validators[fieldName](value);

      // Special handling for password confirmation
      if (fieldName === "confirmPassword") {
        const passwordMatch = composeValidators(
          ValidationRules.matches(formData.password)
        )(value);

        if (!passwordMatch.isValid && result.isValid) {
          result = passwordMatch;
        }
      }

      return result.error;
    },
    [formData.password, validators]
  );

  /**
   * Handle field change with real-time validation
   */
  const handleFieldChange = useCallback(
    (fieldName, rawValue) => {
      // Sanitize input
      let value = rawValue;
      if (fieldName === "email") {
        value = Sanitize.email(value);
      } else if (fieldName === "name") {
        value = Sanitize.trim(value);
      } else if (fieldName === "acmId") {
        value = Sanitize.whitespace(value);
      }

      // Update form data
      setFormData((prev) => ({
        ...prev,
        [fieldName]: value,
      }));

      // Mark as dirty (user has changed the value)
      setFieldTouched((prev) => ({
        ...prev,
        [fieldName]: true,
      }));

      // Real-time validation
      const error = validateField(fieldName, value);
      setFieldErrors((prev) => ({
        ...prev,
        [fieldName]: error,
      }));

      // Update password strength on password change
      if (fieldName === "password") {
        setPasswordStrength(getPasswordStrength(value));

        // Clear confirm password error if password changed
        if (formData.confirmPassword) {
          const confirmError = validateField("confirmPassword", formData.confirmPassword);
          setFieldErrors((prev) => ({
            ...prev,
            confirmPassword: confirmError,
          }));
        }
      }
    },
    [formData.confirmPassword, validateField]
  );

  /**
   * Handle field blur (mark as touched for better UX)
   */
  const handleFieldBlur = useCallback((fieldName) => {
    setFieldTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
  }, []);

  /**
   * Validate entire form before submission
   */
  const validateForm = useCallback(() => {
    const errors = {};
    let isValid = true;

    // Validate all required fields
    Object.keys(validators).forEach((fieldName) => {
      if (fieldName === "acmId" && formData.isAcmMember !== "yes") {
        return; // Skip ACM ID validation if not a member
      }

      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        errors[fieldName] = error;
        isValid = false;
      }
    });

    // Additional check for password confirmation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  }, [formData, validateField, validators]);

  // ============================================================================
  // Form Submission
  // ============================================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (loading) return;

    setFormAttempted(true);

    // Client-side validation
    if (!validateForm()) {
      setToast({
        type: "error",
        message: "Please fix the errors above and try again.",
      });
      // Reveal every error, not only those on fields the user already touched
      setFieldTouched({ name: true, email: true, password: true, confirmPassword: true, acmId: true });

      // Focus the first invalid field (fieldErrors is stale until the next render)
      const ids = { name: "register-name", email: "register-email", password: "register-password", confirmPassword: "register-confirm" };
      const first = Object.keys(ids).find((f) => validateField(f, formData[f]) || (f === "confirmPassword" && formData.password !== formData.confirmPassword));
      if (first) {
        const el = document.getElementById(ids[first]);
        el?.focus();
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setLoading(true);

    try {
      // Sanitize before sending to API
      const payload = {
        name: Sanitize.trim(formData.name),
        email: Sanitize.email(formData.email),
        password: formData.password,
        isAcmMember: formData.isAcmMember === "yes",
        acmId: formData.isAcmMember === "yes" ? Sanitize.trim(formData.acmId) : null,
      };

      // API call
      await signup(payload);

      // Success feedback
      setToast({
        type: "success",
        message: AUTH.REGISTER.SUCCESS,
      });

      // Clear form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        isAcmMember: "no",
        acmId: "",
      });

      // Redirect to login after delay
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      // Extract and display error message
      const errorMessage = extractErrorMessage(
        err,
        AUTH.REGISTER.ERROR_GENERIC
      );

      setToast({
        type: "error",
        message: errorMessage,
      });

      // Optionally focus submit button for keyboard users
      submitButtonRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <AuthLayout
      wide
      headline={
        <span className="rh">
          <span className="rh-tag">// One account · every perk</span>
          <span className="rh-line">Build.</span>
          <span className="rh-line rh-line--dim">Learn.</span>
          <span className="rh-line rh-line--last">
            Belong.
            <svg className="rh-scribble" viewBox="0 0 300 18" preserveAspectRatio="none" aria-hidden="true">
              <path d="M3 12 C 60 2, 120 17, 180 7 S 270 4, 297 10" />
            </svg>
          </span>
        </span>
      }
      lead={AUTH.REGISTER.BRAND_SUBHEADLINE}
      hideBrand
      visual={
        <div className="rc">
          <div className="rc-card" aria-label="Membership card preview">
            <div className="rc-sheen" aria-hidden="true" />
            <div className="rc-top">
              <span className="rc-brand">ACM · XIM</span>
              <span className="rc-chip" aria-hidden="true" />
            </div>
            <p className="rc-label">Member</p>
            <p className={`rc-name ${formData.name.trim() ? "" : "is-empty"}`}>
              {formData.name.trim() || "Your name here"}
            </p>
            <div className="rc-bottom">
              <div>
                <p className="rc-label">Student chapter</p>
                <p className="rc-meta">XIM University · {new Date().getFullYear()}</p>
              </div>
              <span className="rc-bars" aria-hidden="true" />
            </div>
          </div>

          <ul className="rc-perks" aria-label="Member benefits">
            {PERKS.map((p) => (
              <li key={p.title}>
                <span className="rc-check" aria-hidden="true">✓</span>
                <span className="rc-perk-text"><strong>{p.title}</strong><span>{p.desc}</span></span>
              </li>
            ))}
          </ul>
        </div>
      }
      visualFoot={
        <>
          <span>© {new Date().getFullYear()} ACM XIM Student Chapter</span>
          <span className="rf-links">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/conduct">Conduct</Link>
          </span>
        </>
      }
      eyebrow="Join the chapter"
      title={AUTH.REGISTER.HEADING}
      subtitle={AUTH.REGISTER.SUBHEADING}
      aside={<>Already a member?<Link to="/login">Sign in</Link></>}
      footer={
        <p className="al-footnote">
          Chapter admin? <Link to="/admin-login">Admin access →</Link>
        </p>
      }
    >
            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="al-form al-form--register"
              noValidate
              aria-label="Account creation form"
            >
              {/* Personal Information Section */}
              <FormSection heading="Basic Information">
                {/* Full Name */}
                <TextField
                  label={AUTH.REGISTER.LABEL_NAME}
                  id="register-name"
                  type="text"
                  placeholder={AUTH.REGISTER.PLACEHOLDER_NAME}
                  value={formData.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  onBlur={() => handleFieldBlur("name")}
                  error={fieldTouched.name ? fieldErrors.name : null}
                  required
                  autoComplete="name"
                  disabled={loading}
                />

                {/* University Email */}
                <TextField
                  label={AUTH.REGISTER.LABEL_EMAIL}
                  id="register-email"
                  type="email"
                  placeholder={AUTH.REGISTER.PLACEHOLDER_EMAIL}
                  value={formData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  onBlur={() => handleFieldBlur("email")}
                  error={fieldTouched.email ? fieldErrors.email : null}
                  hint={AUTH.REGISTER.LABEL_EMAIL_HINT}
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </FormSection>

              {/* Security Section */}
              <FormSection heading="Security">
                {/* Password Fields Row */}
                <FormRow className="two-col">
                  {/* Password */}
                  <PasswordField
                    label={AUTH.REGISTER.LABEL_PASSWORD}
                    id="register-password"
                    placeholder={AUTH.REGISTER.PLACEHOLDER_PASSWORD}
                    value={formData.password}
                    onChange={(e) =>
                      handleFieldChange("password", e.target.value)
                    }
                    onBlur={() => handleFieldBlur("password")}
                    error={
                      fieldTouched.password ? fieldErrors.password : null
                    }
                    hint={AUTH.REGISTER.LABEL_PASSWORD_HINT}
                    required
                    showStrength={true}
                    strengthIndicator={passwordStrength}
                    showToggle={true}
                    disabled={loading}
                  />

                  {/* Confirm Password */}
                  <PasswordField
                    label={AUTH.REGISTER.LABEL_PASSWORD_CONFIRM}
                    id="register-confirm"
                    placeholder={AUTH.REGISTER.PLACEHOLDER_PASSWORD_CONFIRM}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleFieldChange("confirmPassword", e.target.value)
                    }
                    onBlur={() => handleFieldBlur("confirmPassword")}
                    error={
                      fieldTouched.confirmPassword
                        ? fieldErrors.confirmPassword
                        : null
                    }
                    required
                    showToggle={false}
                    disabled={loading}
                  />
                </FormRow>
              </FormSection>

              {/* ACM Membership Section */}
              <FormSection heading="Chapter Membership">
                {/* ACM Member Status */}
                <FormRow className="full-width">
                  <fieldset className="acm-choice" disabled={loading}>
                    <legend>
                      {AUTH.REGISTER.LABEL_ACM_MEMBER} <span className="form-field-required">*</span>
                    </legend>
                    <div className="acm-choice-grid" role="radiogroup" aria-label={AUTH.REGISTER.LABEL_ACM_MEMBER}>
                      {[
                        { value: "no", label: AUTH.REGISTER.OPTION_NOT_YET, hint: "I'm new to ACM" },
                        { value: "yes", label: AUTH.REGISTER.OPTION_YES, hint: "I have an ACM membership" },
                      ].map((o) => (
                        <button
                          key={o.value}
                          type="button"
                          role="radio"
                          aria-checked={formData.isAcmMember === o.value}
                          className={`acm-option ${formData.isAcmMember === o.value ? "selected" : ""}`}
                          onClick={() => setFormData({ ...formData, isAcmMember: o.value })}
                        >
                          <span className="acm-radio" aria-hidden="true" />
                          <span className="acm-option-text">
                            <strong>{o.label}</strong>
                            <span>{o.hint}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  {/* ACM ID (conditional) */}
                  {formData.isAcmMember === "yes" && (
                    <TextField
                      label={AUTH.REGISTER.LABEL_ACM_ID}
                      id="register-acm-id"
                      type="text"
                      placeholder={AUTH.REGISTER.PLACEHOLDER_ACM_ID}
                      value={formData.acmId}
                      onChange={(e) =>
                        handleFieldChange("acmId", e.target.value)
                      }
                      onBlur={() => handleFieldBlur("acmId")}
                      error={fieldTouched.acmId ? fieldErrors.acmId : null}
                      hint={AUTH.REGISTER.LABEL_ACM_ID_HINT}
                      disabled={loading}
                    />
                  )}
                </FormRow>
              </FormSection>

              {/* Submit Button */}
              <button
                ref={submitButtonRef}
                type="submit"
                className="al-submit"
                disabled={loading}
                aria-busy={loading}
                aria-label={
                  loading
                    ? "Creating account, please wait..."
                    : "Create account"
                }
              >
                {loading
                  ? "Creating account..."
                  : <>{AUTH.REGISTER.BUTTON_SUBMIT} <span aria-hidden="true">→</span></>}
              </button>
            </form>
            <p className="al-legal">
              By creating an account you agree to our <Link to="/terms">Terms &amp; Conditions</Link>,{" "}
              <Link to="/privacy">Privacy Policy</Link> and <Link to="/conduct">Code of Conduct</Link>.
            </p>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </AuthLayout>
  );
};

export default Register;
