// Wraps async route handlers so thrown/rejected errors are forwarded to
// the centralized error handler instead of needing try/catch everywhere.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
