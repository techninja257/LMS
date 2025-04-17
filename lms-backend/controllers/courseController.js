const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Course = require('../models/Course');
const asyncHandler = require('express-async-handler');
const Course = require('../models/courseModel');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});


// Get a single course by ID
const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Check if user is the course author or admin
  if (course.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to access this course');
  }

  res.status(200).json(course);
});



// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public/Private (depending on course status)
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate('author', 'firstName lastName profileImage')
    .populate('lessons')
    .populate('quizzes');

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Check permissions based on course status
  // 1. Published courses are visible to everyone
  // 2. Unpublished courses are only visible to their author, instructors, or admins
  if (!course.isPublished) {
    // Check if user is logged in
    if (!req.user) {
      return next(new ErrorResponse(`Course not found`, 404));
    }
    
    // Check if user is the author, admin, or instructor
    const authorId = course.author._id ? course.author._id.toString() : course.author.toString();
    if (req.user.role !== 'admin' && req.user.role !== 'instructor' && req.user.id !== authorId) {
      return next(new ErrorResponse(`Course not found`, 404));
    }
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Instructor, Admin)
exports.createCourse = asyncHandler(async (req, res, next) => {
  try {
    // Convert modules to an object if it comes in as a JSON string
    if (typeof req.body.modules === 'string') {
      req.body.modules = JSON.parse(req.body.modules);
    }
    
    // Handle prerequisites and learning objectives
    if (typeof req.body.prerequisites === 'string') {
      req.body.prerequisites = JSON.parse(req.body.prerequisites);
    }
    
    if (typeof req.body.learningObjectives === 'string') {
      req.body.learningObjectives = JSON.parse(req.body.learningObjectives);
    }
    
    // Capitalize the level
    if (req.body.level) {
      req.body.level = req.body.level.charAt(0).toUpperCase() + req.body.level.slice(1);
    }

    // Add user to req.body
    req.body.author = req.user.id;
    
    // Set initial states for new course
    req.body.isPublished = false;
    req.body.isApproved = false;
    
    // Auto-approve courses created by admins
    if (req.user.role === 'admin') {
      req.body.isApproved = true;
      req.body.approvedBy = req.user.id;
    }

    // Create course
    const course = await Course.create(req.body);

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor, Admin)
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  if (course.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this course', 401));
  }

  // Capitalize the level if it's being updated
  if (req.body.level) {
    req.body.level = req.body.level.charAt(0).toUpperCase() + req.body.level.slice(1);
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: course });
});

// @desc    Submit course for approval
// @route   PUT /api/courses/:id/submit
// @access  Private (Instructor)
exports.submitCourseForApproval = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is course author
  if (course.author.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this course`, 401));
  }

  // Update course status
  course.requiresApproval = true;
  await course.save();

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Approve course
// @route   PUT /api/courses/:id/approve
// @access  Private (Admin)
exports.approveCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  course.isApproved = true;
  course.approvedBy = req.user.id;
  await course.save();

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Publish course
// @route   PUT /api/courses/:id/publish
// @access  Private (Instructor, Admin)
exports.publishCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is course author or admin
  if (course.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to publish this course`, 401));
  }

  // Check if course is approved
  if (!course.isApproved && req.user.role !== 'admin') {
    return next(new ErrorResponse('Course must be approved before publishing', 400));
  }

  // Update course status
  course.isPublished = req.body.isPublished;
  await course.save();

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private
// Updated enrollCourse controller function

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private
// Updated enrollCourse controller function

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private
exports.enrollCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  // Prevent instructors and admins from enrolling in courses
  if (req.user.role === 'instructor' || req.user.role === 'admin') {
    return next(new ErrorResponse('Instructors and admins cannot enroll in courses', 403));
  }

  // Check if course author is trying to enroll in their own course
  if (course.author.toString() === req.user.id) {
    return next(new ErrorResponse('You cannot enroll in your own course', 403));
  }

  // Check if already enrolled
  if (!course.enrolledUsers.includes(req.user.id)) {
    course.enrolledUsers.push(req.user.id);
    await course.save();
  }

  res.status(200).json({ success: true, data: course });
});


// @desc    Unenroll from a course
// @route   DELETE /api/courses/:id/enroll
// @access  Private
exports.unenrollCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  course.enrolledUsers = course.enrolledUsers.filter(
    userId => userId.toString() !== req.user.id
  );

  await course.save();

  res.status(200).json({ success: true, data: course });
});

// @desc    Get enrolled courses for current user
// @route   GET /api/courses/enrolled
// @access  Private
exports.getEnrolledCourses = asyncHandler(async (req, res, next) => {
  const courses = await Course.find({ enrolledUsers: req.user.id });

  res.status(200).json({ success: true, data: courses });
});

// @desc    Upload course image
// @route   PUT /api/courses/:id/photo
// @access  Private (Instructor, Admin)
exports.uploadCourseImage = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  if (!req.file || !req.file.path) {
    return next(new ErrorResponse('Image upload failed', 400));
  }

  course.image = req.file.path;
  await course.save();

  res.status(200).json({ success: true, data: course });
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor, Admin)
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  if (course.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this course', 401));
  }

  await course.deleteOne();

  res.status(200).json({ success: true, data: {} });
});