const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadProfileImage,
  getUserProfile,
  resetUserPassword
} = require('../controllers/userController');

// Include advanced results middleware
const advancedResults = require('../middleware/advancedResults');
const User = require('../models/User');

// Include auth middleware
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleAccess');

// Include file upload middleware
const cloudStorage = require('../config/cloudStorage');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// User profile routes
router.get('/:id/profile', getUserProfile);
router.put('/:id/photo', cloudStorage.upload.profileImage.single('file'), uploadProfileImage);

// Admin only routes
router.use(authorize('admin'));

router.route('/')
  .get(advancedResults(User), getUsers)
  .post(createUser);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

router.put('/:id/reset-password', resetUserPassword);

module.exports = router;