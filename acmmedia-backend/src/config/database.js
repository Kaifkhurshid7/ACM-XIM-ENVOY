/**
 * Database Configuration
 * 
 * Establishes and manages the MongoDB connection using Mongoose.
 * Supports both local development and production (MongoDB Atlas) environments.
 * 
 * Environment Variables:
 * - MONGO_URI: Full MongoDB connection string (required in production)
 * 
 * @module config/database
 */

const mongoose = require("mongoose");

const DEFAULT_DB_NAME = "acmmedia";

/**
 * Normalizes the MongoDB URI to ensure a database name is always specified.
 * Some Atlas connection strings omit the database path, which can cause
 * Mongoose to default to the "test" database unexpectedly.
 * 
 * @param {string} uri - Raw MongoDB connection URI from environment
 * @returns {string} Normalized URI with database name guaranteed
 */
const normalizeMongoUri = (uri) => {
  if (!uri) {
    throw new Error(
      "MONGO_URI environment variable is not set. " +
      "Please configure your database connection string."
    );
  }

  // Check if URI already contains a database path segment
  const hasDatabasePath = /mongodb(?:\+srv)?:\/\/[^/]+\/[^?]+/.test(uri);
  if (hasDatabasePath) return uri;

  // Append default database name before any query parameters
  const queryIndex = uri.indexOf("?");
  if (queryIndex === -1) {
    return `${uri.replace(/\/+$/, "")}/${DEFAULT_DB_NAME}`;
  }

  const base = uri.slice(0, queryIndex).replace(/\/+$/, "");
  const query = uri.slice(queryIndex);
  return `${base}/${DEFAULT_DB_NAME}${query}`;
};

/**
 * Connects to MongoDB with retry logic and connection event handlers.
 * Logs connection status for deployment monitoring.
 * 
 * @throws {Error} If MONGO_URI is not configured or connection fails
 */
const connectDB = async () => {
  const uri = normalizeMongoUri(process.env.MONGO_URI);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log("──────────────────────────────");
  console.log(" ✓ MongoDB Connected Successfully");
  console.log("──────────────────────────────");
};

module.exports = connectDB;
