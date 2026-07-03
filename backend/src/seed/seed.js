// Seeds the database with a manager, a few employees, and sample leave
// requests so the app is immediately explorable after setup.
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const Leave = require('../models/Leave');
const logger = require('../utils/logger');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  logger.info('Connected for seeding...');

  await Employee.deleteMany({});
  await Leave.deleteMany({});

  const manager = await Employee.create({
    name: 'Priya Sharma',
    email: 'manager@company.com',
    password: 'Manager@123',
    department: 'Engineering',
    role: 'manager',
    leaveBalance: 20,
  });

  const employee1 = await Employee.create({
    name: 'Yash Raj',
    email: 'employee@company.com',
    password: 'Employee@123',
    department: 'Engineering',
    role: 'employee',
    manager: manager._id,
    leaveBalance: 18,
  });

  const employee2 = await Employee.create({
    name: 'Ananya Gupta',
    email: 'ananya@company.com',
    password: 'Employee@123',
    department: 'Engineering',
    role: 'employee',
    manager: manager._id,
    leaveBalance: 20,
  });

  await Leave.create([
    {
      employee: employee1._id,
      leaveType: 'Sick',
      startDate: new Date('2026-07-10'),
      endDate: new Date('2026-07-11'),
      totalDays: 2,
      reason: 'Fever and doctor-advised rest',
      status: 'Pending',
    },
    {
      employee: employee1._id,
      leaveType: 'Casual',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-01'),
      totalDays: 1,
      reason: 'Personal errand',
      status: 'Approved',
      reviewedBy: manager._id,
      reviewedAt: new Date('2026-05-28'),
      managerComments: 'Approved, enjoy your day off.',
    },
    {
      employee: employee2._id,
      leaveType: 'Earned',
      startDate: new Date('2026-07-15'),
      endDate: new Date('2026-07-18'),
      totalDays: 4,
      reason: 'Family function out of town',
      status: 'Pending',
    },
  ]);

  logger.info('Seed complete!');
  logger.info('Manager login  -> manager@company.com / Manager@123');
  logger.info('Employee login -> employee@company.com / Employee@123');

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  logger.error(err.message);
  process.exit(1);
});
