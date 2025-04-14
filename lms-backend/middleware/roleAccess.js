const ErrorResponse = require('../utils/errorResponse');

/**
 * Role-based access control middleware
 * @param {...string} roles - Roles allowed to access the route
 * @returns {function} - Express middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // At this point, we assume the auth middleware has already run
    // and added the user to the request object
    if (!req.user) {
      return next(new ErrorResponse('User not authenticated', 401));
    }

    // Check if user's role is included in the authorized roles
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }

    next();
  };
};

module.exports = authorize;