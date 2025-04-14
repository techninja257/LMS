const express = require('express');
const { 
  register, 
  login, 
  logout, 
  getMe, 
  forgotPassword, 
  resetPassword, 
  updateDetails,
  updatePassword,
  verifyEmail
} = require('../controllers/authController');

const router = express.Router();

// Import authentication middleware
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.use(protect); // All routes below this will use the protect middleware
router.get('/logout', logout);
router.get('/me', getMe);
router.put('/update-details', updateDetails);
router.put('/update-password', updatePassword);

module.exports = router;