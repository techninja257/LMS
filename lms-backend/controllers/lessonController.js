const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const Enrollment = require('../models/Enrollment');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const cloudStorage = require('../config/cloudStorage');

// @desc    Get all lessons for a course
// @route   GET /api/courses/:courseId/lessons
// @access  Public/Private (depending on course)
exports.getLessons = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);
  
  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
  }
  
  // Check if course is published or user is authorized
  if (!course.isPublished && 
      (!req.user || 
       (req.user.role !== 'admin' && 
        req.user.role !== 'instructor' && 
        req.user.id !== course.author.toString()))) {
    return next(new ErrorResponse(`Course not published or you're not authorized to access its lessons`, 403));
  }
  
  // Get all lessons for the course
  let lessons = await Lesson.find({ course: req.params.courseId }).sort('order');
  
  // If user is enrolled, get their progress for each lesson
  if (req.user) {
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.courseId
    });
    
    if (enrollment) {
      // Get progress for all lessons
      const progressRecords = await Progress.find({
        user: req.user.id,
        course: req.params.courseId
      });
      
      // Map progress to lessons
      lessons = lessons.map(lesson => {
        const lessonObj = lesson.toObject();
        const progress = progressRecords.find(
          record => record.lesson.toString() === lesson._id.toString()
        );
        
        lessonObj.progress = progress ? {
          status: progress.status,
          completionDate: progress.completionDate
        } : {
          status: 'not-started',
          completionDate: null
        };
        
        return lessonObj;
      });
    }
  }
  
  res.status(200).json({
    success: true,
    count: lessons.length,
    data: lessons
  });
});

// @desc    Get single lesson
// @route   GET /api/lessons/:id
// @access  Public/Private (depending on course)
exports.getLesson = asyncHandler(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id).populate({
    path: 'course',
    select: 'title isPublished author'
  });
  
  if (!lesson) {
    return next(new ErrorResponse(`Lesson not found with id of ${req.params.id}`, 404));
  }
  
  // Check if course is published or user is authorized
  if (!lesson.course.isPublished && 
      (!req.user || 
       (req.user.role !== 'admin' && 
        req.user.role !== 'instructor' && 
        req.user.id !== lesson.course.author.toString()))) {
    return next(new ErrorResponse(`Course not published or you're not authorized to access this lesson`, 403));
  }
  
  // If user is enrolled, check if previous lessons are completed
  if (req.user && req.user.role === 'student') {
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: lesson.course._id
    });
    
    if (enrollment) {
      // Get the lesson's order
      const lessonOrder = lesson.order;
      
      // If not the first lesson, check if previous lesson is completed
      if (lessonOrder > 1) {
        // Find previous lesson
        const prevLesson = await Lesson.findOne({
          course: lesson.course._id,
          order: lessonOrder - 1
        });
        
        if (prevLesson) {
          // Check if previous lesson is completed
          const prevProgress = await Progress.findOne({
            user: req.user.id,
            course: lesson.course._id,
            lesson: prevLesson._id
          });
          
          // If previous lesson exists but not completed, block access
          if (!prevProgress || prevProgress.status !== 'completed') {
            return next(new ErrorResponse(`You must complete the previous lesson first`, 403));
          }
        }
      }
      
      // Get or create progress for this lesson
      let progress = await Progress.findOne({
        user: req.user.id,
        course: lesson.course._id,
        lesson: lesson._id
      });
      
      if (!progress) {
        progress = await Progress.create({
          user: req.user.id,
          course: lesson.course._id,
          lesson: lesson._id,
          status: 'in-progress'
        });
      } else if (progress.status === 'not-started') {
        // Update status to in-progress if they're viewing the lesson for the first time
        progress.status = 'in-progress';
        await progress.save();
      }
      
      // Attach progress to lesson
      const lessonObj = lesson.toObject();
      lessonObj.progress = {
        id: progress._id,
        status: progress.status,
        completionDate: progress.completionDate
      };
      
      res.status(200).json({
        success: true,
        data: lessonObj
      });
    } else {
      // If not enrolled, just return the lesson info
      res.status(200).json({
        success: true,
        data: lesson
      });
    }
  } else {
    // For non-student users, just return the lesson
    res.status(200).json({
      success: true,
      data: lesson
    });
  }
});

