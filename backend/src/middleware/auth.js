const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const Employee = require('../models/Employee');

// Verifies the JWT (from Authorization header) and attaches req.user.
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Not authorized. Please log in.', 401);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await Employee.findById(decoded.id);

  if (!user || !user.isActive) {
    throw new AppError('The user for this token no longer exists or is inactive.', 401);
  }

  req.user = user;
  next();
});

// Role-based access control: restrict(['manager']) etc.
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action.', 403));
  }
  next();
};

module.exports = { protect, restrictTo };
