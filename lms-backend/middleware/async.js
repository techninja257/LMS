/**
 * Async handler wrapper to eliminate try-catch blocks in routes
 * @param {Function} fn - Async function to execute
 * @returns {Function} - Express middleware function
 */
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
  
  module.exports = asyncHandler;