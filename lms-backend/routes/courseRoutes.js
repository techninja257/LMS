const express = require('express');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  uploadCourseImage,
  enrollCourse,
  unenrollCourse,
  getEnrolledCourses,
  approveCourse,
  submitCourseForApproval,
  publishCourse
} = require('../controllers/courseController');

const advancedResults = require('../middleware/advancedResults');
const Course = require('../models/Course');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleAccess');
const cloudStorage = require('../config/cloudStorage');

const router = express.Router();

// Public routes
router.route('/')
  .get(advancedResults(Course, [
    { path: 'author', select: 'firstName lastName' }
  ]), getCourses);

router.route('/:id').get(getCourse);

// Require authentication below this line
router.use(protect);

// Course creation
router.route('/')
  .post(authorize('instructor', 'admin'), createCourse);

// Enrolled courses for current user
router.route('/enrolled')
  .get(getEnrolledCourses);

// Enroll/Unenroll in a course
router.route('/:id/enroll')
  .post(enrollCourse)
  .delete(unenrollCourse);

// Course updates
router.route('/:id')
  .put(authorize('instructor', 'admin'), updateCourse)
  .delete(authorize('instructor', 'admin'), deleteCourse);

// Submit course for approval
router.route('/:id/submit')
  .put(authorize('instructor'), submitCourseForApproval);

// Approve course (admin only)
router.route('/:id/approve')
  .put(authorize('admin'), approveCourse);

// Publish course
router.route('/:id/publish')
  .put(authorize('instructor', 'admin'), publishCourse);

// Upload course image
router.route('/:id/photo')
  .put(
    authorize('instructor', 'admin'),
    cloudStorage.upload.courseImage.single('file'),
    uploadCourseImage
  );

module.exports = router;
