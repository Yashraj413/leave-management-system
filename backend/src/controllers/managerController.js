const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

// @route   GET /api/pending-leaves
// @access  Private (manager)
// Supports ?search=&leaveType=&page=&limit=
const getPendingLeaves = asyncHandler(async (req, res) => {
  const { search, leaveType, page = 1, limit = 10 } = req.query;

  const filter = { status: 'Pending' };
  if (leaveType) filter.leaveType = leaveType;

  let employeeIds;
  if (search) {
    const matchedEmployees = await Employee.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    }).select('_id');
    employeeIds = matchedEmployees.map((e) => e._id);
    filter.employee = { $in: employeeIds };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [leaves, total] = await Promise.all([
    Leave.find(filter)
      .populate('employee', 'name email department')
      .sort({ createdAt: 1 }) // oldest pending first (FIFO queue for managers)
      .skip(skip)
      .limit(Number(limit)),
    Leave.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: leaves,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
  });
});

// @route   PUT /api/leaves/:id/approve
// @access  Private (manager)
const approveLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);
  if (!leave) throw new AppError('Leave request not found', 404);
  if (leave.status !== 'Pending') throw new AppError(`Cannot approve a request with status: ${leave.status}`, 400);

  const employee = await Employee.findById(leave.employee);
  if (employee.leaveBalance < leave.totalDays) {
    throw new AppError('Employee no longer has sufficient leave balance for this request', 400);
  }

  leave.status = 'Approved';
  leave.managerComments = req.body.managerComments || '';
  leave.reviewedBy = req.user._id;
  leave.reviewedAt = new Date();
  await leave.save();

  employee.leaveBalance -= leave.totalDays;
  await employee.save();

  res.status(200).json({ success: true, message: 'Leave request approved', data: leave });
});

// @route   PUT /api/leaves/:id/reject
// @access  Private (manager)
const rejectLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);
  if (!leave) throw new AppError('Leave request not found', 404);
  if (leave.status !== 'Pending') throw new AppError(`Cannot reject a request with status: ${leave.status}`, 400);

  if (!req.body.managerComments || !req.body.managerComments.trim()) {
    throw new AppError('A comment explaining the rejection is required', 400);
  }

  leave.status = 'Rejected';
  leave.managerComments = req.body.managerComments;
  leave.reviewedBy = req.user._id;
  leave.reviewedAt = new Date();
  await leave.save();

  res.status(200).json({ success: true, message: 'Leave request rejected', data: leave });
});

// @route   GET /api/manager/dashboard/stats
// @access  Private (manager)
const getManagerDashboard = asyncHandler(async (req, res) => {
  const [totalEmployees, pending, approved, rejected, recent] = await Promise.all([
    Employee.countDocuments({ role: 'employee' }),
    Leave.countDocuments({ status: 'Pending' }),
    Leave.countDocuments({ status: 'Approved' }),
    Leave.countDocuments({ status: 'Rejected' }),
    Leave.find().populate('employee', 'name').sort({ updatedAt: -1 }).limit(5),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalEmployees,
      pendingApprovals: pending,
      approvedRequests: approved,
      rejectedRequests: rejected,
      recentActivity: recent,
    },
  });
});

module.exports = { getPendingLeaves, approveLeave, rejectLeave, getManagerDashboard };
