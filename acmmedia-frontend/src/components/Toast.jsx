/**
 * Toast Notification Component
 * 
 * Accessible, dismissible notification component replacing browser alerts.
 * Supports multiple types: success, error, warning, info
 * 
 * Usage:
 * const [toast, setToast] = useState(null);
 * setToast({ type: 'success', message: 'Updated successfully' });
 * 
 * @component
 * @param {object} toast - {type, message}
 * @param {function} onClose - Callback to clear toast
 */

import React, { useEffect } from "react";

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: "\u2713",
    error: "\u2715",
    warning: "\u26A0",
    info: "\u2139",
  };

  const colors = {
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 9999,
        background: colors[toast.type] || colors.info,
        color: "white",
        padding: "1rem 1.5rem",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        maxWidth: "400px",
        fontSize: "14px",
        fontWeight: "500",
        animation: "slideIn 0.3s ease-out",
      }}
    >
      <span style={{ fontSize: "18px", fontWeight: "bold" }}>{icons[toast.type]}</span>
      <span>{toast.message}</span>
      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        style={{
          background: "rgba(255,255,255,0.2)",
          border: "none",
          color: "white",
          cursor: "pointer",
          padding: "0.25rem 0.5rem",
          borderRadius: "4px",
          marginLeft: "auto",
          fontSize: "16px",
        }}
      >
        ×
      </button>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Toast;
