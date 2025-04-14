const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const cloudStorage = require('../config/cloudStorage');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  // Delete user's profile image if not the default
  if (user.profileImage && user.profileImage !== 'default-profile.jpg') {
    await cloudStorage.deleteFile(user.profileImage);
  }

  // Delete user's enrollments
  await Enrollment.deleteMany({ user: user._id });

  // Delete the user
  await user.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Upload profile image
// @route   PUT /api/users/:id/photo
// @access  Private
exports.uploadProfileImage = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  // Make sure the user is the owner or an admin
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this profile`, 401));
  }

  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  // Delete previous profile image if not the default
  if (user.profileImage && user.profileImage !== 'default-profile.jpg') {
    await cloudStorage.deleteFile(user.profileImage);
  }

  // Update user profile image
  user.profileImage = req.file.location;
  await user.save();

  res.status(200).json({
    success: true,
    data: {
      profileImage: user.profileImage
    }
  });
});

// @desc    Get user profile with enrolled courses
// @route   GET /api/users/:id/profile
// @access  Private
exports.getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  // Make sure the user is the owner or an admin
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to view this profile`, 401));
  }

  // Get enrollments for the user
  const enrollments = await Enrollment.find({ user: req.params.id })
    .populate('course');

  res.status(200).json({
    success: true,
    data: {
      user,
      enrollments
    }
  });
});

// @desc    Reset user password (admin only)
// @route   PUT /api/users/:id/reset-password
// @access  Private/Admin
exports.resetUserPassword = asyncHandler(async (req, res, next) => {
  // Generate a random password
  const newPassword = Math.random().toString(36).slice(-8);
  
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  // Update user password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    data: {
      newPassword
    }
  });
});