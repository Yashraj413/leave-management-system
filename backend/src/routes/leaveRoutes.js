const express = require('express');
const {
  createLeave,
  getMyLeaves,
  getLeaveById,
  updateLeave,
  cancelLeave,
  getEmployeeDashboard,
} = require('../controllers/leaveController');
const { approveLeave, rejectLeave } = require('../controllers/managerController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createLeaveSchema, updateLeaveSchema, reviewLeaveSchema } = require('../validators/leaveValidators');

const router = express.Router();

router.use(protect);

router.get('/dashboard/stats', restrictTo('employee'), getEmployeeDashboard);

router.post('/', restrictTo('employee'), validate(createLeaveSchema), createLeave);
router.get('/', restrictTo('employee'), getMyLeaves);
router.get('/:id', getLeaveById);
router.put('/:id', restrictTo('employee'), validate(updateLeaveSchema), updateLeave);
router.delete('/:id', restrictTo('employee'), cancelLeave);

router.put('/:id/approve', restrictTo('manager'), validate(reviewLeaveSchema), approveLeave);
router.put('/:id/reject', restrictTo('manager'), validate(reviewLeaveSchema), rejectLeave);

module.exports = router;
