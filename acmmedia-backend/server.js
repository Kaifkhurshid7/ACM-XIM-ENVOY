/**
 * ACM-XIM-ENVOY Backend Server
 * 
 * Entry point for the Express.js application.
 * Initializes middleware, routes, database connection, and Socket.IO.
 * 
 * Architecture:
 * - Express handles HTTP requests with JSON body parsing and CORS
 * - MongoDB (via Mongoose) provides persistent data storage
 * - Socket.IO enables real-time features (live analytics, likes, replies)
 * - Swagger UI serves interactive API documentation at /api-docs
 * 
 * Deployment:
 * - Vercel: Serverless via vercel.json (routes all to server.js)
 * - Render: Traditional Node.js process with PORT env variable
 * 
 * @module server
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const connectDB = require("./src/config/database");
const swaggerSpec = require("./src/docs/swagger");
const mountRoutes = require("./src/routes");
const { notFoundHandler, errorHandler } = require("./src/middlewares/errorHandler");

const app = express();

// ─── Middleware Stack ────────────────────────────────────────────────────────

// CORS - Allow cross-origin requests from frontend
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// ─── Health Check Endpoints ──────────────────────────────────────────────────
// Used by deployment platforms (Render, Vercel) to verify service health

app.get("/", (req, res) => res.send("Server: Health OK"));
app.get("/api", (req, res) => res.send("API: Health OK"));
app.get("/api/v1", (req, res) => res.send("API v1: Health OK"));

// ─── API Documentation ──────────────────────────────────────────────────────

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Static Files ────────────────────────────────────────────────────────────

app.use("/uploads", express.static("uploads"));

// ─── API Routes ──────────────────────────────────────────────────────────────

mountRoutes(app);

// ─── Error Handling ──────────────────────────────────────────────────────────

app.use(notFoundHandler);
app.use(errorHandler);

// ─── Server Startup ──────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`✓ Server active on port ${PORT}`);
      console.log(`✓ API docs: http://localhost:${PORT}/api-docs`);
    });

    // Initialize Socket.IO after HTTP server is ready
    require("./src/socket").init(server);
  } catch (err) {
    console.error("Server startup failed:", err.message);
    process.exit(1);
  }
};

startServer();