// @desc    Create new lesson
// @route   POST /api/courses/:courseId/lessons
// @access  Private/Instructor,Admin
exports.createLesson = asyncHandler(async (req, res, next) => {
  req.body.course = req.params.courseId;
  
  const course = await Course.findById(req.params.courseId);
  
  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
  }
  
  // Make sure user is course author or admin
  if (course.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a lesson to this course`, 401));
  }
  
  // Get count of existing lessons to set correct order
  const lessonCount = await Lesson.countDocuments({ course: req.params.courseId });
  req.body.order = lessonCount + 1;
  
  const lesson = await Lesson.create(req.body);
  
  res.status(201).json({
    success: true,
    data: lesson
  });
});

// @desc    Update lesson
// @route   PUT /api/lessons/:id
// @access  Private/Instructor,Admin
exports.updateLesson = asyncHandler(async (req, res, next) => {
  let lesson = await Lesson.findById(req.params.id);
  
  if (!lesson) {
    return next(new ErrorResponse(`Lesson not found with id of ${req.params.id}`, 404));
  }
  
  const course = await Course.findById(lesson.course);
  
  // Make sure user is course author or admin
  if (course.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this lesson`, 401));
  }
  
  // Handle order change if specified
  if (req.body.order && req.body.order !== lesson.order) {
    // Get total lesson count
    const lessonCount = await Lesson.countDocuments({ course: lesson.course });
    
    // Validate order range
    if (req.body.order < 1 || req.body.order > lessonCount) {
      return next(new ErrorResponse(`Order must be between 1 and ${lessonCount}`, 400));
    }
    
    // Get current order
    const currentOrder = lesson.order;
    const newOrder = req.body.order;
    
    // Update other lessons' orders
    if (newOrder > currentOrder) {
      // Moving down - decrease order for lessons in between
      await Lesson.updateMany(
        { 
          course: lesson.course,
          order: { $gt: currentOrder, $lte: newOrder }
        },
        { $inc: { order: -1 } }
      );
    } else {
      // Moving up - increase order for lessons in between
      await Lesson.updateMany(
        { 
          course: lesson.course,
          order: { $gte: newOrder, $lt: currentOrder }
        },
        { $inc: { order: 1 } }
      );
    }
  }
  
  lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: lesson
  });
});

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
// @access  Private/Instructor,Admin
exports.deleteLesson = asyncHandler(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id);
  
  if (!lesson) {
    return next(new ErrorResponse(`Lesson not found with id of ${req.params.id}`, 404));
  }
  
  const course = await Course.findById(lesson.course);
  
  // Make sure user is course author or admin
  if (course.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this lesson`, 401));
  }
  
  // Get current order
  const currentOrder = lesson.order;
  
  // Delete lesson
  await lesson.remove();
  
  // Update order of remaining lessons
  await Lesson.updateMany(
    { course: lesson.course, order: { $gt: currentOrder } },
    { $inc: { order: -1 } }
  );
  
  // Delete associated progress records
  await Progress.deleteMany({ lesson: lesson._id });
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Upload lesson materials (pdf/video)
// @route   PUT /api/lessons/:id/material
// @access  Private/Instructor,Admin
exports.uploadLessonMaterial = asyncHandler(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id);
  
  if (!lesson) {
    return next(new ErrorResponse(`Lesson not found with id of ${req.params.id}`, 404));
  }
  
  const course = await Course.findById(lesson.course);
  
  // Make sure user is course author or admin
  if (course.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this lesson`, 401));
  }
  
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }
  
  // Update lesson with file info based on content type
  const fileType = req.file.mimetype.split('/')[0];
  const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
  
  if (fileType === 'video') {
    // Delete previous video if exists
    if (lesson.video && lesson.video.url) {
      await cloudStorage.deleteFile(lesson.video.url);
    }
    
    lesson.contentType = 'video';
    lesson.video = {
      url: req.file.location,
      duration: req.body.duration || 0 // Duration should be provided in minutes
    };
  } else if (fileExtension === 'pdf' || fileType === 'application') {
    // Delete previous PDF if exists
    if (lesson.pdf && lesson.pdf.url) {
      await cloudStorage.deleteFile(lesson.pdf.url);
    }
    
    lesson.contentType = 'pdf';
    lesson.pdf = {
      url: req.file.location,
      pageCount: req.body.pageCount || 0
    };
  } else {
    return next(new ErrorResponse(`Unsupported file type: ${fileType}/${fileExtension}`, 400));
  }
  
  await lesson.save();
  
  res.status(200).json({
    success: true,
    data: lesson
  });
});

// @desc    Mark lesson as completed
// @route   PUT /api/lessons/:id/complete
// @access  Private
exports.completeLesson = asyncHandler(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id);
  
  if (!lesson) {
    return next(new ErrorResponse(`Lesson not found with id of ${req.params.id}`, 404));
  }
  
  // Check if user is enrolled in the course
  const enrollment = await Enrollment.findOne({
    user: req.user.id,
    course: lesson.course
  });
  
  if (!enrollment) {
    return next(new ErrorResponse(`You are not enrolled in this course`, 403));
  }
  
  // Update or create progress record
  let progress = await Progress.findOne({
    user: req.user.id,
    course: lesson.course,
    lesson: lesson._id
  });
  
  if (!progress) {
    progress = await Progress.create({
      user: req.user.id,
      course: lesson.course,
      lesson: lesson._id,
      status: 'completed',
      completionDate: Date.now()
    });
  } else {
    progress.status = 'completed';
    progress.completionDate = Date.now();
    await progress.save();
  }
  
  res.status(200).json({
    success: true,
    data: progress
  });
});