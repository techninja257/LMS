const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const config = require('../config/config');

/**
 * Protect routes - Verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // If no token found in headers, check for JWT cookie
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    console.error('No token provided');
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    console.log('Verifying token:', token.slice(0, 20) + '...');
    const decoded = jwt.verify(token, config.jwt.secret);
    console.log('Decoded token:', decoded);

    // Add user to request object
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      console.error(`User not found: ${decoded.id}`);
      return next(new ErrorResponse('User not found', 404));
    }

    console.log('Authenticated user:', { id: req.user.id, role: req.user.role });
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

/**
 * Check if user account is active
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function 
 */
exports.accountActive = async (req, res, next) => {
  if (!req.user.isActive) {
    console.error(`Inactive account: ${req.user.id}`);
    return next(new ErrorResponse('Your account is currently inactive', 403));
  }
  
  next();
};