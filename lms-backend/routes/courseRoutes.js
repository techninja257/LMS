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

router.route('/:id/submit')
.put(protect, authorize('instructor'), submitCourseForApproval);

router.route('/:id/publish')
.put(protect, authorize('instructor', 'admin'), publishCourse);

// Protected routes
router.use(protect);

// Temporary POST handler for debugging
router.route('/')
  .post(authorize('instructor', 'admin'), async (req, res, next) => {
    try {
      // Log received data
      console.log('Received body:', req.body);
      console.log('Received file:', req.file);

      // Construct course data
      const courseData = {
        title: req.body.title,
        description: req.body.description,
        summary: req.body.shortDescription || '',
        category: req.body.category, // Ensure this matches schema's enum (e.g., 'Web Development')
        level: req.body.level.charAt(0).toUpperCase() + req.body.level.slice(1), // Capitalize level
        duration: Number(req.body.duration),
        price: Number(req.body.price) || 0,
        isPublished: req.body.isPublished === 'true' || false,
        author: req.user._id, // From protect middleware
        coverImage: req.file ? 'uploaded-image.jpg' : 'default-course.jpg', // Placeholder
        language: req.body.language || 'English',
        isFree: req.body.isFree === 'true' || false,
        isPremium: req.body.isPremium === 'true' || false,
        prerequisites: req.body.prerequisites ? JSON.parse(req.body.prerequisites) : [],
        learningObjectives: req.body.learningObjectives ? JSON.parse(req.body.learningObjectives) : [],
        modules: req.body.modules ? JSON.parse(req.body.modules) : []
      };

      // Log course data before saving
      console.log('Course data to save:', courseData);

      const course = await Course.create(courseData);
      res.status(201).json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  });

router.route('/enrolled')
  .get(getEnrolledCourses);

router.route('/:id/enroll')
  .post(enrollCourse)
  .delete(unenrollCourse);

router.route('/:id')
  .put(authorize('instructor', 'admin'), updateCourse)
  .delete(authorize('instructor', 'admin'), deleteCourse);

router.route('/:id/photo')
  .put(
    authorize('instructor', 'admin'),
    cloudStorage.upload.courseImage.single('file'),
    uploadCourseImage
  );

router.route('/:id/approve')
  .put(authorize('admin'), approveCourse);

module.exports = router;