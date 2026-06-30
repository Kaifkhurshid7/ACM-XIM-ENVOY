/**
 * Confirmation Dialog Component
 * 
 * Accessible confirmation modal replacing browser confirm() dialogs.
 * Fully keyboard navigable, properly focused, screen reader friendly.
 * 
 * Usage:
 * const [confirm, setConfirm] = useState(null);
 * setConfirm({
 *   title: "Delete Post?",
 *   message: "This action cannot be undone.",
 *   onConfirm: () => deletePost(),
 *   confirmText: "Delete",
 *   cancelText: "Cancel"
 * });
 * 
 * @component
 * @param {object} dialog - {title, message, onConfirm, confirmText, cancelText}
 * @param {function} onClose - Callback to close dialog
 */

import React, { useEffect, useRef } from "react";

const ConfirmDialog = ({ dialog, onClose }) => {
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    if (dialog && confirmBtnRef.current) {
      confirmBtnRef.current.focus();
    }
  }, [dialog]);

  if (!dialog) return null;

  const handleConfirm = async () => {
    if (dialog.onConfirm) {
      await dialog.onConfirm();
    }
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9998,
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        style={{
          background: "var(--color-surface, #1a1a1a)",
          color: "var(--color-text, #ffffff)",
          borderRadius: "12px",
          padding: "2rem",
          maxWidth: "400px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
          animation: "slideUp 0.3s ease-out",
        }}
      >
        <h2 id="dialog-title" style={{ margin: "0 0 0.5rem 0", fontSize: "18px", fontWeight: "700" }}>
          {dialog.title}
        </h2>
        <p id="dialog-description" style={{ margin: "0 0 1.5rem 0", opacity: 0.8, fontSize: "14px", lineHeight: "1.6" }}>
          {dialog.message}
        </p>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            aria-label={dialog.cancelText || "Cancel"}
            style={{
              padding: "0.6rem 1.2rem",
              borderRadius: "6px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "transparent",
              color: "var(--color-text, #ffffff)",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "14px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "rgba(255,255,255,0.1)")}
            onMouseLeave={(e) => (e.target.style.background = "transparent")}
          >
            {dialog.cancelText || "Cancel"}
          </button>
          <button
            ref={confirmBtnRef}
            onClick={handleConfirm}
            aria-label={dialog.confirmText || "Confirm"}
            style={{
              padding: "0.6rem 1.2rem",
              borderRadius: "6px",
              border: "none",
              background: dialog.isDanger ? "#ef4444" : "var(--color-primary, #007bff)",
              color: "white",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.target.opacity = 0.9)}
            onMouseLeave={(e) => (e.target.opacity = 1)}
          >
            {dialog.confirmText || "Confirm"}
          </button>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ConfirmDialog;
