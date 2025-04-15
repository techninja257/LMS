const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Course = require('../models/Course');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public/Private
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate('author', 'firstName lastName profileImage')
    .populate('lessons')
    .populate('quizzes');

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  if (!course.isPublished) {
    if (!req.user || course.author.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to access this unpublished course', 403));
    }
  }

  res.status(200).json({ success: true, data: course });
});

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Instructor, Admin)
exports.createCourse = asyncHandler(async (req, res, next) => {
  try {
    // Convert modules to an object if it comes in as a JSON string
    if (typeof req.body.modules === 'string') {
      req.body.modules = JSON.parse(req.body.modules);
    }

    const course = await Course.create({
      ...req.body,
      author: req.user.id
    });

    res.status(201).json({ success: true, data: course });
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
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  if (course.author.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to submit this course', 401));
  }

  course.requiresApproval = true;
  await course.save();

  res.status(200).json({ success: true, data: course });
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

  res.status(200).json({ success: true, data: course });
});

// @desc    Publish course
// @route   PUT /api/courses/:id/publish
// @access  Private (Instructor, Admin)
exports.publishCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  if (course.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to publish this course', 401));
  }

  if (!course.isApproved && req.user.role !== 'admin') {
    return next(new ErrorResponse('Course must be approved before publishing', 400));
  }

  course.isPublished = req.body.isPublished;
  await course.save();

  res.status(200).json({ success: true, data: course });
});

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private
exports.enrollCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

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
