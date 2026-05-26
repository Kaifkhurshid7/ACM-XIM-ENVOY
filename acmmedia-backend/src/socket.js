/**
 * Socket.IO Real-Time Communication Layer
 * 
 * Manages WebSocket connections for real-time features:
 * - Live analytics updates pushed to admin dashboard
 * - Post like count updates broadcast to all connected clients
 * - Forum reply notifications for active thread viewers
 * 
 * Architecture:
 * - Admin clients authenticate via token and join the "admins" room
 * - Analytics updates are scoped to admin room only (security)
 * - Public events (likes, replies) are broadcast to all clients
 * 
 * @module socket
 */

const { getAnalytics } = require("./services/analyticsService");
const jwt = require("jsonwebtoken");
const SECRET = require("./config/jwt");
const { SOCKET_EVENTS } = require("./constants");

let io;

/**
 * Initializes Socket.IO on the HTTP server.
 * Sets up connection handlers and room-based authentication.
 * 
 * @param {object} httpServer - Node.js HTTP server instance
 * @returns {object} Socket.IO server instance
 */
const init = (httpServer) => {
  io = require("socket.io")(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  console.log("✓ Socket.IO initialized");

  io.on("connection", (socket) => {
    // Admin authentication - allows joining the privileged "admins" room
    socket.on("auth", (token) => {
      try {
        const decoded = jwt.verify(token, SECRET);
        if (decoded.role === "admin") {
          socket.join("admins");
        }
      } catch (err) {
        console.error("Socket auth error:", err.message);
      }
    });

    socket.on("disconnect", () => {
      // Connection cleanup handled automatically by Socket.IO
    });
  });

  return io;
};

/**
 * Returns the active Socket.IO instance.
 * @throws {Error} If called before init()
 */
const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};

/**
 * Computes and emits updated analytics to all connected admin clients.
 * Called after any content mutation (post create/delete, like, comment, etc.)
 */
const emitAnalytics = async () => {
  if (!io) return;
  const analytics = await getAnalytics();
  if (analytics) {
    io.to("admins").emit(SOCKET_EVENTS.ANALYTICS_UPDATE, analytics);
  }
};

module.exports = { init, getIO, emitAnalytics };
