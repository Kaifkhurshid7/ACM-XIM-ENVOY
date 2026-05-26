/**
 * API Client Configuration
 * 
 * Creates a pre-configured Axios instance for all API communication.
 * Handles base URL resolution and automatic JWT token injection.
 * 
 * URL Resolution Strategy:
 * 1. VITE_API_BASE_URL env var (explicit override)
 * 2. Development mode: Proxy through Vite dev server (/api/v1)
 * 3. Production: Direct to Render backend URL
 * 
 * Authentication:
 * - Request interceptor automatically attaches the JWT token
 *   from localStorage to every outgoing request
 * 
 * @module api/client
 */

import axios from "axios";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? "/api/v1"
    : "https://acmmedia-backend.onrender.com/api/v1");

const client = axios.create({
  baseURL: apiBaseUrl,
});

// Attach JWT token to all requests if available
client.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default client;
