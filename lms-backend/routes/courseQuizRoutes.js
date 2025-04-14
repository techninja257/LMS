const express = require('express');
const {
  getQuizzes,
  createQuiz
} = require('../controllers/quizController');

// Include auth middleware
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleAccess');

const router = express.Router({ mergeParams: true });

// Get all quizzes for a course (public if course is published)
router.route('/')
  .get(getQuizzes)
  .post(protect, authorize('instructor', 'admin'), createQuiz);

module.exports = router;