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
// @access  Private/Instructor,Admin
exports.createCourse = asyncHandler(async (req, res, next) => {
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
});

// @desc    Submit course for approval
// @route   PUT /api/courses/:id/submit
// @access  Private/Instructor
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

// @desc    Publish course
// @route   PUT /api/courses/:id/publish
// @access  Private/Instructor,Admin
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