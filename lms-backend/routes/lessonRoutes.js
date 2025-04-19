const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { createLesson, uploadMaterial, getCourseLessons, completeLesson } = require('../controllers/lessonController');

// Log to verify imports
console.log('Imported lessonController in lessonRoutes:', {
  createLesson: typeof createLesson,
  uploadMaterial: typeof uploadMaterial,
  getCourseLessons: typeof getCourseLessons,
  completeLesson: typeof completeLesson
});

// Course-specific lesson routes
router.post('/courses/:courseId/lessons', auth, createLesson);
router.get('/courses/:courseId/lessons', auth, getCourseLessons);

// Lesson-specific routes
router.post('/:lessonId/material', auth, upload.single('file'), uploadMaterial);
router.patch('/:lessonId/complete', auth, completeLesson);

module.exports = router;