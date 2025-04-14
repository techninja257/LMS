const express = require('express');
const {
  getQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz
} = require('../controllers/quizController');

// Include auth middleware
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleAccess');

const router = express.Router();

// Public routes - none for individual quizzes

// Protected routes
router.use(protect);

router.route('/:id')
  .get(getQuiz)
  .put(authorize('instructor', 'admin'), updateQuiz)
  .delete(authorize('instructor', 'admin'), deleteQuiz);

router.route('/:id/submit')
  .post(submitQuiz);

module.exports = router;