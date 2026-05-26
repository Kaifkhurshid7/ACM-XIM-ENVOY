/**
 * Authentication Middleware
 * 
 * Verifies JWT tokens from the Authorization header and attaches
 * the decoded user payload (id, role) to the request object.
 * 
 * Token Format: "Bearer <token>" or raw token string
 * 
 * Flow:
 * 1. Extract token from Authorization header
 * 2. Verify token signature against JWT secret
 * 3. Attach decoded payload to req.user
 * 4. Pass control to next middleware/handler
 * 
 * @module middlewares/auth
 */

const jwt = require("jsonwebtoken");
const SECRET = require("../config/jwt");

const authenticate = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ msg: "No token" });
  }

  // Support both "Bearer <token>" and raw token formats
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};

module.exports = authenticate;
