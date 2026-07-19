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
import { useNavigate } from "react-router-dom";
import { extractErrorMessage } from "../utils/api";
import { ALLOWED_DOMAINS } from "../constants";
import { AUTH } from "../constants/copy";
import Toast from "../components/Toast";
import {
  TextField,
  PasswordField,
  SelectField,
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
import { SparkleIcon } from "../components/ui/Icons";
import "../components/FormField.css";
import "./Register.css";

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
      ValidationRules.minLength(6),
      ValidationRules.passwordStrength()
    ),
    confirmPassword: composeValidators(
      ValidationRules.required("Confirm password"),
      ValidationRules.minLength(6)
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
      // Focus first error field
      if (fieldErrors.name) {
        document.getElementById("register-name")?.focus();
      } else if (fieldErrors.email) {
        document.getElementById("register-email")?.focus();
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
    <div className="auth-wrapper">
      <div className="auth-card register-card">
        {/* Header */}
        <header className="auth-card-header">
          <div className="auth-logo-mark">
            <SparkleIcon size={24} />
          </div>
          <h1>{AUTH.REGISTER.HEADING}</h1>
          <p>{AUTH.REGISTER.SUBHEADING}</p>
        </header>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="auth-form-grid"
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
                onChange={(e) => handleFieldChange("password", e.target.value)}
                onBlur={() => handleFieldBlur("password")}
                error={fieldTouched.password ? fieldErrors.password : null}
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
            <FormRow className="two-col">
              <SelectField
                label={AUTH.REGISTER.LABEL_ACM_MEMBER}
                id="register-acm"
                value={formData.isAcmMember}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isAcmMember: e.target.value,
                  })
                }
                options={[
                  { value: "no", label: AUTH.REGISTER.OPTION_NOT_YET },
                  { value: "yes", label: AUTH.REGISTER.OPTION_YES },
                ]}
                required
                disabled={loading}
              />

              {/* ACM ID (conditional) */}
              {formData.isAcmMember === "yes" && (
                <TextField
                  label={AUTH.REGISTER.LABEL_ACM_ID}
                  id="register-acm-id"
                  type="text"
                  placeholder={AUTH.REGISTER.PLACEHOLDER_ACM_ID}
                  value={formData.acmId}
                  onChange={(e) => handleFieldChange("acmId", e.target.value)}
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
            className="auth-submit-btn"
            disabled={loading}
            aria-busy={loading}
            aria-label={
              loading
                ? "Creating account, please wait..."
                : "Create account"
            }
          >
            {loading ? "Creating account..." : AUTH.REGISTER.BUTTON_SUBMIT}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-card-footer">
          <p>
            Already have an account?{" "}
            <button
              type="button"
              className="auth-link"
              onClick={() => navigate("/login")}
              aria-label="Go to sign in page"
            >
              Sign in
            </button>
          </p>
          <p className="auth-footer-alt">
            Chapter admin?{" "}
            <button
              type="button"
              className="auth-link"
              onClick={() => navigate("/admin-login")}
              aria-label="Go to admin access page"
            >
              Admin access →
            </button>
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default Register;

