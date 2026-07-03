const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const Employee = require('../models/Employee');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await Employee.findOne({ email }).select('+password');

  // Deliberately generic message: don't reveal whether email exists.
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('This account has been deactivated. Contact your administrator.', 403);
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // Refresh token as httpOnly cookie so it isn't reachable from JS (XSS mitigation)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.toSafeObject(),
      accessToken,
    },
  });
});

// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @route   POST /api/auth/refresh
// @access  Public (requires refresh token cookie)
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new AppError('No refresh token provided', 401);

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await Employee.findById(decoded.id);
  if (!user || !user.isActive) throw new AppError('Invalid refresh token', 401);

  const accessToken = generateAccessToken(user._id, user.role);
  res.status(200).json({ success: true, data: { accessToken } });
});

// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: req.user.toSafeObject() });
});

module.exports = { login, logout, refresh, getMe };
