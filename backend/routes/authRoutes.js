const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  updateProfile,
  getLoginHistory,
  getMyLoginHistory
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/my-login-history', protect, getMyLoginHistory);
router.get('/login-history', protect, authorize('manager'), getLoginHistory);

module.exports = router;