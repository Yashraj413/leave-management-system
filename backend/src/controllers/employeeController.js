const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const Employee = require('../models/Employee');
const Leave = require('../models/Leave');

// @route   GET /api/employees
// @access  Private (manager only)
// Supports ?search=&department=&page=&limit=
const getEmployees = asyncHandler(async (req, res) => {
  const { search = '', department, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (department) filter.department = department;

  const skip = (Number(page) - 1) * Number(limit);

  const [employees, total] = await Promise.all([
    Employee.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    Employee.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: employees,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) throw new AppError('Employee not found', 404);

  // Employees may only view their own profile; managers can view anyone.
  if (req.user.role !== 'manager' && String(req.user._id) !== String(employee._id)) {
    throw new AppError('You are not authorized to view this profile', 403);
  }

  res.status(200).json({ success: true, data: employee });
});

// @route   GET /api/employees/:id/leave-history
// @access  Private (manager, or the employee themself)
const getEmployeeLeaveHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'manager' && String(req.user._id) !== String(id)) {
    throw new AppError('You are not authorized to view this history', 403);
  }

  const leaves = await Leave.find({ employee: id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: leaves });
});

module.exports = { getEmployees, getEmployeeById, getEmployeeLeaveHistory };
