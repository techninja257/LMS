const asyncHandler = require('express-async-handler');
const ErrorResponse = require('../utils/errorResponse');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  let query = Course.find().populate('createdBy', 'firstName lastName profileImage');

  // Log user info for debugging
  console.log('User:', req.user ? { id: req.user.id, role: req.user.role } : 'Unauthenticated');

  // For unauthenticated users, show only published courses
  if (!req.user) {
    query = query.where({ isPublished: true });
  } else {
    // Restrict courses for instructors to their own
    if (req.user.role === 'instructor') {
      query = query.where({ createdBy: new mongoose.Types.ObjectId(req.user.id) });
    }
    // Admins see all courses (no additional filter)
  }

  // Apply filters from query parameters
  if (req.query.category) {
    query = query.where({ category: req.query.category });
  }

  if (req.query.level) {
    query = query.where({ level: req.query.level });
  }

  if (req.query.isPublished !== undefined && req.user && req.user.role !== 'student') {
    const isPublished = req.query.isPublished === 'true';
    query = query.where({ isPublished });
  }

  if (req.query.searchTitle) {
    query = query.where({ title: { $regex: req.query.searchTitle, $options: 'i' } });
  }

  if (req.query.searchAuthor) {
    query = query.where({
      $or: [
        { 'createdBy.firstName': { $regex: req.query.searchAuthor, $options: 'i' } },
        { 'createdBy.lastName': { $regex: req.query.searchAuthor, $options: 'i' } },
      ],
    });
  }

  // Apply advancedResults middleware for pagination and sorting
  const results = res.advancedResults;

  // Log query before execution
  console.log('Query filters:', query.getFilter());

  const courses = await query
    .skip(results.skip)
    .limit(results.limit)
    .sort(results.sort);

  // Log courses after query
  console.log('Courses found:', courses.map(c => ({ id: c._id, title: c.title, createdBy: c.createdBy })));

  res.status(200).json({
    success: true,
    count: courses.length,
    total: results.total,
    data: courses,
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
    req.body.status = 'Draft';

    // Auto-set Published status for admins
    if (req.user.role === 'admin') {
      req.body.status = 'Published';
      req.body.isPublished = true;
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

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor, Admin)
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

// @desc    Submit course for approval
// @route   PUT /api/courses/:id/submit
// @access  Private (Instructor)
exports.submitCourseForApproval = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  if (course.createdBy.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to submit this course`, 401));
  }

  if (course.status !== 'Draft') {
    return next(new ErrorResponse('Only draft courses can be submitted for approval', 400));
  }

  course.status = 'Pending';
  await course.save();

  res.status(200).json({
    success: true,
    data: course,
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

  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Only admins can approve courses', 401));
  }

  if (course.status !== 'Pending') {
    return next(new ErrorResponse('Only pending courses can be approved', 400));
  }

  course.status = 'Published';
  course.isPublished = true;
  course.approvedBy = req.user.id;
  await course.save();

  // Send notification to instructor
  await Notification.create({
    user: course.createdBy,
    title: 'Course Approved',
    message: `Course "${course.title}" has been approved.`,
    type: 'success',
    relatedTo: { model: 'Course', id: course._id },
  });

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc    Reject course
// @route   PUT /api/courses/:id/reject
// @access  Private (Admin)
exports.rejectCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Only admins can reject courses', 401));
  }

  if (course.status !== 'Pending') {
    return next(new ErrorResponse('Only pending courses can be rejected', 400));
  }

  if (!req.body.rejectionReason) {
    return next(new ErrorResponse('Rejection reason is required', 400));
  }

  course.status = 'Draft';
  course.rejectionReason = req.body.rejectionReason;
  await course.save();

  // Send notification to instructor
  await Notification.create({
    user: course.createdBy,
    title: 'Course Rejected',
    message: `Course "${course.title}" has been rejected: ${req.body.rejectionReason}`,
    type: 'error',
    relatedTo: { model: 'Course', id: course._id },
  });

  res.status(200).json({
    success: true,
    data: course,
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

  if (course.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to publish this course`, 401));
  }

  if (course.status !== 'Published' && req.user.role !== 'admin') {
    return next(new ErrorResponse('Course must be approved before publishing', 400));
  }

  course.isPublished = req.body.isPublished;
  await course.save();

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc    Enroll in course
// @route   PUT /api/courses/:id/enroll
// @access  Private (Student)
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

// @desc    Unenroll from course
// @route   PUT /api/courses/:id/unenroll
// @access  Private (Student)
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

// @desc    Get enrolled courses
// @route   GET /api/courses/enrolled
// @access  Private (Student)
exports.getEnrolledCourses = asyncHandler(async (req, res, next) => {
  const courses = await Course.find({ enrolledUsers: req.user.id })
    .populate('createdBy', 'firstName lastName profileImage');

  res.status(200).json({ success: true, data: courses });
});

// @desc    Upload course image
// @route   PUT /api/courses/:id/image
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

  if (course.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this course', 401));
  }

  await course.deleteOne();

  res.status(200).json({ success: true, data: {} });
});