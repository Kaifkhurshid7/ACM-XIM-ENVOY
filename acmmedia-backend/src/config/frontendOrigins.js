/**
 * Allowed Frontend Origins
 *
 * Single source of truth for which browser origins may call the API and
 * connect over Socket.IO. Add new frontend deployment URLs (including
 * long-lived Vercel previews) here; both CORS and Socket.IO read this list.
 *
 * @module config/frontendOrigins
 */

module.exports = [
  // Local development
  "http://localhost:5173",
  "http://localhost:3000",
  // Production frontends
  "https://acmmedia-frontend.vercel.app",
  "https://acm-xim-envoy.vercel.app",
];
