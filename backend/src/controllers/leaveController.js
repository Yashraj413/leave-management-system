const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const Leave = require('../models/Leave');

// Inclusive day count between two dates (simple version; a real system
// would also exclude weekends/holidays via a company calendar).
const calculateDays = (start, end) => {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const diff = Math.round((new Date(end) - new Date(start)) / MS_PER_DAY) + 1;
  return diff > 0 ? diff : 0;
};

// @route   POST /api/leaves
// @access  Private (employee)
const createLeave = asyncHandler(async (req, res) => {
  const { leaveType, startDate, endDate, reason } = req.body;

  if (new Date(startDate) < new Date(new Date().toDateString())) {
    throw new AppError('startDate cannot be in the past', 400);
  }

  const totalDays = calculateDays(startDate, endDate);
  if (totalDays <= 0) throw new AppError('endDate must be on or after startDate', 400);

  if (totalDays > req.user.leaveBalance) {
    throw new AppError(
      `Insufficient leave balance. You have ${req.user.leaveBalance} day(s) remaining.`,
      400
    );
  }

  const leave = await Leave.create({
    employee: req.user._id,
    leaveType,
    startDate,
    endDate,
    totalDays,
    reason,
  });

  res.status(201).json({ success: true, message: 'Leave request submitted', data: leave });
});

// @route   GET /api/leaves
// @access  Private (employee sees own; manager sees team via /pending-leaves instead)
// Supports ?status=&type=&search=&page=&limit=
const getMyLeaves = asyncHandler(async (req, res) => {
  const { status, leaveType, page = 1, limit = 10 } = req.query;

  const filter = { employee: req.user._id };
  if (status) filter.status = status;
  if (leaveType) filter.leaveType = leaveType;

  const skip = (Number(page) - 1) * Number(limit);

  const [leaves, total] = await Promise.all([
    Leave.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Leave.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: leaves,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
  });
});

// @route   GET /api/leaves/:id
// @access  Private (owner or manager)
const getLeaveById = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id).populate('employee', 'name email department');
  if (!leave) throw new AppError('Leave request not found', 404);

  if (req.user.role !== 'manager' && String(leave.employee._id) !== String(req.user._id)) {
    throw new AppError('You are not authorized to view this leave request', 403);
  }

  res.status(200).json({ success: true, data: leave });
});

// @route   PUT /api/leaves/:id
// @access  Private (owner only, and only while Pending)
const updateLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);
  if (!leave) throw new AppError('Leave request not found', 404);

  if (String(leave.employee) !== String(req.user._id)) {
    throw new AppError('You are not authorized to edit this leave request', 403);
  }
  if (leave.status !== 'Pending') {
    throw new AppError(`Only pending requests can be edited (current status: ${leave.status})`, 400);
  }

  const { leaveType, startDate, endDate, reason } = req.body;
  if (leaveType) leave.leaveType = leaveType;
  if (startDate) leave.startDate = startDate;
  if (endDate) leave.endDate = endDate;
  if (reason) leave.reason = reason;

  if (startDate || endDate) {
    leave.totalDays = calculateDays(leave.startDate, leave.endDate);
    if (leave.totalDays <= 0) throw new AppError('endDate must be on or after startDate', 400);
  }

  await leave.save();
  res.status(200).json({ success: true, message: 'Leave request updated', data: leave });
});

// @route   DELETE /api/leaves/:id
// @access  Private (owner only; cancels a Pending request rather than hard-deleting,
//          preserving audit history — see managerComments/reviewedAt trail)
const cancelLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);
  if (!leave) throw new AppError('Leave request not found', 404);

  if (String(leave.employee) !== String(req.user._id)) {
    throw new AppError('You are not authorized to cancel this leave request', 403);
  }
  if (leave.status !== 'Pending') {
    throw new AppError(`Only pending requests can be cancelled (current status: ${leave.status})`, 400);
  }

  leave.status = 'Cancelled';
  await leave.save();

  res.status(200).json({ success: true, message: 'Leave request cancelled', data: leave });
});

// @route   GET /api/leaves/dashboard/stats
// @access  Private (employee)
const getEmployeeDashboard = asyncHandler(async (req, res) => {
  const employeeId = req.user._id;

  const [total, approved, pending, rejected, recent] = await Promise.all([
    Leave.countDocuments({ employee: employeeId }),
    Leave.countDocuments({ employee: employeeId, status: 'Approved' }),
    Leave.countDocuments({ employee: employeeId, status: 'Pending' }),
    Leave.countDocuments({ employee: employeeId, status: 'Rejected' }),
    Leave.find({ employee: employeeId }).sort({ updatedAt: -1 }).limit(5),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalRequests: total,
      approvedRequests: approved,
      pendingRequests: pending,
      rejectedRequests: rejected,
      leaveBalance: req.user.leaveBalance,
      recentActivity: recent,
    },
  });
});

module.exports = {
  createLeave,
  getMyLeaves,
  getLeaveById,
  updateLeave,
  cancelLeave,
  getEmployeeDashboard,
  calculateDays,
};
