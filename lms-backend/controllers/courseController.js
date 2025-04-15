const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Lesson = require('../models/Lesson');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const cloudStorage = require('../config/cloudStorage');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  // If user is not admin or instructor, only show published courses
  if (req.user && (req.user.role === 'admin' || req.user.role === 'instructor')) {
    res.status(200).json(res.advancedResults);
  } else {
    // Filter only published courses for students and public
    const publishedFilter = { isPublished: true };
    
    // Merge with any existing filters in advancedResults
    if (res.advancedResults && res.advancedResults.data) {
      // Apply published filter
      const filteredData = res.advancedResults.data.filter(course => course.isPublished);
      
      res.status(200).json({
        ...res.advancedResults,
        count: filteredData.length,
        data: filteredData
      });
    } else {
      // If for some reason advancedResults is not available, do a basic query
      const courses = await Course.find(publishedFilter);
      
      res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
      });
    }
  }
});

// Fix for courseController.js - getCourse function
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate('author', 'firstName lastName profileImage')
    .populate('lessons')
    .populate('quizzes');

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Modified condition: Allow course author to access their own unpublished course
  if (!course.isPublished) {
    // Check if user is logged in
    if (!req.user) {
      return next(new ErrorResponse(`Course not published`, 403));
    }
    
    // Check if user is the author, admin, or instructor
    const authorId = course.author._id ? course.author._id.toString() : course.author.toString();
    if (req.user.role !== 'admin' && req.user.role !== 'instructor' && req.user.id !== authorId) {
      return next(new ErrorResponse(`Course not published or you're not authorized to access this course`, 403));
    }
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Instructor,Admin
exports.createCourse = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.author = req.user.id;
  
  // Instructors don't need approval if requiresApproval is set to false
  if (req.user.role === 'admin') {
    req.body.isApproved = true;
    req.body.approvedBy = req.user.id;
  }

  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    data: course
  });
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Instructor,Admin
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is course author or admin
  if (course.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this course`, 401));
  }

  // If course was already approved and not an admin, don't allow changing approval-related fields
  if (course.isApproved && req.user.role !== 'admin') {
    delete req.body.isApproved;
    delete req.body.approvedBy;
  }

  // If admin is approving the course
  if (req.user.role === 'admin' && req.body.isApproved === true) {
    req.body.approvedBy = req.user.id;
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Instructor,Admin
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is course author or admin
  if (course.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this course`, 401));
  }

  // Delete course image if not the default
  if (course.coverImage && course.coverImage !== 'default-course.jpg') {
    await cloudStorage.deleteFile(course.coverImage);
  }

  // Delete lessons, quizzes, and enrollments manually
  // (this would be handled by pre-remove hook, but just to be explicit)
  await Lesson.deleteMany({ course: course._id });
  await Enrollment.deleteMany({ course: course._id });

  await course.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Upload course image
// @route   PUT /api/courses/:id/photo
// @access  Private/Instructor,Admin
exports.uploadCourseImage = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is course author or admin
  if (course.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this course`, 401));
  }

  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  // Delete previous course image if not the default
  if (course.coverImage && course.coverImage !== 'default-course.jpg') {
    await cloudStorage.deleteFile(course.coverImage);
  }

  // Update course image
  course.coverImage = req.file.location;
  await course.save();

  res.status(200).json({
    success: true,
    data: {
      coverImage: course.coverImage
    }
  });
});

// @desc    Enroll user in course
// @route   POST /api/courses/:id/enroll
// @access  Private
exports.enrollCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Check if course is published
  if (!course.isPublished) {
    return next(new ErrorResponse('Cannot enroll in unpublished course', 400));
  }

  // Check if user is already enrolled
  const existingEnrollment = await Enrollment.findOne({
    user: req.user.id,
    course: req.params.id
  });

  if (existingEnrollment) {
    return next(new ErrorResponse('User already enrolled in this course', 400));
  }

  // Create enrollment
  const enrollment = await Enrollment.create({
    user: req.user.id,
    course: req.params.id
  });

  res.status(200).json({
    success: true,
    data: enrollment
  });
});

// @desc    Unenroll user from course
// @route   DELETE /api/courses/:id/enroll
// @access  Private
exports.unenrollCourse = asyncHandler(async (req, res, next) => {
  // Find the enrollment
  const enrollment = await Enrollment.findOne({
    user: req.user.id,
    course: req.params.id
  });

  if (!enrollment) {
    return next(new ErrorResponse('Enrollment not found', 404));
  }

  // Delete the enrollment
  await enrollment.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get enrolled courses for user
// @route   GET /api/courses/enrolled
// @access  Private
exports.getEnrolledCourses = asyncHandler(async (req, res, next) => {
  const enrollments = await Enrollment.find({ user: req.user.id })
    .populate({
      path: 'course',
      select: 'title description category level coverImage duration'
    });

  const courses = enrollments.map(enrollment => ({
    ...enrollment.course.toObject(),
    enrollmentId: enrollment._id,
    enrollmentDate: enrollment.enrollmentDate,
    completionPercentage: enrollment.completionPercentage,
    status: enrollment.status
  }));

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});

// @desc    Approve course (admin only)
// @route   PUT /api/courses/:id/approve
// @access  Private/Admin
exports.approveCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  course.isApproved = true;
  course.approvedBy = req.user.id;
  
  await course.save();

  res.status(200).json({
    success: true,
    data: course
  });
});