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
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        fontSize: "0.75rem",
        padding: "0.2rem 0.6rem",
        borderRadius: "20px",
        background: isConnected
          ? "rgba(0, 255, 0, 0.1)"
          : "rgba(255, 0, 0, 0.1)",
        color: isConnected ? "#4ade80" : "#f87171",
        border: `1px solid ${isConnected ? "#4ade8055" : "#f8717155"}`,
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: isConnected ? "#4ade80" : "#f87171",
          boxShadow: isConnected ? "0 0 8px #4ade80" : "none",
        }}
      ></span>
      {isConnected ? "LIVE" : "DISCONNECTED"}
    </div>
  );
};

export default ConnectionBadge;
