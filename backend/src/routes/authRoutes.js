const express = require('express');
const { login, logout, refresh, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { loginSchema } = require('../validators/authValidators');

const router = express.Router();

router.post('/login', validate(loginSchema), login);
router.post('/logout', protect, logout);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);

module.exports = router;
