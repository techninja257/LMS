const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all quizzes for a course
// @route   GET /api/courses/:courseId/quizzes
// @access  Public/Private (depending on course)
exports.getQuizzes = asyncHandler(async (req, res, next) => {
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
    return next(new ErrorResponse(`Course not published or you're not authorized to access its quizzes`, 403));
  }
  
  // Get all quizzes for the course
  const quizzes = await Quiz.find({ course: req.params.courseId })
    .populate({
      path: 'lesson',
      select: 'title order'
    });
  
  // For non-admin/instructor users, hide correct answers
  if (req.user && req.user.role !== 'admin' && req.user.role !== 'instructor') {
    const sanitizedQuizzes = quizzes.map(quiz => {
      const quizObj = quiz.toObject();
      
      // Remove correct answers from questions
      if (quizObj.questions) {
        quizObj.questions = quizObj.questions.map(question => {
          const { correctAnswer, ...sanitizedQuestion } = question;
          return sanitizedQuestion;
        });
      }
      
      return quizObj;
    });
    
    res.status(200).json({
      success: true,
      count: sanitizedQuizzes.length,
      data: sanitizedQuizzes
    });
  } else {
    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  }
});

// @desc    Get single quiz
// @route   GET /api/quizzes/:id
// @access  Public/Private (depending on course)
exports.getQuiz = asyncHandler(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id)
    .populate({
      path: 'course',
      select: 'title isPublished author'
    })
    .populate({
      path: 'lesson',
      select: 'title order'
    });
  
  if (!quiz) {
    return next(new ErrorResponse(`Quiz not found with id of ${req.params.id}`, 404));
  }
  
  // Check if course is published or user is authorized
  if (!quiz.course.isPublished && 
      (!req.user || 
       (req.user.role !== 'admin' && 
        req.user.role !== 'instructor' && 
        req.user.id !== quiz.course.author.toString()))) {
    return next(new ErrorResponse(`Course not published or you're not authorized to access this quiz`, 403));
  }
  
  // For non-admin/instructor users, hide correct answers
  if (req.user && req.user.role !== 'admin' && req.user.role !== 'instructor') {
    const quizObj = quiz.toObject();
    
    // Remove correct answers from questions
    if (quizObj.questions) {
      quizObj.questions = quizObj.questions.map(question => {
        const { correctAnswer, ...sanitizedQuestion } = question;
        return sanitizedQuestion;
      });
    }
    
    // Check if user has already taken this quiz
    if (req.user.role === 'student') {
      const enrollment = await Enrollment.findOne({
        user: req.user.id,
        course: quiz.course._id
      });
      
      if (enrollment) {
        // Find the quiz attempt in the enrollment
        const quizAttempt = enrollment.quizScores.find(
          score => score.quiz.toString() === quiz._id.toString()
        );
        
        if (quizAttempt) {
          quizObj.userScore = {
            score: quizAttempt.score,
            maxScore: quizAttempt.maxScore,
            passed: quizAttempt.passed,
            attemptDate: quizAttempt.attemptDate
          };
        }
      }
    }
    
    res.status(200).json({
      success: true,
      data: quizObj
    });
  } else {
    res.status(200).json({
      success: true,
      data: quiz
    });
  }
});

