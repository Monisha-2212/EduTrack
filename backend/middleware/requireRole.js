/**
 * Factory function that returns middleware enforcing a specific role.
 * @param {string} role - Required role: 'student' or 'faculty'
 */
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({
        message: `Access denied. This route requires the '${role}' role.`,
      });
    }
    next();
  };
};

export default requireRole;
