const { z } = require('zod');

const createLeaveSchema = z.object({
  leaveType: z.enum(['Sick', 'Casual', 'Earned', 'Unpaid', 'Maternity', 'Paternity']),
  startDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid startDate'),
  endDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid endDate'),
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(1000),
});

const updateLeaveSchema = z.object({
  leaveType: z.enum(['Sick', 'Casual', 'Earned', 'Unpaid', 'Maternity', 'Paternity']).optional(),
  startDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid startDate').optional(),
  endDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid endDate').optional(),
  reason: z.string().min(5).max(1000).optional(),
});

const reviewLeaveSchema = z.object({
  managerComments: z.string().max(1000).optional().default(''),
});

module.exports = { createLeaveSchema, updateLeaveSchema, reviewLeaveSchema };