// @desc    Create new quiz
// @route   POST /api/courses/:courseId/quizzes
// @access  Private/Instructor,Admin
exports.createQuiz = asyncHandler(async (req, res, next) => {
  req.body.course = req.params.courseId;
  
  const course = await Course.findById(req.params.courseId);
  
  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
  }
  
  // Make sure user is course author or admin
  if (course.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a quiz to this course`, 401));
  }
  
  // If lesson ID is provided, verify it belongs to the course
  if (req.body.lesson) {
    const lesson = await Lesson.findById(req.body.lesson);
    
    if (!lesson) {
      return next(new ErrorResponse(`Lesson not found with id of ${req.body.lesson}`, 404));
    }
    
    if (lesson.course.toString() !== req.params.courseId) {
      return next(new ErrorResponse(`Lesson does not belong to this course`, 400));
    }
  }
  
  const quiz = await Quiz.create(req.body);
  
  res.status(201).json({
    success: true,
    data: quiz
  });
});

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private/Instructor,Admin
exports.updateQuiz = asyncHandler(async (req, res, next) => {
  let quiz = await Quiz.findById(req.params.id);
  
  if (!quiz) {
    return next(new ErrorResponse(`Quiz not found with id of ${req.params.id}`, 404));
  }
  
  const course = await Course.findById(quiz.course);
  
  // Make sure user is course author or admin
  if (course.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this quiz`, 401));
  }
  
  // If lesson ID is being updated, verify it belongs to the course
  if (req.body.lesson && req.body.lesson !== quiz.lesson) {
    const lesson = await Lesson.findById(req.body.lesson);
    
    if (!lesson) {
      return next(new ErrorResponse(`Lesson not found with id of ${req.body.lesson}`, 404));
    }
    
    if (lesson.course.toString() !== course._id.toString()) {
      return next(new ErrorResponse(`Lesson does not belong to this course`, 400));
    }
  }
  
  quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: quiz
  });
});

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private/Instructor,Admin
exports.deleteQuiz = asyncHandler(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id);
  
  if (!quiz) {
    return next(new ErrorResponse(`Quiz not found with id of ${req.params.id}`, 404));
  }
  
  const course = await Course.findById(quiz.course);
  
  // Make sure user is course author or admin
  if (course.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this quiz`, 401));
  }
  
  // Remove quiz attempts from enrollments
  await Enrollment.updateMany(
    { 'quizScores.quiz': quiz._id },
    { $pull: { quizScores: { quiz: quiz._id } } }
  );
  
  await quiz.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Submit quiz attempt
// @route   POST /api/quizzes/:id/submit
// @access  Private
exports.submitQuiz = asyncHandler(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id);
  
  if (!quiz) {
    return next(new ErrorResponse(`Quiz not found with id of ${req.params.id}`, 404));
  }
  
  // Check if user is enrolled in the course
  const enrollment = await Enrollment.findOne({
    user: req.user.id,
    course: quiz.course
  });
  
  if (!enrollment) {
    return next(new ErrorResponse(`You are not enrolled in this course`, 403));
  }
  
  // Check if user has attempts left
  const previousAttempts = enrollment.quizScores.filter(
    score => score.quiz.toString() === quiz._id.toString()
  );
  
  if (previousAttempts.length >= quiz.maxAttempts && !quiz.allowRetake) {
    return next(new ErrorResponse(`You have exceeded the maximum number of attempts for this quiz`, 403));
  }
  
  // Calculate score
  let score = 0;
  let maxScore = 0;
  
  // Check answers against correct answers
  const answers = req.body.answers || [];
  
  quiz.questions.forEach((question, index) => {
    maxScore += question.points;
    
    // Skip if no answer provided for this question
    if (!answers[index]) return;
    
    const userAnswer = answers[index];
    
    // Check if answer is correct based on question type
    if (question.questionType === 'multiple-choice' || question.questionType === 'true-false') {
      if (userAnswer === question.correctAnswer) {
        score += question.points;
      }
    } else if (question.questionType === 'fill-in-blank') {
      // Case insensitive comparison for fill-in-blank
      if (typeof userAnswer === 'string' && 
          typeof question.correctAnswer === 'string' && 
          userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
        score += question.points;
      }
    }
  });
  
  // Calculate percentage score
  const percentage = (score / maxScore) * 100;
  const passed = percentage >= quiz.passingScore;
  
  // Create quiz attempt record
  const quizAttempt = {
    quiz: quiz._id,
    score,
    maxScore,
    passed,
    attemptDate: Date.now()
  };
  
  // Add to enrollment's quizScores array
  enrollment.quizScores.push(quizAttempt);
  await enrollment.save();
  
  res.status(200).json({
    success: true,
    data: {
      score,
      maxScore,
      percentage,
      passed,
      passingScore: quiz.passingScore
    }
  });
});