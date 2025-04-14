const express = require('express');
const {
  getLessons,
  createLesson
} = require('../controllers/lessonController');

// Include auth middleware
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleAccess');

const router = express.Router({ mergeParams: true });

// Get all lessons for a course (public if course is published)
router.route('/')
  .get(getLessons)
  .post(protect, authorize('instructor', 'admin'), createLesson);

module.exports = router;