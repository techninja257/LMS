const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');
const Course = require('../models/Course');
const mongoose = require('mongoose');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  // Ensure advancedResults middleware is applied
  const results = res.advancedResults;

  // Populate createdBy field in the query
  const query = Course.find()
    .populate('createdBy', 'firstName lastName profileImage')
    .lean();

  // Apply advancedResults query modifications (e.g., pagination, filtering)
  const courses = await query
    .skip(results.skip)
    .limit(results.limit)
    .sort(results.sort);

  // Filter out courses with invalid createdBy
  const validCourses = courses.filter((course) => {
    if (!course.createdBy || !course.createdBy.firstName) {
      console.warn(`Course ${course._id} has no valid createdBy`);
      return false;
    }
    return true;
  });

  res.status(200).json({
    success: true,
    count: validCourses.length,
    total: results.total,
    data: validCourses,
    pagination: results.pagination,
  });
});

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public/Private (depending on course status)
exports.getCourse = asyncHandler(async (req, res, next) => {
  console.log("Querying course ID:", req.params.id);

  const course = await Course.findById(req.params.id)
    .populate('createdBy', 'firstName lastName profileImage')
    .populate('lessons')
    .populate('quizzes');

  console.log("Course found:", course ? { id: course._id, title: course.title, quizzes: course.quizzes } : null);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Check permissions based on course status
  if (!course.isPublished) {
    if (!req.user) {
      return next(new ErrorResponse(`Course not found`, 404));
    }

    const createdById = course.createdBy._id ? course.createdBy._id.toString() : course.createdBy.toString();
    console.log("User:", req.user.id, "CreatedBy:", createdById, "Role:", req.user.role);

    if (req.user.role !== 'admin' && req.user.role !== 'instructor' && req.user.id !== createdById) {
      return next(new ErrorResponse(`Course not found`, 404));
    }
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Instructor, Admin)
exports.createCourse = asyncHandler(async (req, res, next) => {
  try {
    // Log request body for debugging
    console.log("Request body:", req.body);

    // Convert modules to an object if it comes in as a JSON string
    if (typeof req.body.modules === 'string') {
      req.body.modules = JSON.parse(req.body.modules);
    }

    // Sanitize modules to ensure lessons are valid ObjectIds or empty
    if (req.body.modules && Array.isArray(req.body.modules)) {
      req.body.modules = req.body.modules.map(module => {
        if (module.lessons) {
          // If lessons are provided, ensure they are valid ObjectIds
          if (!Array.isArray(module.lessons) || module.lessons.some(lesson => {
            return typeof lesson !== 'string' || !mongoose.Types.ObjectId.isValid(lesson);
          })) {
            throw new Error('Lessons must be an array of valid ObjectIds');
          }
        } else {
          // If no lessons, set to empty array
          module.lessons = [];
        }
        return module;
      });
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
    req.body.createdBy = req.user.id;

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
      data: course,
    });
  } catch (err) {
    console.error("Course creation error:", err.message);
    return next(new ErrorResponse(`Invalid course data: ${err.message}`, 400));
  }
});

// Remaining functions (unchanged)
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  if (course.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this course', 401));
  }

  if (req.body.level) {
    req.body.level = req.body.level.charAt(0).toUpperCase() + req.body.level.slice(1);
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: course });
});

exports.submitCourseForApproval = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  if (course.createdBy.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this course`, 401));
  }

  course.requiresApproval = true;
  await course.save();

  res.status(200).json({
    success: true,
    data: course,
  });
});

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
    data: course,
  });
});

exports.publishCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  if (course.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to publish this course`, 401));
  }

  if (!course.isApproved && req.user.role !== 'admin') {
    return next(new ErrorResponse('Course must be approved before publishing', 400));
  }

  course.isPublished = req.body.isPublished;
  await course.save();

  res.status(200).json({
    success: true,
    data: course,
  });
});

exports.enrollCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  if (req.user.role === 'instructor' || req.user.role === 'admin') {
    return next(new ErrorResponse('Instructors and admins cannot enroll in courses', 403));
  }

  if (course.createdBy.toString() === req.user.id) {
    return next(new ErrorResponse('You cannot enroll in your own course', 403));
  }

  if (!course.enrolledUsers.includes(req.user.id)) {
    course.enrolledUsers.push(req.user.id);
    await course.save();
  }

  res.status(200).json({ success: true, data: course });
});

exports.unenrollCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  course.enrolledUsers = course.enrolledUsers.filter(
    (userId) => userId.toString() !== req.user.id
  );

  await course.save();

  res.status(200).json({ success: true, data: course });
});

exports.getEnrolledCourses = asyncHandler(async (req, res, next) => {
  const courses = await Course.find({ enrolledUsers: req.user.id })
    .populate('createdBy', 'firstName lastName profileImage');

  res.status(200).json({ success: true, data: courses });
});

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

exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  if (course.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this course', 401));
  }

  await course.deleteOne();

  res.status(200).json({ success: true, data: {} });
});