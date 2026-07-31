/**
 * ConnectionBadge Component
 * 
 * Displays a visual indicator showing the real-time WebSocket
 * connection status (LIVE or DISCONNECTED).
 * 
 * Used in the Home page header, Forum, and Admin dashboard
 * to give users confidence that real-time features are active.
 * 
 * @component
 */

import React from "react";

const ConnectionBadge = ({ isConnected }) => {
  const palette = isConnected
    ? {
        text: "var(--color-emerald)",
        bg: "rgba(39, 166, 68, 0.12)",
        border: "rgba(39, 166, 68, 0.35)",
        glow: "0 0 8px var(--color-emerald)",
      }
    : {
        text: "var(--color-warning-red)",
        bg: "rgba(235, 87, 87, 0.12)",
        border: "rgba(235, 87, 87, 0.35)",
        glow: "none",
      };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        fontSize: "0.75rem",
        padding: "0.2rem 0.6rem",
        borderRadius: "20px",
        background: palette.bg,
        color: palette.text,
        border: `1px solid ${palette.border}`,
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: palette.text,
          boxShadow: palette.glow,
        }}
      ></span>
      {isConnected ? "Live" : "Offline"}
    </div>
  );
};

export default ConnectionBadge;
