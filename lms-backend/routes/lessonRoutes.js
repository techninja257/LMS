const express = require('express');
const {
  getLesson,
  updateLesson,
  deleteLesson,
  uploadLessonMaterial,
  completeLesson
} = require('../controllers/lessonController');

// Include auth middleware
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/roleAccess');

// Include file upload middleware
const cloudStorage = require('../config/cloudStorage');

const router = express.Router();

// Public routes - none for individual lessons

// Protected routes
router.use(protect);

router.route('/:id')
  .get(getLesson)
  .put(authorize('instructor', 'admin'), updateLesson)
  .delete(authorize('instructor', 'admin'), deleteLesson);

router.route('/:id/material')
  .put(
    authorize('instructor', 'admin'),
    cloudStorage.upload.lessonMaterial.single('file'),
    uploadLessonMaterial
  );

router.route('/:id/complete')
  .put(completeLesson);

module.exports = router;