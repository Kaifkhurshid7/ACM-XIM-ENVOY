/**
 * FormField Component
 * 
 * Production-grade, reusable form field component with:
 * - Automatic error state management
 * - Real-time validation feedback
 * - Accessible ARIA attributes
 * - Helper text and character counting
 * - Loading and success states
 * - Consistent styling across the app
 * 
 * @component
 */

import React from "react";
import "./FormField.css";

/**
 * Generic form field wrapper (text, email, password, etc.)
 */
export const TextField = React.forwardRef(
  (
    {
      label,
      id,
      type = "text",
      placeholder,
      value = "",
      onChange,
      onBlur,
      onFocus,
      error,
      hint,
      helperText,
      required = false,
      disabled = false,
      maxLength,
      autoComplete,
      icon: Icon,
      rightAction,
      className = "",
      showCharCount = false,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const fieldId = id || `field-${Math.random().toString(36).slice(2, 9)}`;
    const errorId = error ? `${fieldId}-error` : null;
    const hintId = hint ? `${fieldId}-hint` : null;
    const charCountId = showCharCount ? `${fieldId}-char-count` : null;

    const describedByIds = [
      ariaDescribedBy,
      hintId,
      errorId,
      charCountId,
    ]
      .filter(Boolean)
      .join(" ");

    const charCount = showCharCount ? value.length : 0;
    const charCountText = maxLength ? `${charCount}/${maxLength}` : null;

    return (
      <div className={`form-field ${error ? "has-error" : ""} ${className}`}>
        {label && (
          <label htmlFor={fieldId} className="form-field-label">
            {label}
            {required && <span className="form-field-required">*</span>}
          </label>
        )}

        <div className="form-field-input-wrapper">
          {Icon && <div className="form-field-icon">{Icon}</div>}

          <input
            ref={ref}
            id={fieldId}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={disabled}
            maxLength={maxLength}
            autoComplete={autoComplete}
            className={`form-field-input ${Icon ? "with-icon" : ""} ${
              rightAction ? "with-action" : ""
            }`}
            aria-required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={describedByIds || undefined}
            {...props}
          />

          {rightAction && (
            <div className="form-field-action">{rightAction}</div>
          )}
        </div>

        {hint && (
          <div id={hintId} className="form-field-hint">
            {hint}
          </div>
        )}

        {showCharCount && maxLength && (
          <div id={charCountId} className="form-field-char-count">
            {charCountText}
          </div>
        )}

        {error && (
          <div id={errorId} className="form-field-error" role="alert">
            {error}
          </div>
        )}

        {helperText && !error && (
          <div className="form-field-helper">{helperText}</div>
        )}
      </div>
    );
  }
);

TextField.displayName = "TextField";

/**
 * Password field with visibility toggle
 */
export const PasswordField = React.forwardRef(
  (
    {
      label,
      id,
      placeholder,
      value = "",
      onChange,
      onBlur,
      onFocus,
      error,
      hint,
      required = false,
      disabled = false,
      showStrength = false,
      strengthIndicator,
      showToggle = true,
      className = "",
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const fieldId = id || `password-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className={`form-field password-field ${error ? "has-error" : ""} ${className}`}>
        {label && (
          <label htmlFor={fieldId} className="form-field-label">
            {label}
            {required && <span className="form-field-required">*</span>}
          </label>
        )}

        <div className="form-field-input-wrapper">
          <input
            ref={ref}
            id={fieldId}
            type={showPassword ? "text" : "password"}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={disabled}
            autoComplete="new-password"
            className="form-field-input with-action"
            aria-required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={ariaDescribedBy}
            {...props}
          />

          {showToggle && (
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              disabled={disabled}
            >
              {showPassword ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                  <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
        </div>

        {showStrength && strengthIndicator && (
          <div className="password-strength-container">
            <div className="password-strength-bars">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`strength-bar ${
                    i < strengthIndicator.level ? "active" : ""
                  }`}
                  style={{
                    backgroundColor:
                      i < strengthIndicator.level
                        ? strengthIndicator.color
                        : "var(--color-charcoal-grey)",
                  }}
                />
              ))}
            </div>
            <span
              className="password-strength-label"
              style={{ color: strengthIndicator.color }}
            >
              {strengthIndicator.label}
            </span>
          </div>
        )}

        {hint && (
          <div className="form-field-hint">{hint}</div>
        )}

        {error && (
          <div className="form-field-error" role="alert">
            {error}
          </div>
        )}
      </div>
    );
  }
);

PasswordField.displayName = "PasswordField";

/**
 * Select field component
 */
export const SelectField = React.forwardRef(
  (
    {
      label,
      id,
      placeholder,
      value = "",
      onChange,
      onBlur,
      onFocus,
      error,
      hint,
      options = [],
      required = false,
      disabled = false,
      className = "",
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const fieldId = id || `select-${Math.random().toString(36).slice(2, 9)}`;
    const errorId = error ? `${fieldId}-error` : null;
    const hintId = hint ? `${fieldId}-hint` : null;

    const describedByIds = [ariaDescribedBy, hintId, errorId]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={`form-field select-field ${error ? "has-error" : ""} ${className}`}>
        {label && (
          <label htmlFor={fieldId} className="form-field-label">
            {label}
            {required && <span className="form-field-required">*</span>}
          </label>
        )}

        <div className="form-field-input-wrapper">
          <select
            ref={ref}
            id={fieldId}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={disabled}
            className="form-field-select"
            aria-required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={describedByIds || undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <svg
            className="select-field-chevron"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {hint && (
          <div id={hintId} className="form-field-hint">
            {hint}
          </div>
        )}

        {error && (
          <div id={errorId} className="form-field-error" role="alert">
            {error}
          </div>
        )}
      </div>
    );
  }
);

SelectField.displayName = "SelectField";

/**
 * Form section with optional heading
 */
export const FormSection = ({ heading, children, className = "" }) => (
  <div className={`form-section ${className}`}>
    {heading && <h4 className="form-section-heading">{heading}</h4>}
    {children}
  </div>
);

/**
 * Form row for side-by-side fields
 */
export const FormRow = ({ children, className = "" }) => (
  <div className={`form-row ${className}`}>{children}</div>
);
