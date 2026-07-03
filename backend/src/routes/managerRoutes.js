const express = require('express');
const { getPendingLeaves, getManagerDashboard } = require('../controllers/managerController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect, restrictTo('manager'));

router.get('/pending-leaves', getPendingLeaves);
router.get('/manager/dashboard/stats', getManagerDashboard);

module.exports = router;
