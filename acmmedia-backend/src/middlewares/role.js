/**
 * Role-Based Access Control Middleware
 * 
 * Factory function that creates middleware to restrict route access
 * based on user roles. Must be used AFTER the auth middleware
 * (which populates req.user).
 * 
 * Usage:
 *   router.post("/", auth, role("admin"), handler);
 * 
 * @module middlewares/role
 * @param {string} requiredRole - The role required to access the route
 * @returns {Function} Express middleware function
 */

const checkRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({
        msg: "Access denied: Insufficient permissions",
      });
    }
    next();
  };
};

module.exports = checkRole;
