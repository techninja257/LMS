const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Lesson = require('../models/Lesson');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const generateCertificate = require('../utils/certificateGen');

// @desc    Generate course completion certificate
// @route   POST /api/courses/:courseId/certificate
// @access  Private
exports.generateCertificate = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);
  
  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
  }
  
  // Check if user is enrolled in the course
  const enrollment = await Enrollment.findOne({
    user: req.user.id,
    course: req.params.courseId
  });
  
  if (!enrollment) {
    return next(new ErrorResponse(`You are not enrolled in this course`, 403));
  }
  
  // Check if course is completed (100%)
  if (enrollment.completionPercentage < 100) {
    return next(new ErrorResponse(`You must complete the course before getting a certificate`, 400));
  }
  
  // Check if certificate already exists
  if (enrollment.certificateIssued && enrollment.certificateUrl) {
    return res.status(200).json({
      success: true,
      message: 'Certificate already generated',
      data: {
        certificateUrl: enrollment.certificateUrl
      }
    });
  }
  
  // Generate the certificate
  const certificateData = {
    userName: `${req.user.firstName} ${req.user.lastName}`,
    courseName: course.title,
    completionDate: new Date(enrollment.completionDate || Date.now()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    userId: req.user.id,
    courseId: course._id
  };
  
  try {
    const certificateUrl = await generateCertificate(certificateData);
    
    // Update enrollment with certificate info
    enrollment.certificateIssued = true;
    enrollment.certificateUrl = certificateUrl;
    enrollment.certificateDate = Date.now();
    await enrollment.save();
    
    res.status(200).json({
      success: true,
      data: {
        certificateUrl
      }
    });
  } catch (err) {
    console.error('Certificate generation error:', err);
    return next(new ErrorResponse('Error generating certificate', 500));
  }
});

// @desc    Verify certificate
// @route   GET /api/certificates/verify/:userId/:courseId
// @access  Public
exports.verifyCertificate = asyncHandler(async (req, res, next) => {
  const { userId, courseId } = req.params;
  
  // Find enrollment with certificate
  const enrollment = await Enrollment.findOne({
    user: userId,
    course: courseId,
    certificateIssued: true
  }).populate({
    path: 'user',
    select: 'firstName lastName email'
  }).populate({
    path: 'course',
    select: 'title category level'
  });
  
  if (!enrollment) {
    return next(new ErrorResponse('Certificate not found or not issued', 404));
  }
  
  res.status(200).json({
    success: true,
    data: {
      verified: true,
      certificate: {
        user: {
          name: `${enrollment.user.firstName} ${enrollment.user.lastName}`,
          id: enrollment.user._id
        },
        course: {
          title: enrollment.course.title,
          id: enrollment.course._id,
          level: enrollment.course.level
        },
        issueDate: enrollment.certificateDate || enrollment.completionDate,
        certificateUrl: enrollment.certificateUrl
      }
    }
  });
});