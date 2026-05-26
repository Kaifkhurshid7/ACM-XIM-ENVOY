/**
 * Application Entry Point
 * 
 * Bootstraps the React application with required context providers.
 * 
 * Provider Hierarchy:
 * 1. AuthProvider - Global authentication state
 * 2. SocketProvider - WebSocket connection for real-time features
 * 3. App - Router and page components
 * 
 * Global styles are imported here to ensure they load before
 * any component renders.
 * 
 * @module main
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import "./index.css";
import "./styles/auth.css";
import "./styles/events.css";
import "./styles/home.css";
import "./styles/forum.css";
import "./styles/navbar.css";
import "./styles/profile.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>
);
