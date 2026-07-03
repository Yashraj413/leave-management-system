const express = require('express');
const { getEmployees, getEmployeeById, getEmployeeLeaveHistory } = require('../controllers/employeeController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', restrictTo('manager'), getEmployees);
router.get('/:id', getEmployeeById);
router.get('/:id/leave-history', getEmployeeLeaveHistory);

module.exports = router;
