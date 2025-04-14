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
  approveCourse
} = require('../controllers/courseController');

// Include advanced results middleware
const advancedResults = require('../middleware/advancedResults');
const Course = require('../models/Course');

// Include auth middleware
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleAccess');

// Include file upload middleware
const cloudStorage = require('../config/cloudStorage');

const router = express.Router();

// Public routes
router.route('/')
  .get(advancedResults(Course, [
    { path: 'author', select: 'firstName lastName' }
  ]), getCourses);

router.route('/:id')
  .get(getCourse);

// Protected routes
router.use(protect);

// Enrollment routes
router.route('/enrolled')
  .get(getEnrolledCourses);

router.route('/:id/enroll')
  .post(enrollCourse)
  .delete(unenrollCourse);

// Course creation/management routes (instructors and admins only)
router.route('/')
  .post(authorize('instructor', 'admin'), createCourse);

router.route('/:id')
  .put(authorize('instructor', 'admin'), updateCourse)
  .delete(authorize('instructor', 'admin'), deleteCourse);

router.route('/:id/photo')
  .put(
    authorize('instructor', 'admin'),
    cloudStorage.upload.courseImage.single('file'),
    uploadCourseImage
  );

// Admin only routes
router.route('/:id/approve')
  .put(authorize('admin'), approveCourse);

module.exports = router;